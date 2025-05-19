import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  createAcademicDate, 
  updateAcademicDate, 
  deleteAcademicDate 
} from '../../features/calendar/calendarSlice';
import { formatDate } from '../../utils/calendarUtils';

const AcademicDates = ({ academicDates }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    description: '',
    type: 'holiday',
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dateToDelete, setDateToDelete] = useState(null);

  // Check if user is admin
  const isAdmin = user && user.user.role === 'admin';

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      date,
    }));
  };

  // Open dialog for creating a new academic date
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      title: '',
      date: new Date(),
      description: '',
      type: 'holiday',
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an academic date
  const handleOpenEditDialog = (date) => {
    setDialogMode('edit');
    setSelectedDate(date);
    setFormData({
      title: date.title,
      date: new Date(date.date),
      description: date.description || '',
      type: date.type || 'holiday',
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDate(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    const dateData = {
      ...formData,
      date: formData.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    };

    if (dialogMode === 'create') {
      dispatch(createAcademicDate(dateData));
    } else {
      dispatch(updateAcademicDate({
        id: selectedDate._id,
        dateData,
      }));
    }

    handleCloseDialog();
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (date) => {
    setDateToDelete(date);
    setOpenDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDateToDelete(null);
  };

  // Handle academic date deletion
  const handleDeleteDate = () => {
    if (dateToDelete) {
      dispatch(deleteAcademicDate(dateToDelete._id));
      handleCloseDeleteDialog();
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'holiday':
        return '#f44336';
      case 'exam':
        return '#ff9800';
      case 'registration':
        return '#2196f3';
      case 'other':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Academic Calendar</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Date
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {academicDates.length > 0 ? (
        <List>
          {academicDates
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((date) => (
              <ListItem
                key={date._id}
                sx={{
                  borderLeft: `4px solid ${getTypeColor(date.type)}`,
                  mb: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <ListItemText
                  primary={date.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {formatDate(date.date)}
                      </Typography>
                      {date.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {date.description}
                        </Typography>
                      )}
                    </>
                  }
                />
                {isAdmin && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenEditDialog(date)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleOpenDeleteDialog(date)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
        </List>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
          No academic dates found.
        </Typography>
      )}

      {/* Create/Edit Academic Date Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add Academic Date' : 'Edit Academic Date'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  required
                >
                  <MenuItem value="holiday">Holiday</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="registration">Registration</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.title || !formData.date}
          >
            {dialogMode === 'create' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the academic date "{dateToDelete?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteDate} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AcademicDates;

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SaveIcon from '@mui/icons-material/Save';
import { createAssignment, updateAssignment, reset } from '../../features/assignments/assignmentSlice';

const AssignmentForm = ({ courses, assignment = null, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.assignments
  );

  // Local state
  const [title, setTitle] = useState(assignment?.title || '');
  const [description, setDescription] = useState(assignment?.description || '');
  const [course, setCourse] = useState(assignment?.course?._id || '');
  const [dueDate, setDueDate] = useState(assignment?.dueDate ? new Date(assignment.dueDate) : new Date());
  const [points, setPoints] = useState(assignment?.points || 100);
  const [status, setStatus] = useState(assignment?.status || 'draft');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [errors, setErrors] = useState({});

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = {};
    
    if (!title) {
      validationErrors.title = 'Title is required';
    } else if (title.length < 3) {
      validationErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!description) {
      validationErrors.description = 'Description is required';
    } else if (description.length < 10) {
      validationErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!course) {
      validationErrors.course = 'Course is required';
    }
    
    if (!dueDate) {
      validationErrors.dueDate = 'Due date is required';
    } else if (dueDate < new Date() && status === 'published') {
      validationErrors.dueDate = 'Due date cannot be in the past for published assignments';
    }
    
    if (points === undefined || points === null) {
      validationErrors.points = 'Points are required';
    } else if (isNaN(Number(points))) {
      validationErrors.points = 'Points must be a number';
    } else if (Number(points) < 0) {
      validationErrors.points = 'Points cannot be negative';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Create assignment data
    const assignmentData = {
      title,
      description,
      course,
      dueDate: dueDate.toISOString(),
      points: Number(points),
      status,
    };
    
    if (assignment) {
      // Update existing assignment
      dispatch(updateAssignment({
        id: assignment._id,
        assignmentData,
      }));
    } else {
      // Create new assignment
      dispatch(createAssignment(assignmentData));
    }
  };

  // Handle success/error messages
  useState(() => {
    if (isSuccess) {
      setSnackbarMessage(
        assignment
          ? 'Assignment updated successfully'
          : 'Assignment created successfully'
      );
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Reset form if creating new assignment
      if (!assignment) {
        setTitle('');
        setDescription('');
        setCourse('');
        setDueDate(new Date());
        setPoints(100);
        setStatus('draft');
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      dispatch(reset());
    }
    
    if (isError) {
      setSnackbarMessage(message || 'Failed to save assignment');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, assignment, onSuccess]);

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {assignment ? 'Edit Assignment' : 'Create Assignment'}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.course}>
              <InputLabel>Course</InputLabel>
              <Select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                label="Course"
                required
              >
                <MenuItem value="">
                  <em>Select a course</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.course && (
                <FormHelperText>{errors.course}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date"
                value={dueDate}
                onChange={(newDate) => setDueDate(newDate)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.dueDate}
                    helperText={errors.dueDate}
                    required
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              error={!!errors.points}
              helperText={errors.points}
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
                required
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              required
              multiline
              rows={6}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isLoading
                ? assignment
                  ? 'Updating...'
                  : 'Creating...'
                : assignment
                ? 'Update Assignment'
                : 'Create Assignment'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AssignmentForm;

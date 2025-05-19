import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { format } from 'date-fns';
import { deleteAssignment } from '../../features/assignments/assignmentSlice';

const AssignmentList = ({ assignments, onEdit, onView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.assignments);
  
  // Local state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP p');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'published':
        return 'success';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get due date color
  const getDueDateColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      return 'error';
    } else if (due < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAssignment(null);
  };

  // Handle assignment deletion
  const handleDeleteAssignment = () => {
    if (selectedAssignment) {
      dispatch(deleteAssignment(selectedAssignment._id));
      handleCloseDeleteDialog();
    }
  };

  // Handle view assignment
  const handleViewAssignment = (assignment) => {
    if (onView) {
      onView(assignment);
    } else {
      navigate(`/assignments/${assignment._id}`);
    }
  };

  // Handle edit assignment
  const handleEditAssignment = (assignment) => {
    if (onEdit) {
      onEdit(assignment);
    } else {
      navigate(`/assignments/${assignment._id}/edit`);
    }
  };

  // Check if user can edit/delete an assignment
  const canManageAssignment = (assignment) => {
    return (
      user.user.role === 'admin' ||
      (user.user.role === 'faculty' &&
        (assignment.createdBy._id === user.user.id ||
          (assignment.course.instructor && assignment.course.instructor._id === user.user.id)))
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Assignments
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : assignments.length > 0 ? (
        <List>
          {assignments.map((assignment) => (
            <ListItem
              key={assignment._id}
              sx={{
                border: '1px solid #eee',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">{assignment.title}</Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      {assignment.course.code} - {assignment.course.title}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={`Due: ${formatDate(assignment.dueDate)}`}
                        color={getDueDateColor(assignment.dueDate)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${assignment.points} points`}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={assignment.status}
                        color={getStatusColor(assignment.status)}
                        size="small"
                      />
                    </Box>
                    {assignment.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {assignment.description.length > 100
                          ? `${assignment.description.substring(0, 100)}...`
                          : assignment.description}
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="View">
                  <IconButton
                    edge="end"
                    onClick={() => handleViewAssignment(assignment)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                {canManageAssignment(assignment) && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleEditAssignment(assignment)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(assignment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">No assignments found.</Alert>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the assignment "{selectedAssignment?.title}"?
            This action cannot be undone and will delete all associated files and submissions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAssignment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AssignmentList;

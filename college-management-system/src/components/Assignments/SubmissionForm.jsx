import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { submitAssignment, reset } from '../../features/assignments/assignmentSlice';
import { uploadFile, deleteFile, getAllFiles } from '../../features/files/fileSlice';
import FileUpload from '../Files/FileUpload';

const SubmissionForm = ({ assignment }) => {
  const dispatch = useDispatch();
  const { isLoading: isAssignmentLoading, isSuccess: isAssignmentSuccess, isError: isAssignmentError, message: assignmentMessage } = useSelector(
    (state) => state.assignments
  );
  const { files, isLoading: isFilesLoading, isSuccess: isFilesSuccess } = useSelector(
    (state) => state.files
  );
  
  // Local state
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Get submission files when component mounts
  useEffect(() => {
    if (assignment) {
      // Load submission files
      dispatch(getAllFiles({
        assignment: assignment._id,
        fileType: 'submission',
      }));
      
      // Check if user has already submitted
      const userSubmission = assignment.submissions.find(
        (sub) => sub.student._id === assignment.user.id
      );
      
      if (userSubmission) {
        setSubmissionFiles(userSubmission.files || []);
      }
    }
  }, [dispatch, assignment]);

  // Update submission files when files are loaded
  useEffect(() => {
    if (isFilesSuccess && files.length > 0) {
      // Filter files for this assignment and user
      const userFiles = files.filter(
        (file) => 
          file.assignment === assignment._id && 
          file.fileType === 'submission' &&
          file.uploadedBy._id === assignment.user.id
      );
      
      setSubmissionFiles(userFiles);
    }
  }, [isFilesSuccess, files, assignment]);

  // Handle success/error messages
  useEffect(() => {
    if (isAssignmentSuccess) {
      setSnackbarMessage('Assignment submitted successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setShowUploadForm(false);
      
      dispatch(reset());
    }
    
    if (isAssignmentError) {
      setSnackbarMessage(assignmentMessage || 'Failed to submit assignment');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      
      dispatch(reset());
    }
  }, [isAssignmentSuccess, isAssignmentError, assignmentMessage, dispatch]);

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Handle file upload success
  const handleUploadSuccess = () => {
    // Reload files
    dispatch(getAllFiles({
      assignment: assignment._id,
      fileType: 'submission',
    }));
    
    setShowUploadForm(false);
  };

  // Handle file deletion
  const handleDeleteFile = (fileId) => {
    dispatch(deleteFile(fileId));
    
    // Update local state
    setSubmissionFiles((prevFiles) => 
      prevFiles.filter((file) => file._id !== fileId)
    );
  };

  // Handle assignment submission
  const handleSubmit = () => {
    if (submissionFiles.length === 0) {
      setSnackbarMessage('Please upload at least one file');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    const submissionData = {
      files: submissionFiles.map((file) => file._id),
    };
    
    dispatch(submitAssignment({
      id: assignment._id,
      submissionData,
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP p');
  };

  // Check if assignment is past due
  const isPastDue = () => {
    return new Date(assignment.dueDate) < new Date();
  };

  // Get submission status
  const getSubmissionStatus = () => {
    const userSubmission = assignment.submissions.find(
      (sub) => sub.student._id === assignment.user.id
    );
    
    if (!userSubmission) {
      return isPastDue() ? 'missing' : 'not submitted';
    }
    
    return userSubmission.status;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'success';
      case 'late':
        return 'warning';
      case 'graded':
        return 'info';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Assignment
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {assignment.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Due: {formatDate(assignment.dueDate)}
          {isPastDue() && (
            <Chip
              label="Past Due"
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Status: 
          <Chip
            label={getSubmissionStatus()}
            color={getStatusColor(getSubmissionStatus())}
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        
        {getSubmissionStatus() === 'graded' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Grade: {assignment.submissions.find(sub => sub.student._id === assignment.user.id)?.grade} / {assignment.points}
            </Typography>
            <Typography variant="body2">
              Feedback: {assignment.submissions.find(sub => sub.student._id === assignment.user.id)?.feedback || 'No feedback provided'}
            </Typography>
          </Box>
        )}
      </Box>
      
      {isFilesLoading || isAssignmentLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Your Files
          </Typography>
          
          {submissionFiles.length > 0 ? (
            <List>
              {submissionFiles.map((file) => (
                <ListItem
                  key={file._id}
                  sx={{
                    border: '1px solid #eee',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded ${formatDate(file.createdAt)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteFile(file._id)}
                      disabled={getSubmissionStatus() === 'graded'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No files uploaded yet.
            </Alert>
          )}
          
          {showUploadForm ? (
            <FileUpload
              assignment={assignment._id}
              fileType="submission"
              onUploadSuccess={handleUploadSuccess}
            />
          ) : (
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => setShowUploadForm(true)}
              sx={{ mt: 2, mb: 3 }}
              disabled={getSubmissionStatus() === 'graded'}
            >
              Upload File
            </Button>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={
                submissionFiles.length === 0 ||
                isAssignmentLoading ||
                getSubmissionStatus() === 'graded'
              }
            >
              {isAssignmentLoading
                ? 'Submitting...'
                : isPastDue()
                ? 'Submit Late'
                : 'Submit Assignment'}
            </Button>
          </Box>
        </>
      )}
      
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

export default SubmissionForm;

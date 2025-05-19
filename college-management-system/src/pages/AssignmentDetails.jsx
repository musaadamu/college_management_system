import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { getAssignmentById, gradeSubmission, reset } from '../features/assignments/assignmentSlice';
import { getAllFiles } from '../features/files/fileSlice';
import FileList from '../components/Files/FileList';
import FileUpload from '../components/Files/FileUpload';
import SubmissionForm from '../components/Assignments/SubmissionForm';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assignment-tabpanel-${index}`}
      aria-labelledby={`assignment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedAssignment, isLoading, isError, message } = useSelector(
    (state) => state.assignments
  );
  const { files, isLoading: isFilesLoading } = useSelector(
    (state) => state.files
  );
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [assignmentFiles, setAssignmentFiles] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: '',
  });

  // Load assignment and files when component mounts
  useEffect(() => {
    dispatch(getAssignmentById(id));
    dispatch(getAllFiles({ assignment: id }));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  // Filter files when they are loaded
  useEffect(() => {
    if (files.length > 0) {
      // Filter assignment files (not submissions)
      const assignmentFiles = files.filter(
        (file) => file.assignment === id && file.fileType === 'assignment'
      );
      
      setAssignmentFiles(assignmentFiles);
    }
  }, [files, id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  // Get submission status color
  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'success';
      case 'graded':
        return 'info';
      case 'late':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle file upload success
  const handleUploadSuccess = () => {
    dispatch(getAllFiles({ assignment: id }));
    setShowUploadForm(false);
  };

  // Open grade dialog
  const handleOpenGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || '',
    });
    setOpenGradeDialog(true);
  };

  // Close grade dialog
  const handleCloseGradeDialog = () => {
    setOpenGradeDialog(false);
    setSelectedSubmission(null);
  };

  // Handle grade change
  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle grade submission
  const handleGradeSubmit = () => {
    if (!selectedSubmission) return;
    
    dispatch(gradeSubmission({
      assignmentId: id,
      studentId: selectedSubmission.student._id,
      gradeData,
    }));
    
    handleCloseGradeDialog();
  };

  // Check if user can edit assignment
  const canEditAssignment = () => {
    if (!selectedAssignment) return false;
    
    return (
      user.user.role === 'admin' ||
      (user.user.role === 'faculty' &&
        (selectedAssignment.createdBy._id === user.user.id ||
          (selectedAssignment.course.instructor && selectedAssignment.course.instructor._id === user.user.id)))
    );
  };

  // Check if user can grade submissions
  const canGradeSubmissions = () => {
    if (!selectedAssignment) return false;
    
    return (
      user.user.role === 'admin' ||
      (user.user.role === 'faculty' &&
        (selectedAssignment.createdBy._id === user.user.id ||
          (selectedAssignment.course.instructor && selectedAssignment.course.instructor._id === user.user.id)))
    );
  };

  // Check if user can submit assignment
  const canSubmitAssignment = () => {
    if (!selectedAssignment) return false;
    
    return (
      user.user.role === 'student' &&
      selectedAssignment.status === 'published'
    );
  };

  // Check if user can view submissions
  const canViewSubmissions = () => {
    if (!selectedAssignment) return false;
    
    return (
      user.user.role === 'admin' ||
      user.user.role === 'faculty'
    );
  };

  // Get user's submission
  const getUserSubmission = () => {
    if (!selectedAssignment || !user) return null;
    
    return selectedAssignment.submissions.find(
      (sub) => sub.student._id === user.user.id
    );
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {message}
        </Alert>
      </Container>
    );
  }

  if (!selectedAssignment) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>
          Assignment not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/assignments')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {selectedAssignment.title}
          </Typography>
          {canEditAssignment() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/assignments/${id}/edit`)}
            >
              Edit
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" paragraph>
                {selectedAssignment.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Course
                </Typography>
                <Typography variant="body1">
                  {selectedAssignment.course.code} - {selectedAssignment.course.title}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedAssignment.dueDate)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Points
                </Typography>
                <Typography variant="body1">
                  {selectedAssignment.points}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedAssignment.status}
                  color={getStatusColor(selectedAssignment.status)}
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {selectedAssignment.createdBy.name}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedAssignment.createdAt)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Resources" />
            {canSubmitAssignment() && <Tab label="Submit" />}
            {canViewSubmissions() && <Tab label="Submissions" />}
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          {isFilesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FileList
                files={assignmentFiles}
                title="Assignment Resources"
                onDelete={() => dispatch(getAllFiles({ assignment: id }))}
              />
              
              {canEditAssignment() && (
                <>
                  {showUploadForm ? (
                    <FileUpload
                      assignment={id}
                      fileType="assignment"
                      onUploadSuccess={handleUploadSuccess}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setShowUploadForm(true)}
                    >
                      Add Resource
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </TabPanel>

        {canSubmitAssignment() && (
          <TabPanel value={tabValue} index={1}>
            <SubmissionForm
              assignment={{
                ...selectedAssignment,
                user,
              }}
            />
          </TabPanel>
        )}

        {canViewSubmissions() && (
          <TabPanel value={tabValue} index={canSubmitAssignment() ? 2 : 1}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Student Submissions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {selectedAssignment.submissions.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedAssignment.submissions.map((submission) => (
                    <Grid item xs={12} key={submission.student._id}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid #eee',
                          borderRadius: 1,
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                              {submission.student.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {submission.student.email}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={submission.status}
                                color={getSubmissionStatusColor(submission.status)}
                                size="small"
                              />
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Submitted: {submission.submittedAt ? formatDate(submission.submittedAt) : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Files: {submission.files.length}
                            </Typography>
                            {submission.status === 'graded' && (
                              <Typography variant="body2" color="text.secondary">
                                Grade: {submission.grade} / {selectedAssignment.points}
                              </Typography>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                // View submission files
                                // This would typically navigate to a submission detail page
                                // or open a dialog to show files
                                alert('View submission files - Not implemented');
                              }}
                              sx={{ mr: 1 }}
                            >
                              View Files
                            </Button>
                            
                            {canGradeSubmissions() && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenGradeDialog(submission)}
                              >
                                {submission.status === 'graded' ? 'Update Grade' : 'Grade'}
                              </Button>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No submissions yet.
                </Alert>
              )}
            </Paper>
          </TabPanel>
        )}
      </Box>

      {/* Grade Submission Dialog */}
      <Dialog open={openGradeDialog} onClose={handleCloseGradeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Grade Submission - {selectedSubmission?.student.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Grade"
              name="grade"
              type="number"
              value={gradeData.grade}
              onChange={handleGradeChange}
              margin="normal"
              required
              InputProps={{
                inputProps: {
                  min: 0,
                  max: selectedAssignment.points,
                },
              }}
              helperText={`Out of ${selectedAssignment.points} points`}
            />
            
            <TextField
              fullWidth
              label="Feedback"
              name="feedback"
              value={gradeData.feedback}
              onChange={handleGradeChange}
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGradeDialog}>Cancel</Button>
          <Button
            onClick={handleGradeSubmit}
            variant="contained"
            color="primary"
            disabled={gradeData.grade === '' || isNaN(Number(gradeData.grade))}
          >
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignmentDetails;

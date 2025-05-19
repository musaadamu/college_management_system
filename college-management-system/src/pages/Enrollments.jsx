import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAllEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  reset,
} from '../features/enrollments/enrollmentSlice';
import { getAllCourses } from '../features/courses/courseSlice';

const Enrollments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enrollments, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.enrollments
  );
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    status: 'active',
    grade: '',
    gradePoints: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [filters, setFilters] = useState({
    course: '',
    status: '',
    semester: '',
    year: '',
  });

  // Load enrollments and courses on component mount
  useEffect(() => {
    dispatch(getAllEnrollments());
    dispatch(getAllCourses());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (isSuccess) {
      setOpenSnackbar(true);
      setSnackbarSeverity('success');
      
      if (dialogMode === 'create') {
        setSnackbarMessage('Enrollment created successfully');
      } else if (dialogMode === 'edit') {
        setSnackbarMessage('Enrollment updated successfully');
      } else if (enrollmentToDelete) {
        setSnackbarMessage('Enrollment deleted successfully');
        setEnrollmentToDelete(null);
      }
      
      handleCloseDialog();
      setDeleteConfirmOpen(false);
      dispatch(reset());
    }

    if (isError) {
      setOpenSnackbar(true);
      setSnackbarSeverity('error');
      setSnackbarMessage(message || 'An error occurred');
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, dialogMode, enrollmentToDelete]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    dispatch(getAllEnrollments(filters));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      course: '',
      status: '',
      semester: '',
      year: '',
    });
    dispatch(getAllEnrollments({}));
  };

  // Open dialog for creating a new enrollment
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      student: user.user.role === 'student' ? user.user.id : '',
      course: '',
      semester: 'Fall',
      year: new Date().getFullYear(),
      status: 'active',
      grade: '',
      gradePoints: '',
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an enrollment
  const handleOpenEditDialog = (enrollment) => {
    setDialogMode('edit');
    setSelectedEnrollment(enrollment);
    
    // Prepare form data based on user role
    let formDataToSet = {
      student: enrollment.student._id,
      course: enrollment.course._id,
      semester: enrollment.semester,
      year: enrollment.year,
      status: enrollment.status,
      grade: enrollment.grade || '',
      gradePoints: enrollment.gradePoints || '',
    };
    
    // If user is student, they can only update status to 'dropped'
    if (user.user.role === 'student') {
      formDataToSet = {
        status: enrollment.status,
      };
    }
    // If user is faculty, they can only update grade and status
    else if (user.user.role === 'faculty') {
      formDataToSet = {
        grade: enrollment.grade || '',
        gradePoints: enrollment.gradePoints || '',
        status: enrollment.status,
      };
    }
    
    setFormData(formDataToSet);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEnrollment(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === 'create') {
      dispatch(createEnrollment(formData));
    } else {
      dispatch(updateEnrollment({
        id: selectedEnrollment._id,
        enrollmentData: formData,
      }));
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteConfirm = (enrollment) => {
    setEnrollmentToDelete(enrollment);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setEnrollmentToDelete(null);
  };

  // Handle enrollment deletion
  const handleDeleteEnrollment = () => {
    if (enrollmentToDelete) {
      dispatch(deleteEnrollment(enrollmentToDelete._id));
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'dropped':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get grade color
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return '#4caf50';
      case 'B':
        return '#8bc34a';
      case 'C':
        return '#ffeb3b';
      case 'D':
        return '#ff9800';
      case 'F':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Enrollments</Typography>
          {user && (user.user.role === 'admin' || user.user.role === 'student') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              {user.user.role === 'student' ? 'Enroll in Course' : 'Add Enrollment'}
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Course</InputLabel>
                <Select
                  name="course"
                  value={filters.course}
                  onChange={handleFilterChange}
                  label="Course"
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.code} - {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="dropped">Dropped</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  label="Semester"
                >
                  <MenuItem value="">All Semesters</MenuItem>
                  <MenuItem value="Fall">Fall</MenuItem>
                  <MenuItem value="Spring">Spring</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={filters.year}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={applyFilters}
                sx={{ mr: 1 }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment._id}>
                      <TableCell>{enrollment.student.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {enrollment.course.code}
                          </Typography>
                          <Typography variant="body2">
                            {enrollment.course.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{enrollment.semester}</TableCell>
                      <TableCell>{enrollment.year}</TableCell>
                      <TableCell>
                        <Chip
                          label={enrollment.status}
                          color={getStatusColor(enrollment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {enrollment.grade ? (
                          <Chip
                            label={enrollment.grade}
                            size="small"
                            sx={{
                              bgcolor: getGradeColor(enrollment.grade),
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(enrollment)}
                        >
                          <EditIcon />
                        </IconButton>
                        {user && user.user.role === 'admin' && (
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteConfirm(enrollment)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create/Edit Enrollment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' 
            ? (user.user.role === 'student' ? 'Enroll in Course' : 'Add Enrollment') 
            : 'Update Enrollment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Student field - only for admin in create mode */}
              {user.user.role === 'admin' && dialogMode === 'create' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Student ID"
                    name="student"
                    value={formData.student}
                    onChange={handleChange}
                    required
                    helperText="Enter the student's ID"
                  />
                </Grid>
              )}

              {/* Course field - for admin in create mode or for students */}
              {(user.user.role === 'admin' || 
                (user.user.role === 'student' && dialogMode === 'create')) && (
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Course</InputLabel>
                    <Select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      label="Course"
                      required
                    >
                      {courses.map((course) => (
                        <MenuItem key={course._id} value={course._id}>
                          {course.code} - {course.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Semester and Year fields - for admin in create mode or for students */}
              {(user.user.role === 'admin' || 
                (user.user.role === 'student' && dialogMode === 'create')) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Semester</InputLabel>
                      <Select
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        label="Semester"
                        required
                      >
                        <MenuItem value="Fall">Fall</MenuItem>
                        <MenuItem value="Spring">Spring</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Year"
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      inputProps={{
                        min: new Date().getFullYear() - 1,
                        max: new Date().getFullYear() + 2,
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* Status field - for all users */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    required
                    disabled={user.user.role === 'student' && formData.status !== 'active'}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="dropped">Dropped</MenuItem>
                    {(user.user.role === 'admin' || user.user.role === 'faculty') && (
                      <MenuItem value="completed">Completed</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Grade fields - only for admin and faculty */}
              {(user.user.role === 'admin' || user.user.role === 'faculty') && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Grade</InputLabel>
                      <Select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        label="Grade"
                      >
                        <MenuItem value="">No Grade</MenuItem>
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>
                        <MenuItem value="D">D</MenuItem>
                        <MenuItem value="F">F</MenuItem>
                        <MenuItem value="I">I (Incomplete)</MenuItem>
                        <MenuItem value="W">W (Withdrawn)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Grade Points"
                      name="gradePoints"
                      type="number"
                      value={formData.gradePoints}
                      onChange={handleChange}
                      inputProps={{
                        min: 0,
                        max: 4,
                        step: 0.1,
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              (dialogMode === 'create' && (!formData.course || 
                (user.user.role === 'admin' && !formData.student))) ||
              (user.user.role === 'student' && dialogMode === 'edit' && formData.status === 'active')
            }
          >
            {dialogMode === 'create' ? 'Enroll' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the enrollment for {enrollmentToDelete?.student.name} in {enrollmentToDelete?.course.code}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteEnrollment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
    </Container>
  );
};

export default Enrollments;

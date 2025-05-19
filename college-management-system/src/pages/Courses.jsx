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
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  reset,
} from '../features/courses/courseSlice';
import { getAllDepartments } from '../features/departments/departmentSlice';

const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.courses
  );
  const { departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    credits: 3,
    department: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    prerequisites: [],
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [filters, setFilters] = useState({
    title: '',
    code: '',
    department: '',
    semester: '',
    year: '',
  });

  // Load courses and departments on component mount
  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getAllDepartments());

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
        setSnackbarMessage('Course created successfully');
      } else if (dialogMode === 'edit') {
        setSnackbarMessage('Course updated successfully');
      } else if (courseToDelete) {
        setSnackbarMessage('Course deleted successfully');
        setCourseToDelete(null);
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
  }, [isSuccess, isError, message, dispatch, dialogMode, courseToDelete]);

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
    dispatch(getAllCourses(filters));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      title: '',
      code: '',
      department: '',
      semester: '',
      year: '',
    });
    dispatch(getAllCourses({}));
  };

  // Open dialog for creating a new course
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      title: '',
      code: '',
      description: '',
      credits: 3,
      department: '',
      semester: 'Fall',
      year: new Date().getFullYear(),
      prerequisites: [],
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a course
  const handleOpenEditDialog = (course) => {
    setDialogMode('edit');
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      code: course.code,
      description: course.description || '',
      credits: course.credits,
      department: course.department._id,
      semester: course.semester,
      year: course.year,
      prerequisites: course.prerequisites ? course.prerequisites.map(p => p._id) : [],
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === 'create') {
      dispatch(createCourse(formData));
    } else {
      dispatch(updateCourse({
        id: selectedCourse._id,
        courseData: formData,
      }));
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteConfirm = (course) => {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setCourseToDelete(null);
  };

  // Handle course deletion
  const handleDeleteCourse = () => {
    if (courseToDelete) {
      dispatch(deleteCourse(courseToDelete._id));
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Handle prerequisites change
  const handlePrerequisitesChange = (event, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      prerequisites: newValue.map(course => course._id),
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Courses</Typography>
          {user && user.user.role === 'admin' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Add Course
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Code"
                name="code"
                value={filters.code}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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
                  <TableCell>Title</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Year</TableCell>
                  {user && user.user.role === 'admin' && (
                    <TableCell align="right">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <TableRow
                      key={course._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.department.name}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{course.year}</TableCell>
                      {user && user.user.role === 'admin' && (
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDialog(course);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteConfirm(course);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={user && user.user.role === 'admin' ? 7 : 6} align="center">
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create/Edit Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Course' : 'Edit Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Course Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  helperText="2-10 uppercase letters or numbers"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    label="Department"
                    required
                  >
                    {departments.map((department) => (
                      <MenuItem key={department._id} value={department._id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Credits"
                  name="credits"
                  type="number"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 6 }}
                />
              </Grid>
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
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="prerequisites"
                  options={courses.filter(course => course._id !== selectedCourse?._id)}
                  getOptionLabel={(option) => `${option.code} - ${option.title}`}
                  value={courses.filter(course =>
                    formData.prerequisites.includes(course._id)
                  )}
                  onChange={handlePrerequisitesChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Prerequisites"
                      margin="normal"
                      fullWidth
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`${option.code} - ${option.title}`}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.title || !formData.code || !formData.department}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the course "{courseToDelete?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error" variant="contained">
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

export default Courses;

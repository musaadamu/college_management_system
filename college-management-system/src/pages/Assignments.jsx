import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getAllAssignments, reset } from '../features/assignments/assignmentSlice';
import { getAllCourses } from '../features/courses/courseSlice';
import AssignmentList from '../components/Assignments/AssignmentList';
import AssignmentForm from '../components/Assignments/AssignmentForm';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assignments-tabpanel-${index}`}
      aria-labelledby={`assignments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Assignments = () => {
  const dispatch = useDispatch();
  const { assignments, isLoading, isError, message } = useSelector(
    (state) => state.assignments
  );
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Load assignments and courses when component mounts
  useEffect(() => {
    dispatch(getAllAssignments());
    dispatch(getAllCourses());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Filter assignments when dependencies change
  useEffect(() => {
    if (assignments.length > 0) {
      let filtered = [...assignments];
      
      if (selectedCourse) {
        filtered = filtered.filter(
          (assignment) => assignment.course._id === selectedCourse
        );
      }
      
      if (selectedStatus) {
        filtered = filtered.filter(
          (assignment) => assignment.status === selectedStatus
        );
      }
      
      setFilteredAssignments(filtered);
    } else {
      setFilteredAssignments([]);
    }
  }, [assignments, selectedCourse, selectedStatus]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setEditingAssignment(null);
  };

  // Handle course filter change
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCourse('');
    setSelectedStatus('');
  };

  // Handle edit assignment
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setTabValue(1);
  };

  // Handle create/update success
  const handleFormSuccess = () => {
    setEditingAssignment(null);
    setTabValue(0);
    dispatch(getAllAssignments());
  };

  // Filter courses based on user role
  const getFilteredCourses = () => {
    if (user.user.role === 'admin') {
      return courses;
    } else if (user.user.role === 'faculty') {
      return courses.filter(
        (course) => course.instructor && course.instructor._id === user.user.id
      );
    } else {
      // For students, show only enrolled courses
      return courses.filter((course) =>
        course.enrollments?.some(
          (enrollment) =>
            enrollment.student === user.user.id && enrollment.status === 'active'
        )
      );
    }
  };

  // Check if user can create assignments
  const canCreateAssignments = () => {
    return user.user.role === 'admin' || user.user.role === 'faculty';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Assignments</Typography>
          {canCreateAssignments() && tabValue === 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setTabValue(1)}
            >
              Create Assignment
            </Button>
          )}
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="View Assignments" />
            {canCreateAssignments() && (
              <Tab label={editingAssignment ? 'Edit Assignment' : 'Create Assignment'} />
            )}
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    label="Course"
                  >
                    <MenuItem value="">All Courses</MenuItem>
                    {getFilteredCourses().map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.code} - {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  fullWidth
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
          ) : isError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {message}
            </Alert>
          ) : (
            <AssignmentList
              assignments={filteredAssignments}
              onEdit={handleEditAssignment}
            />
          )}
        </TabPanel>

        {canCreateAssignments() && (
          <TabPanel value={tabValue} index={1}>
            <AssignmentForm
              courses={getFilteredCourses()}
              assignment={editingAssignment}
              onSuccess={handleFormSuccess}
            />
          </TabPanel>
        )}
      </Box>
    </Container>
  );
};

export default Assignments;

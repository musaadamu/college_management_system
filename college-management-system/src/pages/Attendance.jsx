import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { getAllAttendances, getCourseAttendance, reset } from '../features/attendance/attendanceSlice';
import { getAllCourses } from '../features/courses/courseSlice';
import AttendanceList from '../components/Attendance/AttendanceList';
import AttendanceForm from '../components/Attendance/AttendanceForm';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Attendance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { attendances, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.attendance
  );
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    course: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Load courses on component mount
  useEffect(() => {
    dispatch(getAllCourses());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFilters((prevFilters) => ({
      ...prevFilters,
      date: format(date, 'yyyy-MM-dd'),
    }));
  };

  // Apply filters
  const applyFilters = () => {
    if (filters.course) {
      dispatch(getCourseAttendance({ courseId: filters.course, filters: { date: filters.date } }));
    } else {
      dispatch(getAllAttendances(filters));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      course: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setSelectedDate(new Date());
    dispatch(getAllAttendances({}));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Attendance Management
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="attendance tabs">
            <Tab label="View Attendance" />
            {(user.user.role === 'admin' || user.user.role === 'faculty') && (
              <Tab label="Mark Attendance" />
            )}
          </Tabs>
        </Box>

        {/* View Attendance Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
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

          {/* Attendance List */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {message}
            </Alert>
          ) : (
            <AttendanceList attendances={attendances} />
          )}
        </TabPanel>

        {/* Mark Attendance Tab */}
        {(user.user.role === 'admin' || user.user.role === 'faculty') && (
          <TabPanel value={tabValue} index={1}>
            <AttendanceForm courses={courses} />
          </TabPanel>
        )}
      </Box>
    </Container>
  );
};

export default Attendance;

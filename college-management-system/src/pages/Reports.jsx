import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getAllEnrollments } from '../features/enrollments/enrollmentSlice';
import { getAllCourses } from '../features/courses/courseSlice';
import { getAllDepartments } from '../features/departments/departmentSlice';
import { getAllAttendances } from '../features/attendance/attendanceSlice';
import { getAllUsers } from '../features/users/userSlice';

// Report components
import CoursePerformanceReport from '../components/Reports/CoursePerformanceReport';
import DepartmentPerformanceReport from '../components/Reports/DepartmentPerformanceReport';
import AttendanceReport from '../components/Reports/AttendanceReport';
import EnrollmentTrendReport from '../components/Reports/EnrollmentTrendReport';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get data from Redux store
  const { enrollments } = useSelector((state) => state.enrollments);
  const { courses } = useSelector((state) => state.courses);
  const { departments } = useSelector((state) => state.departments);
  const { attendances } = useSelector((state) => state.attendance);
  const { users } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dispatch all data loading actions
        await Promise.all([
          dispatch(getAllEnrollments()),
          dispatch(getAllCourses()),
          dispatch(getAllDepartments()),
          dispatch(getAllAttendances()),
          dispatch(getAllUsers()),
        ]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data for reports');
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Paper sx={{ mt: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="reports tabs"
              >
                <Tab label="Course Performance" />
                <Tab label="Department Performance" />
                <Tab label="Attendance" />
                <Tab label="Enrollment Trends" />
              </Tabs>
            </Paper>

            <TabPanel value={tabValue} index={0}>
              <CoursePerformanceReport
                enrollments={enrollments}
                courses={courses}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <DepartmentPerformanceReport
                enrollments={enrollments}
                courses={courses}
                departments={departments}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <AttendanceReport
                attendances={attendances}
                courses={courses}
                users={users}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <EnrollmentTrendReport
                enrollments={enrollments}
              />
            </TabPanel>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Reports;

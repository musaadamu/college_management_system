import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getAllEnrollments } from '../features/enrollments/enrollmentSlice';
import { getAllCourses } from '../features/courses/courseSlice';
import { getAllAcademicDates } from '../features/calendar/calendarSlice';
import CourseCalendar from '../components/Calendar/CourseCalendar';
import AcademicDates from '../components/Calendar/AcademicDates';

const Calendar = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get data from Redux store
  const { enrollments } = useSelector((state) => state.enrollments);
  const { courses } = useSelector((state) => state.courses);
  const { academicDates } = useSelector((state) => state.calendar);
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
          dispatch(getAllAcademicDates()),
        ]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data for calendar');
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Filter courses based on user role
  const getRelevantCourses = () => {
    if (!user || !courses) return [];

    if (user.user.role === 'admin') {
      return courses;
    } else if (user.user.role === 'faculty') {
      return courses.filter(course => 
        course.instructor && course.instructor._id === user.user.id
      );
    } else if (user.user.role === 'student') {
      const enrolledCourseIds = enrollments
        .filter(enrollment => 
          enrollment.student._id === user.user.id && 
          enrollment.status === 'active'
        )
        .map(enrollment => enrollment.course._id);
      
      return courses.filter(course => 
        enrolledCourseIds.includes(course._id)
      );
    }

    return [];
  };

  const relevantCourses = getRelevantCourses();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Calendar
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CourseCalendar 
                courses={relevantCourses} 
                academicDates={academicDates} 
              />
            </Grid>
            <Grid item xs={12}>
              <AcademicDates academicDates={academicDates} />
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Calendar;

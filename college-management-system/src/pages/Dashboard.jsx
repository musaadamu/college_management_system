import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Student dashboard components
import GPASummary from '../components/Dashboard/GPASummary';
import CurrentCourses from '../components/Dashboard/CurrentCourses';
import SemesterGPA from '../components/Dashboard/SemesterGPA';

// Redux actions
import { getAllEnrollments } from '../features/enrollments/enrollmentSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrollments, isLoading, isError, message } = useSelector(
    (state) => state.enrollments
  );

  useEffect(() => {
    document.title = 'Dashboard | College Management System';

    // Fetch enrollments for student dashboard
    if (user.user.role === 'student') {
      dispatch(getAllEnrollments());
    }
  }, [dispatch, user.user.role]);

  // Dashboard cards based on user role
  const getDashboardCards = () => {
    const adminCards = [
      {
        title: 'Total Students',
        count: '250',
        icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        color: '#e3f2fd',
      },
      {
        title: 'Total Faculty',
        count: '25',
        icon: <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        color: '#f3e5f5',
      },
      {
        title: 'Departments',
        count: '8',
        icon: <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />,
        color: '#e8f5e9',
      },
      {
        title: 'Courses',
        count: '32',
        icon: <ClassIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
        color: '#fff8e1',
      },
    ];

    const facultyCards = [
      {
        title: 'My Courses',
        count: '5',
        icon: <ClassIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        color: '#e3f2fd',
      },
      {
        title: 'Total Students',
        count: '120',
        icon: <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        color: '#f3e5f5',
      },
      {
        title: 'Attendance Today',
        count: '85%',
        icon: <EventNoteIcon sx={{ fontSize: 40, color: 'success.main' }} />,
        color: '#e8f5e9',
      },
    ];

    const studentCards = [
      {
        title: 'Enrolled Courses',
        count: '5',
        icon: <ClassIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        color: '#e3f2fd',
      },
      {
        title: 'Attendance',
        count: '92%',
        icon: <EventNoteIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        color: '#f3e5f5',
      },
      {
        title: 'Current GPA',
        count: '3.8',
        icon: <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />,
        color: '#e8f5e9',
      },
    ];

    if (user.user.role === 'admin') {
      return adminCards;
    } else if (user.user.role === 'faculty') {
      return facultyCards;
    } else {
      return studentCards;
    }
  };

  // Render student dashboard
  const renderStudentDashboard = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (isError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {message || 'Failed to load enrollments'}
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 4 }}>
        {/* Summary cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {getDashboardCards().map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: card.color,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                {card.icon}
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {card.count}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {card.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* GPA Summary */}
        <GPASummary enrollments={enrollments} />

        {/* Current Courses */}
        <CurrentCourses enrollments={enrollments} />

        {/* Semester GPA */}
        <SemesterGPA enrollments={enrollments} />
      </Box>
    );
  };

  // Render admin or faculty dashboard
  const renderAdminFacultyDashboard = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {getDashboardCards().map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: card.color,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                {card.icon}
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {card.count}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {card.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome back, {user.user.name}!
        </Typography>

        {user.user.role === 'student'
          ? renderStudentDashboard()
          : renderAdminFacultyDashboard()}
      </Box>
    </Container>
  );
};

export default Dashboard;

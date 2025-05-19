import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardHeader, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// Import memoized selectors
import { selectUser } from '../selectors';

const Home = () => {
  // Get user with memoized selector
  const user = useSelector(selectUser);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to College Management System
        </Typography>
        <Typography variant="body1">
          {user?.user?.name ? `Hello, ${user.user.name}!` : 'Please log in to access the system.'}
        </Typography>
      </Paper>

      {user && (
        <Grid container spacing={3}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Quick Links" />
              <CardContent>
                <Button component={Link} to="/dashboard" variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                  Dashboard
                </Button>
                <Button component={Link} to="/courses" variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                  Courses
                </Button>
                <Button component={Link} to="/messages" variant="contained" color="primary" fullWidth>
                  Messages
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="System Status" />
              <CardContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  All systems are operational. The College Management System is running the latest version.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Home;

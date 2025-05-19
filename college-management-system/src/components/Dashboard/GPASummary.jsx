import { Box, Paper, Typography, Grid, Divider } from '@mui/material';
import { calculateCumulativeGPA, getGPAClass } from '../../utils/gpaCalculator';

const GPASummary = ({ enrollments }) => {
  const { gpa, totalCredits, earnedCredits } = calculateCumulativeGPA(enrollments);
  const { color, label } = getGPAClass(gpa);

  // Count completed courses (those with grades)
  const completedCourses = enrollments.filter(
    (enrollment) => enrollment.grade && enrollment.status === 'completed'
  ).length;

  // Count in-progress courses
  const inProgressCourses = enrollments.filter(
    (enrollment) => enrollment.status === 'active'
  ).length;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Academic Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>
              {gpa.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" sx={{ color }}>
              Cumulative GPA
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {label}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {completedCourses}
                </Typography>
                <Typography variant="body2">
                  Completed Courses
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {inProgressCourses}
                </Typography>
                <Typography variant="body2">
                  In-Progress Courses
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {earnedCredits}
                </Typography>
                <Typography variant="body2">
                  Credits Earned
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {totalCredits}
                </Typography>
                <Typography variant="body2">
                  Credits Attempted
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GPASummary;

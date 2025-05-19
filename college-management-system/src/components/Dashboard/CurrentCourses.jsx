import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CurrentCourses = ({ enrollments }) => {
  const navigate = useNavigate();
  
  // Filter active enrollments
  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === 'active'
  );
  
  // Get random progress for demo purposes (in a real app, this would come from the backend)
  const getRandomProgress = () => {
    return Math.floor(Math.random() * 100);
  };
  
  // View course details
  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };
  
  // View attendance for a course
  const handleViewAttendance = () => {
    navigate('/my-attendance');
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Current Courses
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {activeEnrollments.length > 0 ? (
        <Grid container spacing={3}>
          {activeEnrollments.map((enrollment) => {
            const progress = getRandomProgress();
            
            return (
              <Grid item xs={12} sm={6} md={4} key={enrollment._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {enrollment.course.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {enrollment.course.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={`${enrollment.semester} ${enrollment.year}`} 
                        size="small" 
                        color="primary"
                      />
                      <Chip 
                        label={`${enrollment.course.credits} Credits`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleViewCourse(enrollment.course._id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      onClick={handleViewAttendance}
                    >
                      Attendance
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
          You are not currently enrolled in any courses.
        </Typography>
      )}
    </Paper>
  );
};

export default CurrentCourses;

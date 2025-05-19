import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import { getCourseById, clearCourse, reset } from '../features/courses/courseSlice';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { course, isLoading, isError, message } = useSelector((state) => state.courses);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(getCourseById(id));

    return () => {
      dispatch(clearCourse());
      dispatch(reset());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (isError) {
      setError(message);
    }
  }, [isError, message]);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/courses')}
            >
              Back to Courses
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">Loading course details...</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/courses')}
          >
            Courses
          </Link>
          <Typography color="text.primary">{course.code}</Typography>
        </Breadcrumbs>

        {/* Back button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/courses')}
          sx={{ mb: 3 }}
        >
          Back to Courses
        </Button>

        {/* Course header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip
                  label={course.code}
                  color="primary"
                  sx={{ mr: 2, fontWeight: 'bold' }}
                />
                <Typography variant="h4">{course.title}</Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                {course.department.name} Department
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  <strong>Credits:</strong> {course.credits}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  <strong>Semester:</strong> {course.semester} {course.year}
                </Typography>
              </Box>
              {course.instructor && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <strong>Instructor:</strong> {course.instructor.name}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {course.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Description:
                  </Typography>
                  <Typography variant="body2">{course.description}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Prerequisites */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <BookIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            Prerequisites
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {course.prerequisites && course.prerequisites.length > 0 ? (
            <List>
              {course.prerequisites.map((prereq) => (
                <ListItem
                  key={prereq._id}
                  button
                  onClick={() => navigate(`/courses/${prereq._id}`)}
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={prereq.code}
                          size="small"
                          sx={{ mr: 2, fontWeight: 'bold' }}
                        />
                        <Typography variant="body1">{prereq.title}</Typography>
                      </Box>
                    }
                    secondary={`${prereq.credits} credits`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              This course has no prerequisites.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default CourseDetails;

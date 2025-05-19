import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { login, reset } from '../features/auth/authSlice';
import { selectUser, selectAuthLoading, selectAuthError, selectAuthMessage, selectAuthSuccess } from '../selectors';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth state with memoized selectors
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const isError = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  const isSuccess = useSelector(selectAuthSuccess);

  useEffect(() => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    }

    if (isSuccess) {
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      setErrorMessage('');

      // Redirect after a short delay to show the success message
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

      return () => clearTimeout(timer);
    }

    if (user && !isSuccess) {
      // If user is already logged in
      navigate('/dashboard');
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleSubmit = (values) => {
    dispatch(login(values));
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              {successMessage}
            </Alert>
          )}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form style={{ width: '100%', marginTop: '1rem' }}>
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  InputLabelProps={{
                    htmlFor: 'email',
                  }}
                />
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputLabelProps={{
                    htmlFor: 'password',
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, position: 'relative' }}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )}
                  <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
                    {isSuccess ? 'Success!' : 'Sign In'}
                  </span>
                </Button>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

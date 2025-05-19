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
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { register, reset } from '../features/auth/authSlice';
import { selectUser, selectAuthLoading, selectAuthError, selectAuthMessage, selectAuthSuccess } from '../selectors';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string().required('Role is required'),
});

const Register = () => {
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
      setSuccessMessage('Registration successful! Redirecting to dashboard...');
      setErrorMessage('');

      // Redirect after a short delay to show the success message
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (user && !isSuccess) {
      // If user is already registered
      navigate('/dashboard');
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleSubmit = (values) => {
    const { name, email, password, role } = values;
    dispatch(register({ name, email, password, role }));
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
            Sign up
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
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: 'student',
            }}
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
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  InputLabelProps={{
                    htmlFor: 'name',
                  }}
                />
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
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
                  autoComplete="new-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputLabelProps={{
                    htmlFor: 'password',
                  }}
                />
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputLabelProps={{
                    htmlFor: 'confirmPassword',
                  }}
                />
                <Field
                  as={TextField}
                  select
                  margin="normal"
                  required
                  fullWidth
                  name="role"
                  label="Role"
                  id="role"
                  error={touched.role && Boolean(errors.role)}
                  helperText={touched.role && errors.role}
                  InputLabelProps={{
                    htmlFor: 'role',
                  }}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                </Field>
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
                    {isSuccess ? 'Success!' : 'Sign Up'}
                  </span>
                </Button>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link href="/login" variant="body2">
                    {'Already have an account? Sign In'}
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

export default Register;

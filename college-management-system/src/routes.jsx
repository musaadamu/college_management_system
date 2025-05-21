import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';

// Create simple fallback components
const NotFoundComponent = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for doesn't exist or has been moved.</p>
  </div>
);

const LoginComponent = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Login</h1>
    <p>Please log in to access the system.</p>
  </div>
);

const RegisterComponent = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Register</h1>
    <p>Create a new account to access the system.</p>
  </div>
);

// Lazy load components with fallbacks
const Login = lazy(() =>
  import('./pages/Login')
    .catch(() => {
      console.warn('Could not load Login page, using fallback');
      return { default: LoginComponent };
    })
);

const Register = lazy(() =>
  import('./pages/Register')
    .catch(() => {
      console.warn('Could not load Register page, using fallback');
      return { default: RegisterComponent };
    })
);

const NotFound = lazy(() =>
  import('./pages/NotFound')
    .catch(() => {
      console.warn('Could not load NotFound page, using fallback');
      return { default: NotFoundComponent };
    })
);

// Loading component
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Loading...</p>
  </div>
);

// Wrap component with Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingComponent />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: withSuspense(Login),
      },
      {
        path: 'register',
        element: withSuspense(Register),
      },
      {
        path: '*',
        element: withSuspense(NotFound),
      },
    ],
  },
]);

export default router;

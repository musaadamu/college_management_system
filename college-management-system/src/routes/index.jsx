import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Departments from '../pages/Departments';
import Courses from '../pages/Courses';
import CourseDetails from '../pages/CourseDetails';
import Enrollments from '../pages/Enrollments';
import Attendance from '../pages/Attendance';
import Users from '../pages/Users';
import Reports from '../pages/Reports';
import Calendar from '../pages/Calendar';
import Assignments from '../pages/Assignments';
import AssignmentDetails from '../pages/AssignmentDetails';
import Notifications from '../pages/Notifications';
import Messages from '../pages/Messages';
import NewMessage from '../pages/NewMessage';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
      {
        element: <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']} />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          // Add more protected routes here
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: 'users',
            element: <Users />,
          },
          {
            path: 'departments',
            element: <Departments />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'calendar',
            element: <Calendar />,
          },
          {
            path: 'assignments',
            element: <Assignments />,
          },
          {
            path: 'assignments/:id',
            element: <AssignmentDetails />,
          },
          {
            path: 'notifications',
            element: <Notifications />,
          },
          {
            path: 'messages',
            element: <Messages />,
          },
          {
            path: 'messages/:conversationId',
            element: <Messages />,
          },
          {
            path: 'messages/new',
            element: <NewMessage />,
          },
          // Add more admin-only routes here
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin', 'faculty']} />,
        children: [
          {
            path: 'courses',
            element: <Courses />,
          },
          {
            path: 'courses/:id',
            element: <CourseDetails />,
          },
          {
            path: 'enrollments',
            element: <Enrollments />,
          },
          {
            path: 'attendance',
            element: <Attendance />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'calendar',
            element: <Calendar />,
          },
          {
            path: 'assignments',
            element: <Assignments />,
          },
          {
            path: 'assignments/:id',
            element: <AssignmentDetails />,
          },
          {
            path: 'notifications',
            element: <Notifications />,
          },
          {
            path: 'messages',
            element: <Messages />,
          },
          {
            path: 'messages/:conversationId',
            element: <Messages />,
          },
          {
            path: 'messages/new',
            element: <NewMessage />,
          },
          // Add more faculty/admin routes here
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['student']} />,
        children: [
          {
            path: 'my-courses',
            element: <div>My Courses Page</div>,
          },
          {
            path: 'enrollments',
            element: <Enrollments />,
          },
          {
            path: 'my-attendance',
            element: <Attendance />,
          },
          {
            path: 'calendar',
            element: <Calendar />,
          },
          {
            path: 'assignments',
            element: <Assignments />,
          },
          {
            path: 'assignments/:id',
            element: <AssignmentDetails />,
          },
          {
            path: 'notifications',
            element: <Notifications />,
          },
          {
            path: 'messages',
            element: <Messages />,
          },
          {
            path: 'messages/:conversationId',
            element: <Messages />,
          },
          {
            path: 'messages/new',
            element: <NewMessage />,
          },
          // Add more student-only routes here
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;

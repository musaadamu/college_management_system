import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectUserRole } from '../../selectors';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmailIcon from '@mui/icons-material/Email';

const Sidebar = ({ open, toggleDrawer }) => {
  // Get user role with memoized selector
  const userRole = useSelector(selectUserRole);
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
    ];

    const adminItems = [
      {
        text: 'Users',
        icon: <PeopleIcon />,
        path: '/users',
      },
      {
        text: 'Departments',
        icon: <SchoolIcon />,
        path: '/departments',
      },
      {
        text: 'Courses',
        icon: <ClassIcon />,
        path: '/courses',
      },
      {
        text: 'Enrollments',
        icon: <AssignmentIcon />,
        path: '/enrollments',
      },
      {
        text: 'Attendance',
        icon: <EventNoteIcon />,
        path: '/attendance',
      },
      {
        text: 'Reports',
        icon: <BarChartIcon />,
        path: '/reports',
      },
      {
        text: 'Calendar',
        icon: <CalendarMonthIcon />,
        path: '/calendar',
      },
      {
        text: 'Assignments',
        icon: <AssignmentTurnedInIcon />,
        path: '/assignments',
      },
      {
        text: 'Messages',
        icon: <EmailIcon />,
        path: '/messages',
      },
    ];

    const facultyItems = [
      {
        text: 'My Courses',
        icon: <ClassIcon />,
        path: '/my-courses',
      },
      {
        text: 'Enrollments',
        icon: <AssignmentIcon />,
        path: '/enrollments',
      },
      {
        text: 'Attendance',
        icon: <EventNoteIcon />,
        path: '/attendance',
      },
      {
        text: 'Reports',
        icon: <BarChartIcon />,
        path: '/reports',
      },
      {
        text: 'Calendar',
        icon: <CalendarMonthIcon />,
        path: '/calendar',
      },
      {
        text: 'Assignments',
        icon: <AssignmentTurnedInIcon />,
        path: '/assignments',
      },
      {
        text: 'Messages',
        icon: <EmailIcon />,
        path: '/messages',
      },
    ];

    const studentItems = [
      {
        text: 'My Courses',
        icon: <ClassIcon />,
        path: '/my-courses',
      },
      {
        text: 'My Enrollments',
        icon: <AssignmentIcon />,
        path: '/enrollments',
      },
      {
        text: 'My Attendance',
        icon: <EventNoteIcon />,
        path: '/my-attendance',
      },
      {
        text: 'Calendar',
        icon: <CalendarMonthIcon />,
        path: '/calendar',
      },
      {
        text: 'Assignments',
        icon: <AssignmentTurnedInIcon />,
        path: '/assignments',
      },
      {
        text: 'Messages',
        icon: <EmailIcon />,
        path: '/messages',
      },
    ];

    // Default to student items if no role is specified
    if (!userRole) {
      return commonItems;
    }

    if (userRole === 'admin') {
      return [...commonItems, ...adminItems];
    } else if (userRole === 'faculty') {
      return [...commonItems, ...facultyItems];
    } else {
      return [...commonItems, ...studentItems];
    }
  };

  const drawerWidth = 240;

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          display: open ? 'block' : 'none',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;

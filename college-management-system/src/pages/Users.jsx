import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  reset,
} from '../features/users/userSlice';

const Users = () => {
  const dispatch = useDispatch();
  const { users, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.users
  );
  const { user: currentUser } = useSelector((state) => state.auth);

  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', or 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    facultyId: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
  });

  // Load users on component mount
  useEffect(() => {
    dispatch(getAllUsers());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (isSuccess) {
      setOpenSnackbar(true);
      setSnackbarSeverity('success');
      
      if (dialogMode === 'create') {
        setSnackbarMessage('User created successfully');
      } else if (dialogMode === 'edit') {
        setSnackbarMessage('User updated successfully');
      } else if (userToDelete) {
        setSnackbarMessage('User deleted successfully');
        setUserToDelete(null);
      }
      
      handleCloseDialog();
      setDeleteConfirmOpen(false);
      dispatch(reset());
    }

    if (isError) {
      setOpenSnackbar(true);
      setSnackbarSeverity('error');
      setSnackbarMessage(message || 'An error occurred');
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, dialogMode, userToDelete]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    dispatch(getAllUsers(filters));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      name: '',
      email: '',
      role: '',
    });
    dispatch(getAllUsers({}));
  };

  // Open dialog for creating a new user
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      studentId: '',
      facultyId: '',
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a user
  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      studentId: user.studentId || '',
      facultyId: user.facultyId || '',
    });
    setOpenDialog(true);
  };

  // Open dialog for viewing a user
  const handleOpenViewDialog = (user) => {
    setDialogMode('view');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId || '',
      facultyId: user.facultyId || '',
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === 'create') {
      dispatch(createUser(formData));
    } else if (dialogMode === 'edit') {
      // Only include password if it's not empty
      const userData = { ...formData };
      if (!userData.password) {
        delete userData.password;
      }
      
      dispatch(updateUser({
        id: selectedUser._id,
        userData,
      }));
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteConfirm = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete._id));
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Get role chip color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'faculty':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Users</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add User
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={applyFilters}
                sx={{ mr: 1 }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.role === 'student' ? user.studentId : 
                         user.role === 'faculty' ? user.facultyId : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            color="info"
                            onClick={() => handleOpenViewDialog(user)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {/* Don't allow deleting yourself */}
                        {user._id !== currentUser.user.id && (
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteConfirm(user)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create/Edit/View User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add User' : 
           dialogMode === 'edit' ? 'Edit User' : 'View User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              {dialogMode !== 'view' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label={dialogMode === 'create' ? "Password" : "New Password (leave blank to keep current)"}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={dialogMode === 'create'}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    required
                    disabled={dialogMode === 'view'}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="faculty">Faculty</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(formData.role === 'student' || dialogMode === 'view' && selectedUser?.role === 'student') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required={formData.role === 'student'}
                    disabled={dialogMode === 'view'}
                    helperText="Required for students (5-10 uppercase letters or numbers)"
                  />
                </Grid>
              )}
              {(formData.role === 'faculty' || dialogMode === 'view' && selectedUser?.role === 'faculty') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Faculty ID"
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleChange}
                    required={formData.role === 'faculty'}
                    disabled={dialogMode === 'view'}
                    helperText="Required for faculty (5-10 uppercase letters or numbers)"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={
                !formData.name || 
                !formData.email || 
                (dialogMode === 'create' && !formData.password) ||
                (formData.role === 'student' && !formData.studentId) ||
                (formData.role === 'faculty' && !formData.facultyId)
              }
            >
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user {userToDelete?.name}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Users;

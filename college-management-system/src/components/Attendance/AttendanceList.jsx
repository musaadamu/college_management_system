import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { updateAttendance, deleteAttendance } from '../../features/attendance/attendanceSlice';
import AttendanceEditForm from './AttendanceEditForm';

const AttendanceList = ({ attendances }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open edit dialog
  const handleOpenEditDialog = (attendance) => {
    setSelectedAttendance(attendance);
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedAttendance(null);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (attendance) => {
    setSelectedAttendance(attendance);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAttendance(null);
  };

  // Handle attendance update
  const handleUpdateAttendance = (attendanceData) => {
    dispatch(updateAttendance({
      id: selectedAttendance._id,
      attendanceData,
    }));
    handleCloseEditDialog();
  };

  // Handle attendance deletion
  const handleDeleteAttendance = () => {
    dispatch(deleteAttendance(selectedAttendance._id));
    handleCloseDeleteDialog();
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  // Empty rows
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - attendances.length) : 0;

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Marked By</TableCell>
              <TableCell>Remarks</TableCell>
              {(user.user.role === 'admin' || user.user.role === 'faculty') && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {attendances.length > 0 ? (
              attendances
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((attendance) => (
                  <TableRow key={attendance._id}>
                    <TableCell>{attendance.student.name}</TableCell>
                    <TableCell>{attendance.course.code} - {attendance.course.title}</TableCell>
                    <TableCell>{format(new Date(attendance.date), 'PPP')}</TableCell>
                    <TableCell>
                      <Chip
                        label={attendance.status}
                        color={getStatusColor(attendance.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{attendance.markedBy?.name || 'N/A'}</TableCell>
                    <TableCell>{attendance.remarks || '-'}</TableCell>
                    {(user.user.role === 'admin' || 
                      (user.user.role === 'faculty' && 
                       attendance.markedBy?._id === user.user.id)) && (
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(attendance)}
                        >
                          <EditIcon />
                        </IconButton>
                        {user.user.role === 'admin' && (
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(attendance)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={(user.user.role === 'admin' || user.user.role === 'faculty') ? 7 : 6} align="center">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={(user.user.role === 'admin' || user.user.role === 'faculty') ? 7 : 6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={attendances.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          {selectedAttendance && (
            <AttendanceEditForm
              attendance={selectedAttendance}
              onSubmit={handleUpdateAttendance}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attendance record?
            This action cannot be undone.
          </Typography>
          {selectedAttendance && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Student:</strong> {selectedAttendance.student.name}
              </Typography>
              <Typography variant="body2">
                <strong>Course:</strong> {selectedAttendance.course.code} - {selectedAttendance.course.title}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {format(new Date(selectedAttendance.date), 'PPP')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAttendance} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttendanceList;

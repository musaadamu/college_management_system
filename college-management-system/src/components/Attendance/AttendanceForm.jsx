import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { createAttendance, bulkCreateAttendance, reset } from '../../features/attendance/attendanceSlice';
import { getAllEnrollments } from '../../features/enrollments/enrollmentSlice';

const AttendanceForm = ({ courses }) => {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.attendance
  );
  const { enrollments } = useSelector((state) => state.enrollments);
  
  // Local state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [courseStudents, setCourseStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Load enrollments when course changes
  useEffect(() => {
    if (selectedCourse) {
      dispatch(getAllEnrollments({ course: selectedCourse, status: 'active' }));
    }
  }, [dispatch, selectedCourse]);

  // Process enrollments to get students for the selected course
  useEffect(() => {
    if (enrollments.length > 0 && selectedCourse) {
      const students = enrollments
        .filter(enrollment => enrollment.course._id === selectedCourse)
        .map(enrollment => ({
          id: enrollment.student._id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          studentId: enrollment.student.studentId,
        }));
      
      setCourseStudents(students);
      
      // Initialize attendance data for all students
      setAttendanceData(students.map(student => ({
        student: student.id,
        course: selectedCourse,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: 'present',
        remarks: '',
      })));
    } else {
      setCourseStudents([]);
      setAttendanceData([]);
    }
  }, [enrollments, selectedCourse, selectedDate]);

  // Handle success/error messages
  useEffect(() => {
    if (formSubmitted) {
      if (isSuccess) {
        setSnackbarMessage('Attendance marked successfully');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Reset form
        setSelectedCourse('');
        setSelectedDate(new Date());
        setCourseStudents([]);
        setAttendanceData([]);
        
        dispatch(reset());
      }

      if (isError) {
        setSnackbarMessage(message || 'An error occurred');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        
        dispatch(reset());
      }
      
      setFormSubmitted(false);
    }
  }, [isSuccess, isError, message, dispatch, formSubmitted]);

  // Handle course change
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // Update date in attendance data
    if (attendanceData.length > 0) {
      setAttendanceData(prevData => 
        prevData.map(data => ({
          ...data,
          date: format(date, 'yyyy-MM-dd'),
        }))
      );
    }
  };

  // Handle status change for a student
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prevData => 
      prevData.map(data => 
        data.student === studentId ? { ...data, status } : data
      )
    );
  };

  // Handle remarks change for a student
  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData(prevData => 
      prevData.map(data => 
        data.student === studentId ? { ...data, remarks } : data
      )
    );
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (attendanceData.length > 0) {
      dispatch(bulkCreateAttendance(attendanceData));
      setFormSubmitted(true);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mark Attendance
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={handleCourseChange}
                label="Course"
                required
              >
                <MenuItem value="">Select a Course</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" required />
                )}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      {selectedCourse && courseStudents.length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Students Enrolled
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courseStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={attendanceData.find(data => data.student === student.id)?.status || 'present'}
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        >
                          <MenuItem value="present">Present</MenuItem>
                          <MenuItem value="absent">Absent</MenuItem>
                          <MenuItem value="late">Late</MenuItem>
                          <MenuItem value="excused">Excused</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Optional remarks"
                        value={attendanceData.find(data => data.student === student.id)?.remarks || ''}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </Box>
        </Paper>
      ) : selectedCourse && courseStudents.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            No students are enrolled in this course.
          </Alert>
        </Paper>
      ) : null}

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
    </Box>
  );
};

export default AttendanceForm;

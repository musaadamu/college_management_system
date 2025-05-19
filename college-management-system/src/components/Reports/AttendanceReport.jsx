import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { generateAttendanceReport } from '../../utils/reportGenerator';

const STATUS_COLORS = {
  'present': '#4caf50',
  'absent': '#f44336',
  'late': '#ff9800',
  'excused': '#2196f3',
};

const AttendanceReport = ({ attendances, courses, users }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter students (only show students)
  const students = users.filter(user => user.role === 'student');

  // Generate report when filters change
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const generatedReport = generateAttendanceReport(
        attendances,
        selectedCourse || null,
        selectedStudent || null
      );
      setReport(generatedReport);
      setLoading(false);
    }, 500);
  }, [selectedCourse, selectedStudent, attendances]);

  // Handle course change
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Handle student change
  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  // Prepare data for status distribution pie chart
  const prepareStatusDistributionData = () => {
    if (!report || !report.statusDistribution) return [];

    return Object.keys(report.statusDistribution).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: report.statusDistribution[status],
    }));
  };

  // Prepare data for attendance rates bar chart
  const prepareAttendanceRatesData = () => {
    if (!report) return [];

    return [
      { name: 'Present', rate: parseFloat(report.presentRate) },
      { name: 'Absent', rate: parseFloat(report.absentRate) },
      { name: 'Late', rate: parseFloat(report.lateRate) },
      { name: 'Excused', rate: parseFloat(report.excusedRate) },
    ];
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Attendance Report
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={handleCourseChange}
              label="Select Course"
            >
              <MenuItem value="">All Courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent}
              onChange={handleStudentChange}
              label="Select Student"
            >
              <MenuItem value="">All Students</MenuItem>
              {students.map((student) => (
                <MenuItem key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : report ? (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Total Records
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.totalRecords}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Present Rate
                </Typography>
                <Typography variant="h3" sx={{ color: STATUS_COLORS.present }}>
                  {report.presentRate}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Absent Rate
                </Typography>
                <Typography variant="h3" sx={{ color: STATUS_COLORS.absent }}>
                  {report.absentRate}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Status Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareStatusDistributionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareStatusDistributionData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={STATUS_COLORS[entry.name.toLowerCase()] || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Attendance Rates
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareAttendanceRatesData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="rate" name="Rate (%)" radius={[5, 5, 0, 0]}>
                        {prepareAttendanceRatesData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={STATUS_COLORS[entry.name.toLowerCase()] || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No attendance data available.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AttendanceReport;

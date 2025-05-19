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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';
import { generateDepartmentPerformanceReport } from '../../utils/reportGenerator';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DepartmentPerformanceReport = ({ enrollments, courses, departments }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate report when department changes
  useEffect(() => {
    if (selectedDepartment) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const generatedReport = generateDepartmentPerformanceReport(
          enrollments,
          courses,
          selectedDepartment
        );
        setReport(generatedReport);
        setLoading(false);
      }, 500);
    } else {
      setReport(null);
    }
  }, [selectedDepartment, enrollments, courses]);

  // Handle department change
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  // Prepare data for course performance chart
  const prepareCoursePerformanceData = () => {
    if (!report || !report.coursePerformance) return [];

    return report.coursePerformance.map(course => ({
      name: course.courseCode,
      averageGrade: parseFloat(course.averageGrade),
      passRate: parseFloat(course.passRate),
      totalStudents: course.totalStudents,
    }));
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Department Performance Report
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              label="Select Department"
            >
              <MenuItem value="">
                <em>Select a department</em>
              </MenuItem>
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.name}
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
                  Total Courses
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.totalCourses}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Total Enrollments
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.totalEnrollments}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Average GPA
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.averageGPA}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Course Performance Comparison
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareCoursePerformanceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="averageGrade" name="Average Grade" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="passRate" name="Pass Rate (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Course Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course Code</TableCell>
                        <TableCell>Course Title</TableCell>
                        <TableCell align="right">Students</TableCell>
                        <TableCell align="right">Average Grade</TableCell>
                        <TableCell align="right">Pass Rate</TableCell>
                        <TableCell align="right">Fail Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.coursePerformance.map((course) => (
                        <TableRow key={course.courseId}>
                          <TableCell>{course.courseCode}</TableCell>
                          <TableCell>{course.courseTitle}</TableCell>
                          <TableCell align="right">{course.totalStudents}</TableCell>
                          <TableCell align="right">{course.averageGrade}</TableCell>
                          <TableCell align="right">{course.passRate}%</TableCell>
                          <TableCell align="right">{course.failRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : selectedDepartment ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No data available for this department.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            Please select a department to view the performance report.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DepartmentPerformanceReport;

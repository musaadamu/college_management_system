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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { generateCoursePerformanceReport } from '../../utils/reportGenerator';

const GRADE_COLORS = {
  'A': '#4caf50',
  'B': '#8bc34a',
  'C': '#ffeb3b',
  'D': '#ff9800',
  'F': '#f44336',
  'W': '#9e9e9e',
  'I': '#9e9e9e',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CoursePerformanceReport = ({ enrollments, courses }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate report when course changes
  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const generatedReport = generateCoursePerformanceReport(enrollments, selectedCourse);
        setReport(generatedReport);
        setLoading(false);
      }, 500);
    } else {
      setReport(null);
    }
  }, [selectedCourse, enrollments]);

  // Handle course change
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Prepare data for grade distribution chart
  const prepareGradeDistributionData = () => {
    if (!report || !report.gradeDistribution) return [];

    return Object.keys(report.gradeDistribution).map(grade => ({
      grade,
      count: report.gradeDistribution[grade],
    }));
  };

  // Prepare data for pass/fail pie chart
  const preparePassFailData = () => {
    if (!report) return [];

    return [
      { name: 'Pass', value: parseFloat(report.passRate) },
      { name: 'Fail', value: parseFloat(report.failRate) },
    ];
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Course Performance Report
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
              <MenuItem value="">
                <em>Select a course</em>
              </MenuItem>
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.code} - {course.title}
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
                  Total Students
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.totalStudents}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Average Grade
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.averageGrade}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Pass Rate
                </Typography>
                <Typography variant="h3" color="primary">
                  {report.passRate}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Grade Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareGradeDistributionData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Students">
                        {prepareGradeDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Pass/Fail Rate
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePassFailData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#4caf50" />
                        <Cell key="cell-1" fill="#f44336" />
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : selectedCourse ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No data available for this course.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            Please select a course to view the performance report.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CoursePerformanceReport;

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { generateEnrollmentTrendReport } from '../../utils/reportGenerator';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EnrollmentTrendReport = ({ enrollments }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);

  // Generate report on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const generatedReport = generateEnrollmentTrendReport(enrollments);
      setReport(generatedReport);
      
      // Set first term as selected by default if available
      if (generatedReport.trends && generatedReport.trends.length > 0) {
        setSelectedTerm(generatedReport.trends[generatedReport.trends.length - 1]);
      }
      
      setLoading(false);
    }, 500);
  }, [enrollments]);

  // Prepare data for enrollment trend chart
  const prepareEnrollmentTrendData = () => {
    if (!report || !report.trends) return [];

    return report.trends.map(term => ({
      name: `${term.semester} ${term.year}`,
      enrollments: term.count,
    }));
  };

  // Prepare data for course enrollment chart for selected term
  const prepareCourseEnrollmentData = () => {
    if (!selectedTerm || !selectedTerm.courses) return [];

    return selectedTerm.courses
      .sort((a, b) => b.count - a.count) // Sort by count in descending order
      .slice(0, 10) // Take top 10 courses
      .map(course => ({
        name: course.courseCode,
        enrollments: course.count,
      }));
  };

  // Handle term selection from the chart
  const handleTermClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedTermName = data.activePayload[0].payload.name;
      const [semester, year] = clickedTermName.split(' ');
      
      const term = report.trends.find(
        t => t.semester === semester && t.year.toString() === year
      );
      
      if (term) {
        setSelectedTerm(term);
      }
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enrollment Trend Report
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : report && report.trends.length > 0 ? (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enrollment Trends by Term
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareEnrollmentTrendData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      onClick={handleTermClick}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="enrollments" 
                        name="Enrollments" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {selectedTerm && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Course Enrollments for {selectedTerm.semester} {selectedTerm.year}
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareCourseEnrollmentData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="enrollments" 
                          name="Enrollments" 
                          fill="#82ca9d" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enrollment Data by Term
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Term</TableCell>
                        <TableCell align="right">Total Enrollments</TableCell>
                        <TableCell align="right">Courses Offered</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.trends.map((term) => (
                        <TableRow 
                          key={`${term.semester}-${term.year}`}
                          hover
                          onClick={() => setSelectedTerm(term)}
                          selected={selectedTerm && 
                            selectedTerm.semester === term.semester && 
                            selectedTerm.year === term.year}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{term.semester} {term.year}</TableCell>
                          <TableCell align="right">{term.count}</TableCell>
                          <TableCell align="right">{term.courses.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No enrollment data available.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EnrollmentTrendReport;

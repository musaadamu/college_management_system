import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  calculateSemesterGPA,
  getGPAClass,
  groupEnrollmentsBySemester,
  formatSemester,
} from '../../utils/gpaCalculator';

const SemesterGPA = ({ enrollments }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Group enrollments by semester
  const groupedEnrollments = groupEnrollmentsBySemester(enrollments);
  
  // Handle accordion expansion
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  // Get grade chip color
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return '#4caf50';
      case 'B':
        return '#8bc34a';
      case 'C':
        return '#ffeb3b';
      case 'D':
        return '#ff9800';
      case 'F':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'dropped':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Semester Performance
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {Object.keys(groupedEnrollments).length > 0 ? (
        Object.keys(groupedEnrollments).map((semesterKey) => {
          const semesterEnrollments = groupedEnrollments[semesterKey];
          const [semester, year] = semesterKey.split('-');
          const { gpa, totalCredits } = calculateSemesterGPA(
            enrollments,
            semester,
            parseInt(year)
          );
          const { color } = getGPAClass(gpa);
          
          return (
            <Accordion
              key={semesterKey}
              expanded={expanded === semesterKey}
              onChange={handleChange(semesterKey)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${semesterKey}-content`}
                id={`${semesterKey}-header`}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {formatSemester(semesterKey)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {totalCredits} Credits
                    </Typography>
                    <Typography variant="h6" sx={{ color, fontWeight: 'bold' }}>
                      GPA: {gpa.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell align="center">Credits</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {semesterEnrollments.map((enrollment) => (
                        <TableRow key={enrollment._id}>
                          <TableCell>{enrollment.course.code}</TableCell>
                          <TableCell>{enrollment.course.title}</TableCell>
                          <TableCell align="center">{enrollment.course.credits}</TableCell>
                          <TableCell align="center">
                            {enrollment.grade ? (
                              <Chip
                                label={enrollment.grade}
                                size="small"
                                sx={{
                                  bgcolor: getGradeColor(enrollment.grade),
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={enrollment.status}
                              color={getStatusColor(enrollment.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
          No enrollment records found.
        </Typography>
      )}
    </Paper>
  );
};

export default SemesterGPA;

/**
 * Convert letter grade to grade points
 * @param {string} grade - Letter grade (A, B, C, D, F, etc.)
 * @returns {number} - Grade points
 */
export const letterToPoints = (grade) => {
  switch (grade) {
    case 'A':
      return 4.0;
    case 'A-':
      return 3.7;
    case 'B+':
      return 3.3;
    case 'B':
      return 3.0;
    case 'B-':
      return 2.7;
    case 'C+':
      return 2.3;
    case 'C':
      return 2.0;
    case 'C-':
      return 1.7;
    case 'D+':
      return 1.3;
    case 'D':
      return 1.0;
    case 'F':
      return 0.0;
    default:
      return null; // For grades like 'W', 'I', etc.
  }
};

/**
 * Calculate GPA from enrollments
 * @param {Array} enrollments - Array of enrollment objects with grade and credits
 * @returns {Object} - Object containing GPA, total credits, and earned credits
 */
export const calculateGPA = (enrollments) => {
  // Filter out enrollments without grades or with non-letter grades
  const gradedEnrollments = enrollments.filter(
    (enrollment) => 
      enrollment.grade && 
      letterToPoints(enrollment.grade) !== null &&
      enrollment.course?.credits
  );

  if (gradedEnrollments.length === 0) {
    return {
      gpa: 0,
      totalCredits: 0,
      earnedCredits: 0,
      totalPoints: 0,
    };
  }

  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  gradedEnrollments.forEach((enrollment) => {
    const credits = enrollment.course.credits;
    const gradePoints = enrollment.gradePoints || letterToPoints(enrollment.grade);
    
    if (gradePoints !== null) {
      totalPoints += gradePoints * credits;
      totalCredits += credits;
      
      // Only count credits for passing grades (D or better)
      if (gradePoints > 0) {
        earnedCredits += credits;
      }
    }
  });

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

  return {
    gpa: parseFloat(gpa),
    totalCredits,
    earnedCredits,
    totalPoints,
  };
};

/**
 * Calculate semester GPA
 * @param {Array} enrollments - Array of enrollment objects
 * @param {string} semester - Semester (Fall, Spring, Summer)
 * @param {number} year - Year
 * @returns {Object} - Object containing GPA, total credits, and earned credits for the semester
 */
export const calculateSemesterGPA = (enrollments, semester, year) => {
  const semesterEnrollments = enrollments.filter(
    (enrollment) => 
      enrollment.semester === semester && 
      enrollment.year === year
  );

  return calculateGPA(semesterEnrollments);
};

/**
 * Calculate cumulative GPA
 * @param {Array} enrollments - Array of enrollment objects
 * @returns {Object} - Object containing GPA, total credits, and earned credits for all semesters
 */
export const calculateCumulativeGPA = (enrollments) => {
  return calculateGPA(enrollments);
};

/**
 * Get GPA class (color and label)
 * @param {number} gpa - GPA value
 * @returns {Object} - Object containing color and label
 */
export const getGPAClass = (gpa) => {
  if (gpa >= 3.5) {
    return { color: '#4caf50', label: 'Excellent' }; // Green
  } else if (gpa >= 3.0) {
    return { color: '#8bc34a', label: 'Very Good' }; // Light Green
  } else if (gpa >= 2.5) {
    return { color: '#ffeb3b', label: 'Good' }; // Yellow
  } else if (gpa >= 2.0) {
    return { color: '#ff9800', label: 'Satisfactory' }; // Orange
  } else {
    return { color: '#f44336', label: 'Unsatisfactory' }; // Red
  }
};

/**
 * Group enrollments by semester
 * @param {Array} enrollments - Array of enrollment objects
 * @returns {Object} - Object with semester-year keys and arrays of enrollments
 */
export const groupEnrollmentsBySemester = (enrollments) => {
  const grouped = {};

  enrollments.forEach((enrollment) => {
    const key = `${enrollment.semester}-${enrollment.year}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(enrollment);
  });

  // Sort keys by year and semester
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const [semA, yearA] = a.split('-');
    const [semB, yearB] = b.split('-');
    
    // Compare years first
    if (yearA !== yearB) {
      return parseInt(yearB) - parseInt(yearA); // Descending order by year
    }
    
    // If years are the same, compare semesters
    const semOrder = { 'Fall': 3, 'Summer': 2, 'Spring': 1 };
    return semOrder[semB] - semOrder[semA]; // Descending order by semester
  });

  // Create a new object with sorted keys
  const sortedGrouped = {};
  sortedKeys.forEach(key => {
    sortedGrouped[key] = grouped[key];
  });

  return sortedGrouped;
};

/**
 * Format semester key for display
 * @param {string} semesterKey - Semester key in format "Semester-Year"
 * @returns {string} - Formatted semester string
 */
export const formatSemester = (semesterKey) => {
  const [semester, year] = semesterKey.split('-');
  return `${semester} ${year}`;
};

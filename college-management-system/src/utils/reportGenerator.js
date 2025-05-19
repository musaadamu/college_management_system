/**
 * Generate course performance report
 * @param {Array} enrollments - Array of enrollment objects
 * @param {string} courseId - Course ID to filter enrollments
 * @returns {Object} - Object containing course performance statistics
 */
export const generateCoursePerformanceReport = (enrollments, courseId) => {
  // Filter enrollments for the specified course
  const courseEnrollments = enrollments.filter(
    (enrollment) => enrollment.course._id === courseId && enrollment.grade
  );

  if (courseEnrollments.length === 0) {
    return {
      totalStudents: 0,
      averageGrade: 0,
      gradeDistribution: {},
      passRate: 0,
      failRate: 0,
    };
  }

  // Calculate grade distribution
  const gradeDistribution = {};
  courseEnrollments.forEach((enrollment) => {
    const grade = enrollment.grade;
    if (grade) {
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    }
  });

  // Calculate pass/fail rates
  const passingGrades = courseEnrollments.filter(
    (enrollment) => enrollment.grade && enrollment.grade !== 'F' && enrollment.grade !== 'W'
  ).length;
  
  const failingGrades = courseEnrollments.filter(
    (enrollment) => enrollment.grade === 'F'
  ).length;

  const passRate = (passingGrades / courseEnrollments.length) * 100;
  const failRate = (failingGrades / courseEnrollments.length) * 100;

  // Calculate average grade points
  const totalGradePoints = courseEnrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.gradePoints || 0);
  }, 0);
  
  const averageGrade = totalGradePoints / courseEnrollments.length;

  return {
    totalStudents: courseEnrollments.length,
    averageGrade: averageGrade.toFixed(2),
    gradeDistribution,
    passRate: passRate.toFixed(2),
    failRate: failRate.toFixed(2),
  };
};

/**
 * Generate department performance report
 * @param {Array} enrollments - Array of enrollment objects
 * @param {Array} courses - Array of course objects
 * @param {string} departmentId - Department ID to filter courses
 * @returns {Object} - Object containing department performance statistics
 */
export const generateDepartmentPerformanceReport = (enrollments, courses, departmentId) => {
  // Filter courses for the specified department
  const departmentCourses = courses.filter(
    (course) => course.department._id === departmentId
  );

  if (departmentCourses.length === 0) {
    return {
      totalCourses: 0,
      totalEnrollments: 0,
      averageGPA: 0,
      coursePerformance: [],
    };
  }

  const departmentCourseIds = departmentCourses.map(course => course._id);

  // Filter enrollments for department courses
  const departmentEnrollments = enrollments.filter(
    (enrollment) => departmentCourseIds.includes(enrollment.course._id) && enrollment.grade
  );

  // Calculate average GPA for department
  const totalGradePoints = departmentEnrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.gradePoints || 0);
  }, 0);
  
  const averageGPA = departmentEnrollments.length > 0 
    ? (totalGradePoints / departmentEnrollments.length).toFixed(2)
    : 0;

  // Generate performance report for each course
  const coursePerformance = departmentCourses.map(course => {
    const report = generateCoursePerformanceReport(enrollments, course._id);
    return {
      courseId: course._id,
      courseCode: course.code,
      courseTitle: course.title,
      ...report,
    };
  });

  return {
    totalCourses: departmentCourses.length,
    totalEnrollments: departmentEnrollments.length,
    averageGPA,
    coursePerformance,
  };
};

/**
 * Generate student performance report
 * @param {Array} enrollments - Array of enrollment objects for a specific student
 * @returns {Object} - Object containing student performance statistics
 */
export const generateStudentPerformanceReport = (enrollments) => {
  // Filter completed enrollments with grades
  const completedEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === 'completed' && enrollment.grade
  );

  if (completedEnrollments.length === 0) {
    return {
      totalCourses: 0,
      totalCredits: 0,
      gpa: 0,
      coursePerformance: [],
    };
  }

  // Calculate total credits
  const totalCredits = completedEnrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.course.credits || 0);
  }, 0);

  // Calculate GPA
  const totalGradePoints = completedEnrollments.reduce((sum, enrollment) => {
    const credits = enrollment.course.credits || 0;
    const gradePoints = enrollment.gradePoints || 0;
    return sum + (gradePoints * credits);
  }, 0);
  
  const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

  // Generate performance report for each course
  const coursePerformance = completedEnrollments.map(enrollment => {
    return {
      courseId: enrollment.course._id,
      courseCode: enrollment.course.code,
      courseTitle: enrollment.course.title,
      semester: enrollment.semester,
      year: enrollment.year,
      grade: enrollment.grade,
      gradePoints: enrollment.gradePoints,
      credits: enrollment.course.credits,
    };
  });

  return {
    totalCourses: completedEnrollments.length,
    totalCredits,
    gpa,
    coursePerformance,
  };
};

/**
 * Generate attendance report
 * @param {Array} attendances - Array of attendance objects
 * @param {string} courseId - Course ID to filter attendances (optional)
 * @param {string} studentId - Student ID to filter attendances (optional)
 * @returns {Object} - Object containing attendance statistics
 */
export const generateAttendanceReport = (attendances, courseId = null, studentId = null) => {
  // Filter attendances based on parameters
  let filteredAttendances = [...attendances];
  
  if (courseId) {
    filteredAttendances = filteredAttendances.filter(
      (attendance) => attendance.course._id === courseId
    );
  }
  
  if (studentId) {
    filteredAttendances = filteredAttendances.filter(
      (attendance) => attendance.student._id === studentId
    );
  }

  if (filteredAttendances.length === 0) {
    return {
      totalRecords: 0,
      presentRate: 0,
      absentRate: 0,
      lateRate: 0,
      excusedRate: 0,
      statusDistribution: {},
    };
  }

  // Calculate status distribution
  const statusDistribution = {};
  filteredAttendances.forEach((attendance) => {
    const status = attendance.status;
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });

  // Calculate rates
  const presentCount = statusDistribution.present || 0;
  const absentCount = statusDistribution.absent || 0;
  const lateCount = statusDistribution.late || 0;
  const excusedCount = statusDistribution.excused || 0;
  const totalCount = filteredAttendances.length;

  const presentRate = (presentCount / totalCount) * 100;
  const absentRate = (absentCount / totalCount) * 100;
  const lateRate = (lateCount / totalCount) * 100;
  const excusedRate = (excusedCount / totalCount) * 100;

  return {
    totalRecords: totalCount,
    presentRate: presentRate.toFixed(2),
    absentRate: absentRate.toFixed(2),
    lateRate: lateRate.toFixed(2),
    excusedRate: excusedRate.toFixed(2),
    statusDistribution,
  };
};

/**
 * Generate enrollment trend report
 * @param {Array} enrollments - Array of enrollment objects
 * @returns {Object} - Object containing enrollment trends by semester and year
 */
export const generateEnrollmentTrendReport = (enrollments) => {
  // Group enrollments by semester and year
  const enrollmentsByTerm = {};
  
  enrollments.forEach((enrollment) => {
    const key = `${enrollment.semester}-${enrollment.year}`;
    
    if (!enrollmentsByTerm[key]) {
      enrollmentsByTerm[key] = {
        semester: enrollment.semester,
        year: enrollment.year,
        count: 0,
        courses: {},
      };
    }
    
    enrollmentsByTerm[key].count += 1;
    
    // Count enrollments by course
    const courseId = enrollment.course._id;
    if (!enrollmentsByTerm[key].courses[courseId]) {
      enrollmentsByTerm[key].courses[courseId] = {
        courseId,
        courseCode: enrollment.course.code,
        courseTitle: enrollment.course.title,
        count: 0,
      };
    }
    
    enrollmentsByTerm[key].courses[courseId].count += 1;
  });

  // Convert courses object to array for each term
  Object.keys(enrollmentsByTerm).forEach((key) => {
    enrollmentsByTerm[key].courses = Object.values(enrollmentsByTerm[key].courses);
  });

  // Sort terms by year and semester
  const sortedTerms = Object.keys(enrollmentsByTerm).sort((a, b) => {
    const [semA, yearA] = a.split('-');
    const [semB, yearB] = b.split('-');
    
    // Compare years first
    if (yearA !== yearB) {
      return parseInt(yearA) - parseInt(yearB);
    }
    
    // If years are the same, compare semesters
    const semOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3 };
    return semOrder[semA] - semOrder[semB];
  });

  // Create sorted result
  const trends = sortedTerms.map(key => enrollmentsByTerm[key]);

  return {
    totalTerms: trends.length,
    trends,
  };
};

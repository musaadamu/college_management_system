/**
 * Generate calendar events from course schedules
 * @param {Array} courses - Array of course objects with schedule information
 * @returns {Array} - Array of calendar events
 */
export const generateCourseEvents = (courses) => {
  const events = [];
  
  // Define semester date ranges (these would ideally come from the backend)
  const semesterRanges = {
    'Fall': { start: '2023-09-01', end: '2023-12-15' },
    'Spring': { start: '2024-01-15', end: '2024-05-15' },
    'Summer': { start: '2024-06-01', end: '2024-08-15' },
  };
  
  // Define day of week mapping
  const dayMapping = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 0,
  };
  
  courses.forEach(course => {
    // Skip courses without schedule information
    if (!course.schedule || !course.schedule.days || !course.schedule.startTime || !course.schedule.endTime) {
      return;
    }
    
    // Get semester date range
    const semesterRange = semesterRanges[course.semester];
    if (!semesterRange) return;
    
    // Parse days of the week
    const days = Array.isArray(course.schedule.days) 
      ? course.schedule.days 
      : course.schedule.days.split(',').map(day => day.trim());
    
    // Parse start and end times
    const startTime = course.schedule.startTime;
    const endTime = course.schedule.endTime;
    
    // Generate recurring events for each day of the week
    days.forEach(day => {
      const dayOfWeek = dayMapping[day];
      if (dayOfWeek === undefined) return;
      
      // Create event
      events.push({
        id: `${course._id}-${day}`,
        title: `${course.code} - ${course.title}`,
        daysOfWeek: [dayOfWeek],
        startTime,
        endTime,
        startRecur: semesterRange.start,
        endRecur: semesterRange.end,
        extendedProps: {
          course,
          location: course.schedule.location || 'TBA',
          instructor: course.instructor ? course.instructor.name : 'TBA',
        },
        backgroundColor: getRandomColor(course._id),
      });
    });
  });
  
  return events;
};

/**
 * Generate calendar events from academic dates
 * @param {Array} academicDates - Array of academic date objects
 * @returns {Array} - Array of calendar events
 */
export const generateAcademicEvents = (academicDates) => {
  return academicDates.map(date => ({
    id: date._id,
    title: date.title,
    start: date.date,
    allDay: true,
    display: 'background',
    backgroundColor: '#f44336',
    extendedProps: {
      description: date.description,
      type: date.type,
    },
  }));
};

/**
 * Generate a random color based on a string
 * @param {string} str - String to generate color from
 * @returns {string} - Hex color code
 */
const getRandomColor = (str) => {
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  
  // Ensure the color is not too light
  const minBrightness = 50; // Minimum brightness value
  const r2 = Math.max(r, minBrightness);
  const g2 = Math.max(g, minBrightness);
  const b2 = Math.max(b, minBrightness);
  
  return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
};

/**
 * Format time for display
 * @param {string} time - Time in 24-hour format (HH:MM)
 * @returns {string} - Formatted time in 12-hour format with AM/PM
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format date for display
 * @param {string} date - Date in ISO format
 * @returns {string} - Formatted date (Month Day, Year)
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

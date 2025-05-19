import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../../services/courseService';

const initialState = {
  courses: [],
  course: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all courses
export const getAllCourses = createAsyncThunk(
  'courses/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = courseService.getToken(thunkAPI.getState());
      return await courseService.getAllCourses(filters, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get course by ID
export const getCourseById = createAsyncThunk(
  'courses/getById',
  async (id, thunkAPI) => {
    try {
      const token = courseService.getToken(thunkAPI.getState());
      return await courseService.getCourseById(id, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new course
export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData, thunkAPI) => {
    try {
      const token = courseService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await courseService.createCourse(courseData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update course
export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, courseData }, thunkAPI) => {
    try {
      const token = courseService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await courseService.updateCourse(id, courseData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete course
export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id, thunkAPI) => {
    try {
      const token = courseService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await courseService.deleteCourse(id, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCourse: (state) => {
      state.course = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all courses
      .addCase(getAllCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses = action.payload.data.courses;
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get course by ID
      .addCase(getCourseById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.course = action.payload.data.course;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses.push(action.payload.data.course);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses = state.courses.map((course) =>
          course._id === action.payload.data.course._id
            ? action.payload.data.course
            : course
        );
        state.course = action.payload.data.course;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses = state.courses.filter(
          (course) => course._id !== action.meta.arg
        );
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCourse } = courseSlice.actions;
export default courseSlice.reducer;

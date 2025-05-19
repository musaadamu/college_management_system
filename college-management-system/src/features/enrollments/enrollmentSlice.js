import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enrollmentService from '../../services/enrollmentService';

const initialState = {
  enrollments: [],
  enrollment: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all enrollments
export const getAllEnrollments = createAsyncThunk(
  'enrollments/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = enrollmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await enrollmentService.getAllEnrollments(filters, token);
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

// Get enrollment by ID
export const getEnrollmentById = createAsyncThunk(
  'enrollments/getById',
  async (id, thunkAPI) => {
    try {
      const token = enrollmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await enrollmentService.getEnrollmentById(id, token);
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

// Create new enrollment
export const createEnrollment = createAsyncThunk(
  'enrollments/create',
  async (enrollmentData, thunkAPI) => {
    try {
      const token = enrollmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await enrollmentService.createEnrollment(enrollmentData, token);
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

// Update enrollment
export const updateEnrollment = createAsyncThunk(
  'enrollments/update',
  async ({ id, enrollmentData }, thunkAPI) => {
    try {
      const token = enrollmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await enrollmentService.updateEnrollment(id, enrollmentData, token);
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

// Delete enrollment
export const deleteEnrollment = createAsyncThunk(
  'enrollments/delete',
  async (id, thunkAPI) => {
    try {
      const token = enrollmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await enrollmentService.deleteEnrollment(id, token);
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

export const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearEnrollment: (state) => {
      state.enrollment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all enrollments
      .addCase(getAllEnrollments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments = action.payload.data.enrollments;
      })
      .addCase(getAllEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get enrollment by ID
      .addCase(getEnrollmentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEnrollmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollment = action.payload.data.enrollment;
      })
      .addCase(getEnrollmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create enrollment
      .addCase(createEnrollment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments.push(action.payload.data.enrollment);
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update enrollment
      .addCase(updateEnrollment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments = state.enrollments.map((enrollment) =>
          enrollment._id === action.payload.data.enrollment._id
            ? action.payload.data.enrollment
            : enrollment
        );
        state.enrollment = action.payload.data.enrollment;
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete enrollment
      .addCase(deleteEnrollment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments = state.enrollments.filter(
          (enrollment) => enrollment._id !== action.meta.arg
        );
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

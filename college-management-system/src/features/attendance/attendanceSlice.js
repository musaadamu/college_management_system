import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../services/attendanceService';

const initialState = {
  attendances: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all attendance records
export const getAllAttendances = createAsyncThunk(
  'attendance/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.getAllAttendances(filters, token);
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

// Get attendance records for a specific student
export const getStudentAttendance = createAsyncThunk(
  'attendance/getByStudent',
  async ({ studentId, filters = {} }, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.getStudentAttendance(studentId, filters, token);
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

// Get attendance records for a specific course
export const getCourseAttendance = createAsyncThunk(
  'attendance/getByCourse',
  async ({ courseId, filters = {} }, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.getCourseAttendance(courseId, filters, token);
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

// Create new attendance record
export const createAttendance = createAsyncThunk(
  'attendance/create',
  async (attendanceData, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.createAttendance(attendanceData, token);
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

// Bulk create attendance records
export const bulkCreateAttendance = createAsyncThunk(
  'attendance/bulkCreate',
  async (attendanceDataArray, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.bulkCreateAttendance(attendanceDataArray, token);
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

// Update attendance record
export const updateAttendance = createAsyncThunk(
  'attendance/update',
  async ({ id, attendanceData }, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.updateAttendance(id, attendanceData, token);
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

// Delete attendance record
export const deleteAttendance = createAsyncThunk(
  'attendance/delete',
  async (id, thunkAPI) => {
    try {
      const token = attendanceService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await attendanceService.deleteAttendance(id, token);
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

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all attendance records
      .addCase(getAllAttendances.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAttendances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = action.payload.data.attendances;
      })
      .addCase(getAllAttendances.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get student attendance
      .addCase(getStudentAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudentAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = action.payload.data.attendances;
      })
      .addCase(getStudentAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get course attendance
      .addCase(getCourseAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourseAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = action.payload.data.attendances;
      })
      .addCase(getCourseAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create attendance
      .addCase(createAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances.push(action.payload.data.attendance);
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Bulk create attendance
      .addCase(bulkCreateAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkCreateAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Add all created attendance records to state
        action.payload.forEach(response => {
          if (response.data && response.data.attendance) {
            state.attendances.push(response.data.attendance);
          }
        });
      })
      .addCase(bulkCreateAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update attendance
      .addCase(updateAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = state.attendances.map((attendance) =>
          attendance._id === action.payload.data.attendance._id
            ? action.payload.data.attendance
            : attendance
        );
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = state.attendances.filter(
          (attendance) => attendance._id !== action.meta.arg
        );
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = attendanceSlice.actions;
export default attendanceSlice.reducer;

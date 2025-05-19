import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import calendarService from '../../services/calendarService';

const initialState = {
  academicDates: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all academic dates
export const getAllAcademicDates = createAsyncThunk(
  'calendar/getAll',
  async (_, thunkAPI) => {
    try {
      const token = calendarService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await calendarService.getAllAcademicDates(token);
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

// Create new academic date
export const createAcademicDate = createAsyncThunk(
  'calendar/create',
  async (dateData, thunkAPI) => {
    try {
      const token = calendarService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await calendarService.createAcademicDate(dateData, token);
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

// Update academic date
export const updateAcademicDate = createAsyncThunk(
  'calendar/update',
  async ({ id, dateData }, thunkAPI) => {
    try {
      const token = calendarService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await calendarService.updateAcademicDate(id, dateData, token);
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

// Delete academic date
export const deleteAcademicDate = createAsyncThunk(
  'calendar/delete',
  async (id, thunkAPI) => {
    try {
      const token = calendarService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await calendarService.deleteAcademicDate(id, token);
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

export const calendarSlice = createSlice({
  name: 'calendar',
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
      // Get all academic dates
      .addCase(getAllAcademicDates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAcademicDates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicDates = action.payload.data.academicDates || [];
      })
      .addCase(getAllAcademicDates.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create academic date
      .addCase(createAcademicDate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAcademicDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicDates.push(action.payload.data.academicDate);
      })
      .addCase(createAcademicDate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update academic date
      .addCase(updateAcademicDate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAcademicDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicDates = state.academicDates.map((date) =>
          date._id === action.payload.data.academicDate._id
            ? action.payload.data.academicDate
            : date
        );
      })
      .addCase(updateAcademicDate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete academic date
      .addCase(deleteAcademicDate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAcademicDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicDates = state.academicDates.filter(
          (date) => date._id !== action.meta.arg
        );
      })
      .addCase(deleteAcademicDate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = calendarSlice.actions;
export default calendarSlice.reducer;

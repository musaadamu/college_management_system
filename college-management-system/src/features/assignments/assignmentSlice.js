import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assignmentService from '../../services/assignmentService';

const initialState = {
  assignments: [],
  selectedAssignment: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all assignments
export const getAllAssignments = createAsyncThunk(
  'assignments/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.getAllAssignments(filters, token);
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

// Get assignment by ID
export const getAssignmentById = createAsyncThunk(
  'assignments/getById',
  async (id, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.getAssignmentById(id, token);
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

// Create new assignment
export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (assignmentData, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.createAssignment(assignmentData, token);
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

// Update assignment
export const updateAssignment = createAsyncThunk(
  'assignments/update',
  async ({ id, assignmentData }, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.updateAssignment(id, assignmentData, token);
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

// Delete assignment
export const deleteAssignment = createAsyncThunk(
  'assignments/delete',
  async (id, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.deleteAssignment(id, token);
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

// Submit assignment
export const submitAssignment = createAsyncThunk(
  'assignments/submit',
  async ({ id, submissionData }, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.submitAssignment(id, submissionData, token);
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

// Grade submission
export const gradeSubmission = createAsyncThunk(
  'assignments/grade',
  async ({ assignmentId, studentId, gradeData }, thunkAPI) => {
    try {
      const token = assignmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await assignmentService.gradeSubmission(
        assignmentId,
        studentId,
        gradeData,
        token
      );
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

export const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSelectedAssignment: (state) => {
      state.selectedAssignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all assignments
      .addCase(getAllAssignments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assignments = action.payload.data.assignments;
      })
      .addCase(getAllAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get assignment by ID
      .addCase(getAssignmentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAssignmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedAssignment = action.payload.data.assignment;
      })
      .addCase(getAssignmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assignments.push(action.payload.data.assignment);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assignments = state.assignments.map((assignment) =>
          assignment._id === action.payload.data.assignment._id
            ? action.payload.data.assignment
            : assignment
        );
        state.selectedAssignment = action.payload.data.assignment;
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assignments = state.assignments.filter(
          (assignment) => assignment._id !== action.meta.arg
        );
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Submit assignment
      .addCase(submitAssignment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedAssignment = action.payload.data.assignment;
        
        // Update assignment in assignments array
        state.assignments = state.assignments.map((assignment) =>
          assignment._id === action.payload.data.assignment._id
            ? action.payload.data.assignment
            : assignment
        );
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Grade submission
      .addCase(gradeSubmission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedAssignment = action.payload.data.assignment;
        
        // Update assignment in assignments array
        state.assignments = state.assignments.map((assignment) =>
          assignment._id === action.payload.data.assignment._id
            ? action.payload.data.assignment
            : assignment
        );
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearSelectedAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;

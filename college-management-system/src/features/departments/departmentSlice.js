import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import departmentService from '../../services/departmentService';

const initialState = {
  departments: [],
  department: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all departments
export const getAllDepartments = createAsyncThunk(
  'departments/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = departmentService.getToken(thunkAPI.getState());
      return await departmentService.getAllDepartments(filters, token);
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

// Get department by ID
export const getDepartmentById = createAsyncThunk(
  'departments/getById',
  async (id, thunkAPI) => {
    try {
      const token = departmentService.getToken(thunkAPI.getState());
      return await departmentService.getDepartmentById(id, token);
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

// Create new department
export const createDepartment = createAsyncThunk(
  'departments/create',
  async (departmentData, thunkAPI) => {
    try {
      const token = departmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await departmentService.createDepartment(departmentData, token);
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

// Update department
export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, departmentData }, thunkAPI) => {
    try {
      const token = departmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await departmentService.updateDepartment(id, departmentData, token);
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

// Delete department
export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id, thunkAPI) => {
    try {
      const token = departmentService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await departmentService.deleteDepartment(id, token);
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

export const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearDepartment: (state) => {
      state.department = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all departments
      .addCase(getAllDepartments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments = action.payload.data.departments;
      })
      .addCase(getAllDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get department by ID
      .addCase(getDepartmentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.department = action.payload.data.department;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments.push(action.payload.data.department);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments = state.departments.map((department) =>
          department._id === action.payload.data.department._id
            ? action.payload.data.department
            : department
        );
        state.department = action.payload.data.department;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete department
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments = state.departments.filter(
          (department) => department._id !== action.meta.arg
        );
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;

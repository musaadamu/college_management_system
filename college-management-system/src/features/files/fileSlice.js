import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fileService from '../../services/fileService';

const initialState = {
  files: [],
  selectedFile: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all files
export const getAllFiles = createAsyncThunk(
  'files/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = fileService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await fileService.getAllFiles(filters, token);
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

// Get file by ID
export const getFileById = createAsyncThunk(
  'files/getById',
  async (id, thunkAPI) => {
    try {
      const token = fileService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await fileService.getFileById(id, token);
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

// Upload file
export const uploadFile = createAsyncThunk(
  'files/upload',
  async (fileData, thunkAPI) => {
    try {
      const token = fileService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await fileService.uploadFile(fileData, token);
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

// Delete file
export const deleteFile = createAsyncThunk(
  'files/delete',
  async (id, thunkAPI) => {
    try {
      const token = fileService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authorized');
      }
      
      return await fileService.deleteFile(id, token);
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

export const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSelectedFile: (state) => {
      state.selectedFile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all files
      .addCase(getAllFiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.files = action.payload.data.files;
      })
      .addCase(getAllFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get file by ID
      .addCase(getFileById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedFile = action.payload.data.file;
      })
      .addCase(getFileById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.files.push(action.payload.data.file);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete file
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.files = state.files.filter(
          (file) => file._id !== action.meta.arg
        );
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearSelectedFile } = fileSlice.actions;
export default fileSlice.reducer;

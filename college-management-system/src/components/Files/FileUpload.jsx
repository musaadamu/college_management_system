import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadFile, reset } from '../../features/files/fileSlice';

const FileUpload = ({ course, assignment, fileType, onUploadSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.files
  );

  // Local state
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [errors, setErrors] = useState({});

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Set name to file name by default if not already set
    if (!name && selectedFile) {
      setName(selectedFile.name);
    }
    
    // Clear file-related errors
    if (errors.file) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        file: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = {};
    
    if (!file) {
      validationErrors.file = 'Please select a file to upload';
    } else if (file.size > 10 * 1024 * 1024) { // 10MB limit
      validationErrors.file = 'File size cannot exceed 10MB';
    }
    
    if (!name) {
      validationErrors.name = 'File name is required';
    }
    
    if (!fileType) {
      validationErrors.fileType = 'File type is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('fileType', fileType);
    formData.append('isPublic', isPublic);
    
    if (course) {
      formData.append('course', course);
    }
    
    if (assignment) {
      formData.append('assignment', assignment);
    }
    
    // Upload file
    dispatch(uploadFile(formData));
  };

  // Handle success/error messages
  useState(() => {
    if (isSuccess) {
      setSnackbarMessage('File uploaded successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Reset form
      setFile(null);
      setName('');
      setDescription('');
      setIsPublic(false);
      
      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      dispatch(reset());
    }
    
    if (isError) {
      setSnackbarMessage(message || 'Failed to upload file');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, onUploadSuccess]);

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload File
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {file ? file.name : 'Click to select a file or drag and drop'}
          </Typography>
          {file && (
            <Typography variant="body2" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          )}
          {errors.file && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errors.file}
            </Typography>
          )}
        </Box>
        
        <TextField
          fullWidth
          label="File Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
          required
        />
        
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
        
        {!fileType && (
          <FormControl fullWidth margin="normal" error={!!errors.fileType}>
            <InputLabel>File Type</InputLabel>
            <Select
              value={fileType || ''}
              onChange={(e) => setFileType(e.target.value)}
              label="File Type"
              required
            >
              <MenuItem value="resource">Resource</MenuItem>
              <MenuItem value="assignment">Assignment</MenuItem>
              <MenuItem value="submission">Submission</MenuItem>
            </Select>
            {errors.fileType && (
              <FormHelperText>{errors.fileType}</FormHelperText>
            )}
          </FormControl>
        )}
        
        <FormControlLabel
          control={
            <Checkbox
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          }
          label="Make file public"
          sx={{ mt: 1, mb: 2, display: 'block' }}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {isLoading ? 'Uploading...' : 'Upload File'}
        </Button>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FileUpload;

import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { uploadAttachments } from '../../features/messages/messageSlice';
import AttachmentList from './AttachmentList';

const FileUpload = ({ onFilesSelected }) => {
  const dispatch = useDispatch();
  const { isLoading, uploadedAttachments } = useSelector((state) => state.messages);

  // Local state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Menu state
  const open = Boolean(anchorEl);

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle file input click
  const handleFileInputClick = (inputRef) => {
    handleMenuClose();
    inputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size of 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Validate total number of files (max 5)
    if (selectedFiles.length + files.length > 5) {
      setError('You can only upload up to 5 files at a time');
      return;
    }

    // Add files to selected files
    setSelectedFiles(prev => [...prev, ...files]);

    // Open preview dialog
    setPreviewOpen(true);

    // Reset file input
    event.target.value = '';
  };

  // Handle preview dialog close
  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  // Handle file removal
  const handleRemoveFile = (file) => {
    setSelectedFiles(prev => prev.filter(f => f !== file));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Upload files
      const result = await dispatch(uploadAttachments(selectedFiles)).unwrap();

      // Close preview dialog
      setPreviewOpen(false);

      // Clear selected files
      setSelectedFiles([]);

      // Notify parent component
      if (onFilesSelected && result.data && result.data.files) {
        onFilesSelected(result.data.files);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Error uploading files. Please try again.');
    }
  };

  // Handle error dialog close
  const handleErrorClose = () => {
    setError('');
  };

  return (
    <>
      <Tooltip title="Attach files">
        <IconButton
          aria-label="attach files"
          onClick={handleMenuOpen}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : <AttachFileIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleFileInputClick(imageInputRef)}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Image</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFileInputClick(videoInputRef)}>
          <ListItemIcon>
            <VideoLibraryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Video</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFileInputClick(audioInputRef)}>
          <ListItemIcon>
            <AudioFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Audio</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFileInputClick(documentInputRef)}>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Document</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFileInputClick(fileInputRef)}>
          <ListItemIcon>
            <AttachFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Any File</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
        multiple
      />
      <input
        type="file"
        ref={videoInputRef}
        style={{ display: 'none' }}
        accept="video/*"
        onChange={handleFileChange}
        multiple
      />
      <input
        type="file"
        ref={audioInputRef}
        style={{ display: 'none' }}
        accept="audio/*"
        onChange={handleFileChange}
        multiple
      />
      <input
        type="file"
        ref={documentInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        onChange={handleFileChange}
        multiple
      />

      {/* Preview dialog */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Selected Files
          <IconButton
            aria-label="close"
            onClick={handlePreviewClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedFiles.length > 0 ? (
            <AttachmentList
              attachments={selectedFiles}
              onRemove={handleRemoveFile}
              isUploaded={true}
              showTitle={false}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No files selected
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handlePreviewClose}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={selectedFiles.length === 0 || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error dialog */}
      <Dialog
        open={!!error}
        onClose={handleErrorClose}
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleErrorClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUpload;

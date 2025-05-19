import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { deleteFile } from '../../features/files/fileSlice';
import fileService from '../../services/fileService';

const FileList = ({ files, title = 'Files', onDelete }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.files);
  
  // Local state
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (mimeType === 'application/pdf') {
      return <PictureAsPdfIcon />;
    } else if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return <DescriptionIcon />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };

  // Format file size
  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get file type color
  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'resource':
        return 'primary';
      case 'assignment':
        return 'secondary';
      case 'submission':
        return 'success';
      default:
        return 'default';
    }
  };

  // Handle file download
  const handleDownload = (file) => {
    const downloadUrl = fileService.getDownloadUrl(file._id);
    window.open(downloadUrl, '_blank');
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (file) => {
    setSelectedFile(file);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedFile(null);
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    if (selectedFile) {
      dispatch(deleteFile(selectedFile._id));
      handleCloseDeleteDialog();
      
      // Call delete callback if provided
      if (onDelete) {
        onDelete(selectedFile._id);
      }
    }
  };

  // Open preview dialog
  const handleOpenPreviewDialog = (file) => {
    setSelectedFile(file);
    setOpenPreviewDialog(true);
  };

  // Close preview dialog
  const handleClosePreviewDialog = () => {
    setOpenPreviewDialog(false);
    setSelectedFile(null);
  };

  // Check if user can delete a file
  const canDeleteFile = (file) => {
    return (
      user.user.role === 'admin' ||
      file.uploadedBy._id === user.user.id
    );
  };

  // Check if file is previewable
  const isPreviewable = (mimeType) => {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : files.length > 0 ? (
        <List>
          {files.map((file) => (
            <ListItem
              key={file._id}
              sx={{
                border: '1px solid #eee',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon>
                {getFileIcon(file.mimeType)}
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      {formatFileSize(file.size)} • Uploaded {formatDate(file.createdAt)}
                      {file.uploadedBy && ` by ${file.uploadedBy.name}`}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={file.fileType}
                        color={getFileTypeColor(file.fileType)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {file.isPublic && (
                        <Chip
                          label="Public"
                          color="info"
                          size="small"
                        />
                      )}
                    </Box>
                    {file.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {file.description}
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                {isPreviewable(file.mimeType) && (
                  <Tooltip title="Preview">
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenPreviewDialog(file)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Download">
                  <IconButton
                    edge="end"
                    onClick={() => handleDownload(file)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                {canDeleteFile(file) && (
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(file)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">No files found.</Alert>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the file "{selectedFile?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteFile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog
        open={openPreviewDialog}
        onClose={handleClosePreviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedFile?.name}</DialogTitle>
        <DialogContent>
          {selectedFile?.mimeType.startsWith('image/') ? (
            <Box
              component="img"
              src={selectedFile?.url}
              alt={selectedFile?.name}
              sx={{
                maxWidth: '100%',
                maxHeight: '70vh',
                display: 'block',
                margin: '0 auto',
              }}
            />
          ) : selectedFile?.mimeType === 'application/pdf' ? (
            <Box
              component="iframe"
              src={selectedFile?.url}
              sx={{
                width: '100%',
                height: '70vh',
                border: 'none',
              }}
            />
          ) : (
            <Typography>
              Preview not available for this file type.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewDialog}>Close</Button>
          <Button
            onClick={() => handleDownload(selectedFile)}
            color="primary"
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileList;

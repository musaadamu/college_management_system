import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudioFileIcon from '@mui/icons-material/AudioFile';

const AttachmentPreview = ({ file, onRemove, isUploaded = false }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Handle dialog open
  const handleOpen = () => {
    setOpen(true);
  };
  
  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
  };
  
  // Handle file download
  const handleDownload = () => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };
  
  // Get file icon based on mime type
  const getFileIcon = () => {
    if (!file.mimeType) return <InsertDriveFileIcon />;
    
    if (file.mimeType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (file.mimeType === 'application/pdf') {
      return <PictureAsPdfIcon />;
    } else if (file.mimeType.startsWith('video/')) {
      return <VideoLibraryIcon />;
    } else if (file.mimeType.startsWith('audio/')) {
      return <AudioFileIcon />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };
  
  // Format file size
  const formatFileSize = (size) => {
    if (!size) return '';
    
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
  };
  
  // Check if file is an image
  const isImage = file.mimeType && file.mimeType.startsWith('image/');
  
  // Check if file is a video
  const isVideo = file.mimeType && file.mimeType.startsWith('video/');
  
  // Check if file is an audio
  const isAudio = file.mimeType && file.mimeType.startsWith('audio/');
  
  // Check if file is a PDF
  const isPdf = file.mimeType === 'application/pdf';
  
  // Get file preview URL
  const getPreviewUrl = () => {
    if (isUploaded && file instanceof File) {
      return URL.createObjectURL(file);
    }
    
    return file.url;
  };
  
  // Get file name
  const getFileName = () => {
    if (isUploaded && file instanceof File) {
      return file.name;
    }
    
    return file.name || file.originalName;
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: 80,
          height: 80,
          border: '1px solid #eee',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
        onClick={handleOpen}
      >
        {isImage ? (
          <Box
            component="img"
            src={getPreviewUrl()}
            alt={getFileName()}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <>
            {getFileIcon()}
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: 0.5,
              }}
            >
              {getFileName().length > 10
                ? getFileName().substring(0, 7) + '...'
                : getFileName()}
            </Typography>
          </>
        )}
        
        {onRemove && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'background.paper',
              border: '1px solid #ddd',
              '&:hover': {
                bgcolor: 'background.default',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={isImage || isVideo || isPdf ? 'md' : 'xs'}
        fullWidth
      >
        <DialogTitle>
          {getFileName()}
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          {isImage && (
            <Box
              component="img"
              src={getPreviewUrl()}
              alt={getFileName()}
              sx={{
                maxWidth: '100%',
                maxHeight: '70vh',
                display: 'block',
                margin: '0 auto',
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          )}
          
          {isVideo && (
            <Box
              component="video"
              controls
              sx={{
                width: '100%',
                maxHeight: '70vh',
              }}
              onLoadStart={() => setLoading(true)}
              onLoadedData={() => setLoading(false)}
              onError={() => setLoading(false)}
            >
              <source src={getPreviewUrl()} type={file.mimeType} />
              Your browser does not support the video tag.
            </Box>
          )}
          
          {isAudio && (
            <Box
              component="audio"
              controls
              sx={{
                width: '100%',
              }}
              onLoadStart={() => setLoading(true)}
              onLoadedData={() => setLoading(false)}
              onError={() => setLoading(false)}
            >
              <source src={getPreviewUrl()} type={file.mimeType} />
              Your browser does not support the audio tag.
            </Box>
          )}
          
          {isPdf && (
            <Box
              component="iframe"
              src={getPreviewUrl()}
              sx={{
                width: '100%',
                height: '70vh',
                border: 'none',
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          )}
          
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}>
                {getFileIcon()}
              </Box>
              <Typography variant="body1" gutterBottom>
                {getFileName()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {file.mimeType}
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {file.url && (
            <Button
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
              variant="contained"
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttachmentPreview;

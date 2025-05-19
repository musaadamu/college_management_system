import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
} from '@mui/material';
import AttachmentPreview from './AttachmentPreview';
import { deleteAttachment } from '../../features/messages/messageSlice';

const AttachmentList = ({ 
  attachments, 
  onRemove, 
  isUploaded = false,
  maxItems = 5,
  showTitle = true,
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.messages);
  
  // Handle attachment removal
  const handleRemove = (file) => {
    if (onRemove) {
      onRemove(file);
    } else if (!isUploaded && file._id) {
      dispatch(deleteAttachment(file._id));
    }
  };
  
  // Filter out null or undefined attachments
  const validAttachments = attachments?.filter(Boolean) || [];
  
  // Limit the number of attachments shown
  const displayAttachments = validAttachments.slice(0, maxItems);
  
  // Check if there are more attachments than shown
  const hasMoreAttachments = validAttachments.length > maxItems;

  return (
    <Box sx={{ mt: 1 }}>
      {showTitle && validAttachments.length > 0 && (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Attachments ({validAttachments.length})
        </Typography>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : validAttachments.length > 0 ? (
        <Grid container spacing={1}>
          {displayAttachments.map((file, index) => (
            <Grid item key={file._id || index}>
              <AttachmentPreview
                file={file}
                onRemove={handleRemove}
                isUploaded={isUploaded}
              />
            </Grid>
          ))}
          
          {hasMoreAttachments && (
            <Grid item>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  border: '1px solid #eee',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  +{validAttachments.length - maxItems} more
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      ) : null}
    </Box>
  );
};

export default AttachmentList;

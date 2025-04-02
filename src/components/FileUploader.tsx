import axios from "axios";
import { ChangeEvent, useState, useRef, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePdf } from "../custom-context/PdfContext";
import { Box, Button, Paper, Typography, Tooltip, CircularProgress } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { FileText } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../constants";

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface FileUploaderProps {
  variant: 'button' | 'area';
}

export default function FileUploader({ variant = 'button' }: FileUploaderProps) {
  const navigate = useNavigate();
  const { pdfName, setPdfData } = usePdf();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    if(pdfName) {
      await axios.delete(`${API_BASE_URL}/pdf/${pdfName}`)
    }
    
    const uploadedFile = e.target.files[0];
    setFileName(uploadedFile.name);
    const fileUrl = URL.createObjectURL(uploadedFile);
    setPdfData(fileUrl, uploadedFile.name); // automatically handles cleanup of previous url
    
    // Start upload immediately
    await uploadFile(uploadedFile);
  }

  async function uploadFile(file: File) {
    // Set uploading state and reset progress
    setStatus('uploading');
    setUploadProgress(0);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    try {
      // When upload is 100% complete but before server responds, show processing state
      const onUploadComplete = () => {
        setStatus('processing');
      };
      
      // Post the file to the server
      await axios.post(`${API_BASE_URL}/pdf/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress(progressEvent) {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total) 
            : 0;
          setUploadProgress(progress);
          
          // When upload reaches 100%, switch to processing state
          if (progress === 100) {
            onUploadComplete();
          }
        },
      });
      
      // After receiving server response, set success and navigate
      setStatus('success');
      navigate('/workplace');
    } 
    catch {
      setStatus('error');
      setUploadProgress(0);
      setPdfData(null, null);
      setFileName(null);
      toast.error("Upload failed. Try again");
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check if the file is a PDF
      if (droppedFile.type === 'application/pdf') {
        setFileName(droppedFile.name);
        const fileUrl = URL.createObjectURL(droppedFile);
        setPdfData(fileUrl, droppedFile.name);
        uploadFile(droppedFile);
      } else {
        // Handle non-PDF file
        setStatus('error');
        toast.error('Please upload a PDF file only.');
      }
    }
  };

  // Hidden file input (shared between both variants)
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      onChange={handleFileChange}
      accept="application/pdf"
      style={{ display: 'none' }}
    />
  );

  // Button variant
  if (variant === 'button') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {fileInput}
        <Tooltip title="Upload a PDF document">
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={status !== 'uploading' && status !== 'processing' ? <FileUploadIcon /> : null}
            onClick={handleButtonClick}
            disabled={status === 'uploading' || status === 'processing'}
          >
            {status === 'uploading' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <Typography variant="caption">{`${uploadProgress}%`}</Typography>
              </Box>
            ) : status === 'processing' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <Typography variant="caption">Processing</Typography>
              </Box>
            ) : (
              'Upload new PDF'
            )}
          </Button>
        </Tooltip>
      </Box>
    );
  }

  // Area variant (drag & drop)
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex' }}>
      {fileInput}
      <Paper
        elevation={0}
        component="div"
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          backgroundColor: isDragging ? 'rgba(0, 139, 139, 0.05)' : 'background.paper',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.light',
          },
          position: 'relative',
          padding: 3,
          boxSizing: 'border-box',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <FileText 
          size={30} 
          color="#666666" 
          style={{ marginBottom: '16px' }} 
        />
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {fileName ? `Selected: ${fileName}` : 'Drop PDF file here or'}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          sx={{ 
            marginTop: '8px',
            textTransform: 'none',
            fontSize: '0.8rem',
            padding: '4px 12px'
          }}
        >
          Choose file
        </Button>

        {status === 'uploading' && (
          <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
            <CircularProgress
              variant="determinate"
              value={uploadProgress}
              size={60}
              thickness={4}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" component="div" color="textSecondary">
                {`${uploadProgress}%`}
              </Typography>
            </Box>
          </Box>
        )}

        {status === 'processing' && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={50} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Processing file...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            File uploaded successfully
          </Typography>
        )}

        {status === 'error' && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Upload failed. Try again
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
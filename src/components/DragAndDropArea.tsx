import axios from "axios";
import { ChangeEvent, useState, useRef, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePdf } from "../custom-context/PdfContext";
import { Box, Button, Paper, Typography } from "@mui/material";
import { FileText } from "lucide-react";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function DragAndDropArea() {
  const navigate = useNavigate();
  const { setPdfUrl } = usePdf();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const uploadedFile = e.target.files[0];
    setFileName(uploadedFile.name);
    const fileUrl = URL.createObjectURL(uploadedFile);
    setPdfUrl(fileUrl); // automatically handles cleanup of previous url
    
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
      await axios.post("http://127.0.0.1:8000/pdf", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress(progressEvent) {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total) 
            : 0;
          setUploadProgress(progress);
        },
      });

      setStatus('success');
      setUploadProgress(100);
      navigate('/process');
    } 
    catch {
      setStatus('error');
      setUploadProgress(0);
      setPdfUrl(null);
      setFileName(null);
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
        setPdfUrl(fileUrl);
        uploadFile(droppedFile);
      } else {
        // Handle non-PDF file
        setStatus('error');
        alert('Please upload a PDF file only.');
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
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
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          style={{ display: 'none' }}
        />
        
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
          <Box sx={{ width: '80%', mt: 2 }}>
            <div style={{ 
              height: '8px', 
              width: '100%', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${uploadProgress}%`,
                backgroundColor: '#1976d2',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
              {uploadProgress}% uploaded
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
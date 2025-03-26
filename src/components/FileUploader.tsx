import axios from "axios";
import { ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePdf } from "../custom-context/PdfContext";
import { Button, Tooltip, Box, Snackbar, Alert } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTableData } from "../custom-context/TableContext";
import { toast } from "react-toastify";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader() {
  const navigate = useNavigate();
  const { setPdfData } = usePdf();
  const tablesContext = useTableData();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const uploadedFile = e.target.files[0];
    setSelectedFileName(uploadedFile.name);
    const fileUrl = URL.createObjectURL(uploadedFile);
    setPdfData(fileUrl, uploadedFile.name); // automatically handles cleanup of previous url    
    // Start upload immediately
    await uploadFile(uploadedFile);
  }

  const handleButtonClick = () => {
    // Trigger the hidden file input when the button is clicked
    fileInputRef.current?.click();
  };

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
      setPdfData(null, null);
      toast.error("Upload failed. Try again");
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        onChange={handleFileChange}
        accept="application/pdf"
        style={{ display: 'none' }}
      />

      <Tooltip title="Upload a PDF document">
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<UploadFileIcon />}
          onClick={handleButtonClick}
        >
          Upload PDF
        </Button>
      </Tooltip>
    </Box>
  );
}
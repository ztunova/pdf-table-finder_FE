import axios from "axios";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePdf } from "../custom-context/PdfContext";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader() {
  const navigate = useNavigate();
  const { setPdfUrl } = usePdf();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const uploadedFile = e.target.files[0];
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
    }
  }

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        onChange={handleFileChange}
        accept="application/pdf"
      />

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div 
              className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" 
              style={{width: `${uploadProgress}%`}}
            >
            </div>
          </div>
          <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
        </div>
      )}

      {status === 'success' && (
        <p className="mt-2 text-sm text-green-600">
          File uploaded successfully
        </p>
      )}

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">
          Upload failed. Try again
        </p>
      )}
    </div>
  );
}
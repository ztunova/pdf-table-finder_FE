import axios from "axios";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";


// chceme mat 1 stav ktory bude reprezentovat vsetky mozne stavy
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function FileUploader() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    // e.target.files obsahuje vsetky subory ktore user vybral
    // budeme brat ale iba prvy 
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  // funkcia, ktora bude handlovat nahranie suboru
  // ak nie je nahrany subor, nechceme robit nic
  // async kvoli posielaniu dat na BE
  async function handleFileUpload() {
    if (!file) {
      return;
    };

    // zacneme uploadovanie
    // takisto treba resetovat progres
    setStatus('uploading');
    setUploadProgress(0);

    // posielame file na BE ako formData
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post("https://httpbin.org/post", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // axios dovoluje sledovat progres uploadovania
        // ziskame si % progresu podla toho, kolko treba celkovo loadovat (total) a toho, kolko uz je naloadovane (loaded)
        // % nastavime do uploadProgress
        onUploadProgress(progressEvent) {
          const progress = progressEvent.total ? Math.round(progressEvent.loaded * 100) / progressEvent.total : 0;
          setUploadProgress(progress)
        },
      });

      // niekedy sa nemusi dosiahnut celych 100% ale ked uz je status success tak chceme prave 100% => nastavime
      setStatus('success');
      setUploadProgress(100);
      navigate('/process')
    } 
    catch {
      // ak sa nieco stane tak sa uploadProgress nenastavi sam od seba na 0, treba manualne
      setStatus('error');
      setUploadProgress(0);
    };

  }

  return (
    <div className="space-y-4">
      <input type="file" onChange={handleFileChange}/>
      {file && (
        <div className="mb-4 text-sm">
          <p>File name: {file.name}</p>
          <p>File size: {file.size / 1024}</p>
          <p>File type: {file.type}</p>
        </div>
      )}

      { status === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" style={{width: `${uploadProgress}`}}>
            </div>
          </div>
          <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
        </div>
      )}


      {/* button, ktory nam uploaduje nahrany subor. Nechceme renderovat ten button pokial sa nieco prave uploaduje */}
      {file && status !== 'uploading' && <button onClick={handleFileUpload}>Upload</button>}

      { status === 'success' && (
        <p className="mt-2 text-sm text-green-600">
          File uploaded successfully
        </p>
      )}

      { status === 'error' && (
        <p className="mt-2 text-sm text-red-600">
          Upload failed. Try again
        </p>
      )}

    </div>
  );
}
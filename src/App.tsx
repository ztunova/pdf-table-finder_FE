import { useState } from 'react'
import './App.css'
import PdfViewer from './components/PdfViewer'
import FileUploader from './components/FileUploader'
import LandingPage from './pages/LandingPage'
import { createTheme, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'


const theme = createTheme({
  palette: {
    primary: {
      main: '#008b8b',
      light: '#33a1a1',
      dark: '#006161',
      contrastText: '#fff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FileUploader />} />
          <Route path="/process" element={<PdfViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App

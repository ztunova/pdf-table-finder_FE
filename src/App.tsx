import { useState } from 'react'
import './App.css'
import PdfViewer from './components/PdfViewer'
import FileUploader from './components/FileUploader'
import LandingPage from './pages/LandingPage'
import { createTheme, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PdfProvider } from './custom-context/PdfContext'
import MainPage from './pages/MainPage'


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
      <PdfProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FileUploader />} />
            <Route path="/process" element={<MainPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PdfProvider>
    </ThemeProvider>
  );
}

export default App

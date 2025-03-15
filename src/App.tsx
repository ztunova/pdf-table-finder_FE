import './App.css'
import FileUploader from './components/FileUploader'
import LandingPage from './pages/LandingPage'
import { createTheme, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PdfProvider } from './custom-context/PdfContext'
import MainPage from './pages/MainPage'
import {MainLayout} from './pages/MainLayout'
import { TableDataProvider } from './custom-context/TableContext'


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
        <TableDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<FileUploader />} />
              <Route path="/process" element={<MainPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TableDataProvider>
      </PdfProvider>
    </ThemeProvider>
  );
}

export default App

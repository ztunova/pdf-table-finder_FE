import './App.css'
import { createTheme, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PdfProvider } from './custom-context/PdfContext'
import MainPage from './pages/MainPage'
import { TableDataProvider } from './custom-context/TableContext'
import LandingPage from './pages/LandingPage'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
              <Route path="/" element={<LandingPage />} />
              <Route path="/process" element={<MainPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer 
            position="top-right"
            autoClose={4500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='colored'
          />
        </TableDataProvider>
      </PdfProvider>
    </ThemeProvider>
  );
}

export default App

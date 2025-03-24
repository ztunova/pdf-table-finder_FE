import Header from "../components/Header";
import PdfContent from "../components/PdfContent";
import { PdfToolbar } from "../components/PdfToolbar";
import TablesViewer from "../components/table-components/TablesViewer";
import { Box, Container } from '@mui/material';
import { DrawingProvider } from "../custom-context/DrawingContext";

const MainPage: React.FC = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '80vw', height: '100vh' }}>
        {/* Header */}
        <Header />
        
        {/* Content Section */}
        <Container maxWidth={false} disableGutters sx={{ 
          display: 'flex', 
          flexGrow: 1,
          height: 'calc(100vh - 64px)' // Subtract header height (assuming header is 64px)
        }}>
          {/* Left side - PDF Content and Toolbar */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden' // Changed from 'auto' to prevent scrolling
          }}>
            <DrawingProvider>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                height: '100%' 
              }}>
                <PdfToolbar />
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <PdfContent />
                </Box>
              </Box>
            </DrawingProvider>
          </Box>
    
          {/* Right side - Minimalistic Tabbed Panel */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TablesViewer />
          </Box>
        </Container>
      </Box>
    );
};

export default MainPage;
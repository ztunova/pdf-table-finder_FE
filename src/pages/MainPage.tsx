import Header from "../components/Header";
import PdfContent from "../components/PdfContent";
import { PdfToolbar } from "../components/PdfToolbar";
import TablesViewer from "../components/table-components/TablesViewer";
import FileUploader from "../components/FileUploader";
import { Box, Container } from '@mui/material';
import { DrawingProvider } from "../custom-context/DrawingContext";
import { TableToolbar } from "../components/table-components/TableToolbar";
import ExportButton from "../components/ExportButton";

const MainPage: React.FC = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '80vw', height: '100vh' }}>
        {/* Header */}
        <Header />
        
        {/* Content Section */}
        <Container maxWidth={false} disableGutters sx={{ 
          display: 'flex', 
          flexGrow: 1,
          height: 'calc(100vh - 64px)', // Subtract header height (assuming header is 64px)
          gap: 3 // Add gap between PDF and Tables sections
        }}>
          {/* Left side - PDF Content and Toolbar */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden', // Prevent scrolling
            position: 'relative', // Added for absolute positioning of button section
            mr: 1 // Add right margin
          }}>
            <DrawingProvider>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                height: '100%' 
              }}>
                <PdfToolbar />
                <Box sx={{ 
                  flexGrow: 1, 
                  overflow: 'hidden',
                  pb: 7 // Add padding at bottom to make room for the button section
                }}>
                  <PdfContent />
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderTop: '1px solid #e0e0e0',
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <FileUploader />
                </Box>
              </Box>
            </DrawingProvider>
          </Box>
    
          {/* Right side - Tables Viewer with contained scrolling */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden', // Prevent outer scrolling
            ml: 1, // Add left margin
            position: 'relative' // Added for absolute positioning of button section
          }}>
            {/* Add placeholder toolbar for tables section to align with PDF toolbar */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              height: '100%' 
            }}>
              <TableToolbar /> {/* Using PdfToolbar as placeholder */}
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'hidden',
                pb: 7 // Add padding at bottom to make room for the button section
              }}>
                <TablesViewer />
              </Box>
            </Box>
            
            {/* Add same footer with FileUploader to tables section */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: '1px solid #e0e0e0',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <ExportButton />
            </Box>
          </Box>
        </Container>
      </Box>
    );
};

export default MainPage;
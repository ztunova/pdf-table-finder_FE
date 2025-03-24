import Header from "../components/Header";
import PdfViewer from "../components/PdfViewer";
import TablesViewer from "../components/table-components/TablesViewer";
import { Box, Container } from '@mui/material';

const MainPage: React.FC = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '80vw', height: '100vh' }}>
        {/* Header */}
        <Header />
        
        {/* Content Section */}
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', flexGrow: 1 }}>
          {/* Left side - PDF Viewer */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <PdfViewer />
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
import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Header from '../components/Header';
import FileUploader from '../components/FileUploader';

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '80vw', height: '100vh' }}>
      <Header />
      
      {/* Main Content */}
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Extract Tables from Your PDF Documents
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Identify and extract tabular data from any PDF file.
          </Typography>
        </Box>
        
        {/* Drag & Drop Area */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: 'background.paper',
            height: '300px',
            display: 'flex',
            flexGrow: 0,
            boxSizing: 'border-box',
          }}
        >
          <FileUploader variant='area'/>
        </Paper>
        
        {/* Features */}
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <FeatureCard 
            title="Detection and Extraction directly from PDF file" 
            description="Uses PyMuPDF library to detect and extract table. Fast but detection and extraction results may not be accurate. Also can't handle tables inserted in PDF as images" 
          />
          <FeatureCard 
            title="Image Processing" 
            description="Uses image processing to detect tables and OCR to extract tabular data. Slower method but has better detection results and can handle also tables in a form of image" 
          />
          <FeatureCard 
            title="ChatGPT" 
            description="Send table to ChatGPT to extract tabular data. Slower paid feature but mostly reliable (in case other methods fail)" 
          />
        </Box>
      </Container>
    </Box>
  );
};

// Simple Feature Card Component
const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <Box sx={{ width: { xs: '100%', sm: '30%' }, mb: { xs: 3, sm: 0 } }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
};

export default LandingPage;
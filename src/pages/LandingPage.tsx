import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Header from '../components/Header';
import DragAndDropArea from '../components/DragAndDropArea';

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '90vw', height: '100vh',  bgcolor: 'primary.light' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Extract Tables from Your PDF Documents
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Quickly identify and extract tabular data from any PDF file with our intelligent table detection tool.
          </Typography>
        </Box>
        
        {/* Drag & Drop Area */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: 'background.paper',
            height: '300px'
          }}
        >
          <DragAndDropArea />
        </Paper>
        
        {/* Features */}
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <FeatureCard 
            title="Smart Detection" 
            description="Our algorithm automatically identifies tables in your PDF documents." 
          />
          <FeatureCard 
            title="Easy Export" 
            description="Extract data in CSV, Excel, or JSON formats with a single click." 
          />
          <FeatureCard 
            title="Fast Processing" 
            description="Get your results within seconds, even for complex documents." 
          />
        </Box>
      </Container>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: (theme) => theme.palette.grey[100]
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} PDF Table Detector | All rights reserved
          </Typography>
        </Container>
      </Box>
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
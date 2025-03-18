import { Box, Button, MenuItem, Paper, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useState } from "react";

enum TableExtractionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
    CHATGPT = 'chatgpt',
}

const RectangleMenu = ({ visible = true, left = 0, top = 0,}) => {

    const [extractionMethod, setExtractionMethod] = useState<TableExtractionMethods>(TableExtractionMethods.PYMU);

    const handleMethodChange = (event: SelectChangeEvent) => {
        setExtractionMethod(event.target.value as TableExtractionMethods);
    };

    const handleExtractClick = () => {
        console.log(`Extract button clicked with method: ${extractionMethod}`);
    };

    const handleDeleteClick = () => {
        console.log("DELETE")
    };
    
    // Extraction methods available to the user
    const extractionMethods = [
      { value: TableExtractionMethods.PYMU, label: 'pymu extr label' },
      { value: TableExtractionMethods.YOLO, label: 'yolo extr label' },
      { value: TableExtractionMethods.CHATGPT, label: 'gpt extr label' }
    ];
  
    // If not visible, don't render anything
    if (!visible) return null;
  
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          width: '180px',
          padding: 2,
          borderRadius: 1,
          zIndex: 1000
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Rectangle Options
        </Typography>
        
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          Extraction Method:
        </Typography>
        
        <Select
          fullWidth
          size="small"
          value={extractionMethod}
          sx={{ mb: 2 }}
          onChange={handleMethodChange}
        >
          {extractionMethods.map(method => (
            <MenuItem key={method.value} value={method.value}>
              {method.label}
            </MenuItem>
          ))}
        </Select>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            sx={{ width: '48%' }}
            onClick={handleExtractClick}
          >
            Extract
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ width: '48%' }}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
      </Paper>
    );
  };
  
  export default RectangleMenu;
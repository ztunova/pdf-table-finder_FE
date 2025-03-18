import { Box, Button, MenuItem, Paper, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTableData } from "../custom-context/TableContext";

enum TableExtractionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
    CHATGPT = 'chatgpt',
}

const RectangleMenu = () => {
    const tablesContext = useTableData();
    const [extractionMethod, setExtractionMethod] = useState<TableExtractionMethods>(TableExtractionMethods.PYMU);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

    // Update menu position when selected rectangle changes
    useEffect(() => {
        if (tablesContext.selectedRectangleId) {
            const rectangleData = tablesContext.getTableDataById(tablesContext.selectedRectangleId);
            console.log("rect data: ", rectangleData)
            if (rectangleData && rectangleData.coordinates) {
                const { lowerRightX, upperLeftY } = rectangleData.coordinates;
                
                // Position the menu at the top-right corner of the rectangle
                // Add a small offset (10px) for better visual separation
                setMenuPosition({
                    left: lowerRightX + 10,
                    top: upperLeftY
                });
            }
        }
    }, [tablesContext.selectedRectangleId, tablesContext.getTableDataById]);


    const handleMethodChange = (event: SelectChangeEvent) => {
        setExtractionMethod(event.target.value as TableExtractionMethods);
    };

    const handleExtractClick = () => {
        console.log(`Extract button clicked with method: ${extractionMethod}`);
    };

    const handleDeleteClick = () => {
        const selectedRectangleId = tablesContext.selectedRectangleId
        if (!selectedRectangleId) {
            return
        }

        console.log("DELETE", selectedRectangleId)
        tablesContext.deleteTableRecord(selectedRectangleId)
    };
    
    // Extraction methods available to the user
    const extractionMethods = [
      { value: TableExtractionMethods.PYMU, label: 'pymu extr label' },
      { value: TableExtractionMethods.YOLO, label: 'yolo extr label' },
      { value: TableExtractionMethods.CHATGPT, label: 'gpt extr label' }
    ];
  
    // If not visible, don't render anything
    if (!tablesContext.selectedRectangleId) return null;
  
    return (
      <Paper
        elevation={3}
        sx={{
            position: 'absolute',
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
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
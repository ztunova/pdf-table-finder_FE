import { Box, Button, CircularProgress, MenuItem, Paper, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTableData } from "../../custom-context/TableContext";
import axios from "axios";
import { percentageCoordsToAbsolute } from "../../shared-types";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../constants";
import { usePdf } from "../../custom-context/PdfContext";


interface RectangleMenuProps {
  canvasWidth: number;
  canvasHeight: number;
}

interface ExtractTableRequestParams {
    pdfPageNumber: number;
    upperLeftX: number;
    upperLeftY: number;
    lowerRightX: number;
    lowerRightY: number;
  }

enum TableExtractionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
    CHATGPT = 'chatgpt',
}

const RectangleMenu = ({ canvasWidth, canvasHeight }: RectangleMenuProps) => {
    const { pdfName } = usePdf();
    const tablesContext = useTableData();
    const [extractionMethod, setExtractionMethod] = useState<TableExtractionMethods>(TableExtractionMethods.PYMU);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
    const [loading, setLoading] = useState(false);

    // Update menu position when selected rectangle changes
    useEffect(() => {
        if (tablesContext.selectedRectangleId) {
            const rectangleData = tablesContext.getTableDataById(tablesContext.selectedRectangleId);
            if (rectangleData && rectangleData.coordinates) {
                const { lowerRightX, upperLeftY } = rectangleData.coordinates;
                const absLowerRightX = percentageCoordsToAbsolute(lowerRightX, canvasWidth)
                const absUpperLeftY = percentageCoordsToAbsolute(upperLeftY, canvasHeight)
                
                // Position the menu at the top-right corner of the rectangle
                // Add a small offset (10px) for better visual separation
                setMenuPosition({
                    left: absLowerRightX + 10,
                    top: absUpperLeftY
                });
            }
        }
    }, [tablesContext.selectedRectangleId, tablesContext.getTableDataById]);


    const handleMethodChange = (event: SelectChangeEvent) => {
        setExtractionMethod(event.target.value as TableExtractionMethods);
    };

    const handleExtractClick = async() => {
        const selectedRectangleId = tablesContext.selectedRectangleId
        if (!selectedRectangleId) {
            return
        }
        const selectedRectangle = tablesContext.getTableDataById(selectedRectangleId)
        if (!selectedRectangle) {
            throw new Error("Selected rectangle doesn't exist");
        }

        const rectData: ExtractTableRequestParams = {
            pdfPageNumber: selectedRectangle?.pdfPageNumber,
            upperLeftX: selectedRectangle.coordinates.upperLeftX,
            upperLeftY: selectedRectangle.coordinates.upperLeftY,
            lowerRightX: selectedRectangle.coordinates.lowerRightX,
            lowerRightY: selectedRectangle.coordinates.lowerRightY,
        }

        try {
            setLoading(true)
            const response = await axios.get(`${API_BASE_URL}/pdf/${pdfName}/table/${extractionMethod}`, {
                params: rectData
              });

            if (response.status === 200) {
                tablesContext.updateExtractedData(selectedRectangleId, response.data.tableData)
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 404) {
                        toast.error("No table found within given coordinates")
                    } 
                    else if (error.response.status === 500) {
                        toast.error('Server error');
                    }
                } 
                else {
                    toast.error('No response received');
                }
            } 
            else {
                toast.error('Error sending coordinates');
            }
        }
        finally {
          setLoading(false)
        }
    };

    const handleDeleteClick = () => {
        const selectedRectangleId = tablesContext.selectedRectangleId
        if (!selectedRectangleId) {
            return
        }
        tablesContext.deleteTableRecord(selectedRectangleId)
    };
    
    const extractionMethods = [
      { value: TableExtractionMethods.PYMU, label: 'Extract from PDF text' },
      { value: TableExtractionMethods.YOLO, label: 'Image processing' },
      { value: TableExtractionMethods.CHATGPT, label: 'ChatGPT' }
    ];
  
    // If not visible, don't render anything
    if (!tablesContext.selectedRectangleId) {
       return null 
    };
    const rectangleName = tablesContext.getTableDataById(tablesContext.selectedRectangleId)?.title;
  
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
          {rectangleName}
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
            disabled={loading}
            onClick={handleExtractClick}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Extract"}
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
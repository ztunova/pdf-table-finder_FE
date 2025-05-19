import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
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
    customPrompt?: string;
  }

enum TableExtractionMethods {
    PYMU = 'pymu',
    YOLO = 'yolo',
    CHATGPT = 'chatgpt',
}

const RectangleMenu = ({ canvasWidth, canvasHeight }: RectangleMenuProps) => {
    const { getPdfNameWithId } = usePdf();
    const tablesContext = useTableData();
    const [extractionMethod, setExtractionMethod] = useState<TableExtractionMethods>(TableExtractionMethods.PYMU);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
    const [loading, setLoading] = useState(false);
    const [promptDialogOpen, setPromptDialogOpen] = useState(false);
    const [customPrompt, setCustomPrompt] = useState("");

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

    const handleOpenPromptDialog = () => {
      if (tablesContext.selectedRectangleId) {
        const rectangleData = tablesContext.getTableDataById(tablesContext.selectedRectangleId);
        // Set initial prompt value based on saved prompt or empty string
        setCustomPrompt(rectangleData?.chatgptPrompt || "");
      }
      setPromptDialogOpen(true);
    };

    const handleClosePromptDialog = () => {
        setPromptDialogOpen(false);
    };

    const handleSavePrompt = () => {
      if (tablesContext.selectedRectangleId) {
        // If prompt is empty, set it to null
        const promptToSave = customPrompt.trim() === "" ? null : customPrompt;
        tablesContext.setChatGptPrompt(tablesContext.selectedRectangleId, promptToSave);
      }
      setPromptDialogOpen(false);
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

        const pdfNameWithId = getPdfNameWithId();
        const rectData: ExtractTableRequestParams = {
            pdfPageNumber: selectedRectangle?.pdfPageNumber,
            upperLeftX: selectedRectangle.coordinates.upperLeftX,
            upperLeftY: selectedRectangle.coordinates.upperLeftY,
            lowerRightX: selectedRectangle.coordinates.lowerRightX,
            lowerRightY: selectedRectangle.coordinates.lowerRightY,
        }

        if (extractionMethod === TableExtractionMethods.CHATGPT && 
          useCustomPrompt && 
          selectedRectangle.chatgptPrompt) {
          rectData['customPrompt'] = selectedRectangle.chatgptPrompt;
        }

        try {
            setLoading(true)
            const response = await axios.get(`${API_BASE_URL}/pdf/${pdfNameWithId}/table/${extractionMethod}`, {
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

    const rectangleData = tablesContext.getTableDataById(tablesContext.selectedRectangleId);
    const rectangleName = rectangleData?.title;
    const hasCustomPrompt = rectangleData?.chatgptPrompt !== null && rectangleData?.chatgptPrompt !== undefined;
    const useCustomPrompt = rectangleData?.useCustomPrompt || false;
    return (
      <>
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

          {extractionMethod === TableExtractionMethods.CHATGPT && (
            <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Checkbox
                    checked={useCustomPrompt && hasCustomPrompt}
                    onChange={(e) => {
                      if (e.target.checked && !hasCustomPrompt) {
                        toast.info("No custom prompt defined. Click 'Customize Prompt' to create one.");
                      }
                      tablesContext.setUseCustomPrompt(tablesContext.selectedRectangleId || "", e.target.checked);
                    }}
                    // disabled={!hasCustomPrompt}
                    size="small"
                  />
                  <Typography variant="caption">
                    Use custom prompt
                  </Typography>
                </Box>
              <Button 
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                onClick={handleOpenPromptDialog}
              >
                Customize Prompt
              </Button>
            </>
          )}
          
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

        <Dialog 
          open={promptDialogOpen}
          onClose={handleClosePromptDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Custom Extraction Prompt</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              multiline
              rows={10}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              // inputProps={{ maxLength: 500 }}
              helperText={`Default Prompt: Format as excel table, data are as numbers.`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePromptDialog}>Cancel</Button>
            <Button onClick={handleSavePrompt} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        
      </>
    );
  };
  
  export default RectangleMenu;
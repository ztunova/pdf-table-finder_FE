import { Box, Button } from "@mui/material";
import { useDrawing } from "../custom-context/DrawingContext";

export const PdfToolbar: React.FC = () => {
    const {isDrawingEnabled, setIsDrawingEnabled} = useDrawing();

    return (
        <Box 
          sx={{ 
            display: 'flex',
            gap: 2,
            p: 2,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
            <Button 
            onClick={() => setIsDrawingEnabled(prev => !prev)}
            variant="outlined"
            sx={{
                bgcolor: isDrawingEnabled ? '#007FFF' : '#fff',
                color: isDrawingEnabled ? '#fff' : '#000',
                border: '1px solid #007FFF',
                '&:hover': {
                bgcolor: isDrawingEnabled ? '#0059B2' : '#F5F5F5',
                border: '1px solid #007FFF',
                }
            }}
            >
                {isDrawingEnabled ? 'Disable Drawing' : 'Enable Drawing'}
            </Button>
        </Box>
    );
}

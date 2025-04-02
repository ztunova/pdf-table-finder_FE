import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import axios from "axios";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../constants";
import { usePdf } from "../custom-context/PdfContext";

  
const Header: React.FC = () => {
    const { pdfName } = usePdf();
    const navigate = useNavigate();

    const onLogoClick = async () => {
        if(pdfName) {
            await axios.delete(`${API_BASE_URL}/pdf/${pdfName}`)
        }
        navigate('/');
    }

    return (
        <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
            <Box 
                display="flex" 
                alignItems="center" 
                flexGrow={1}
                onClick={onLogoClick}
                sx={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    '&:hover': {
                        cursor: 'pointer'
                    }
                }}
            >
                <FileText className="h-8 w-8 text-white" />
                <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                    PDF Table Detector
                </Typography>
            </Box>
        </Toolbar>
        </AppBar>
    );
};

export default Header;
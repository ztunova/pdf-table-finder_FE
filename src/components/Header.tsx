import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
  
const Header: React.FC = () => {
    const navigate = useNavigate();

    const onLogoClick = async () => {
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
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { FileText } from "lucide-react";

  
const Header: React.FC = () => {
    const onAboutClick = () => {
        console.log("about clicked")
    }

    return (
        <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
            <Box display="flex" alignItems="center" flexGrow={1}>
            <FileText className="h-8 w-8 text-white" />
            <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                PDF Table Detector
            </Typography>
            </Box>
            <Button color="inherit" onClick={onAboutClick}>
            About
            </Button>
        </Toolbar>
        </AppBar>
    );
};

export default Header;
import { Box } from "@mui/material";


export const TableToolbar: React.FC = () => {

    const toolbarHeight = "50px";

    return (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            minHeight: toolbarHeight,
            height: toolbarHeight
          }}
        >
            {/* Left side - empty div with minimum dimensions to prevent collapse */}
            <div style={{ minWidth: '1px', minHeight: '1px' }}></div>
            
            {/* Right side - empty div with minimum dimensions to prevent collapse */}
            <div style={{ minWidth: '1px', minHeight: '1px' }}></div>
        </Box>
    );
}
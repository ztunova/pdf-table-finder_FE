// TableTabs.tsx
import React from 'react';
import { useTableData } from '../../custom-context/TableContext';
import { Box } from '@mui/material';

interface TableTabsProps {
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
}

const TableTabs: React.FC<TableTabsProps> = ({ activeTabId, onTabClick }) => {
  const tablesContext = useTableData();

  // Generate tab title from table data
  const getTabTitle = (tableId: string) => {
    const tableData = tablesContext.getTableDataById(tableId);
    if (!tableData) return "Unknown Table";
    
    return tableData.title || `Table ${tableId.substring(0, 6)}...`;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      borderBottom: '1px solid #ddd',
      overflowX: 'auto',
      backgroundColor: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 1,
      height: '42px' // Set a fixed height to match PdfContent top spacing
    }}>
      {/* Dynamic tabs for extracted tables */}
      {tablesContext.extractedTables.map(tableId => (
        <Box
          key={tableId}
          onClick={() => onTabClick(tableId)}
          sx={{
            padding: '10px 15px',
            cursor: 'pointer',
            backgroundColor: activeTabId === tableId ? '#f5f5f5' : 'transparent',
            borderBottom: activeTabId === tableId ? '2px solid #1976d2' : 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {getTabTitle(tableId)}
        </Box>
      ))}
    </Box>
  );
};

export default TableTabs;
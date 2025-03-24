// TableTabs.tsx
import React from 'react';
import { useTableData } from '../../custom-context/TableContext';

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
    <div style={{ 
      display: 'flex', 
      borderBottom: '1px solid #ddd',
      overflowX: 'auto',
      backgroundColor: '#fff', // Ensure background is solid to cover scrolled content
      position: 'sticky',      // Make the tabs stick to the top
      top: 0,                  // Stick to the top of the container
      zIndex: 1                // Ensure tabs stay above the table content
    }}>
      {/* Dynamic tabs for extracted tables */}
      {tablesContext.extractedTables.map(tableId => (
        <div
          key={tableId}
          onClick={() => onTabClick(tableId)}
          style={{
            padding: '10px 15px',
            cursor: 'pointer',
            backgroundColor: activeTabId === tableId ? '#f5f5f5' : 'transparent',
            borderBottom: activeTabId === tableId ? '2px solid #1976d2' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {getTabTitle(tableId)}
        </div>
      ))}
    </div>
  );
};

export default TableTabs;
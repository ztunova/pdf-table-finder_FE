// TablesViewer.tsx
import React, { useState, useEffect } from 'react';
import SingleTable from "./SingleTable";
import { useTableData } from '../../custom-context/TableContext';

const TablesViewer: React.FC = () => {
  const { extractedTables, getTableDataById } = useTableData();
  
  // Active tab state
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  // Set active tab when tables change
  useEffect(() => {
    // If no active tab or active tab doesn't exist in extractedTables
    if (!activeTabId || !extractedTables.includes(activeTabId)) {
      // Set to first available table or null if empty
      setActiveTabId(extractedTables.length > 0 ? extractedTables[0] : null);
    }
    console.log("extracted tables",extractedTables)
  }, [extractedTables, activeTabId]);

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // Generate tab title from table data
  const getTabTitle = (tableId: string) => {
    const tableData = getTableDataById(tableId);
    if (!tableData) return "Unknown Table";
    
    return tableData.title || `Table ${tableId.substring(0, 6)}...`;
  };

  // Handle empty state
  if (extractedTables.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666'
      }}>
        <p>No tables with extracted data available.</p>
        <p>Draw rectangles over tables and extract data to view them here.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      {/* Tab headers */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #ddd',
        overflowX: 'auto',
      }}>
        {/* Dynamic tabs for extracted tables */}
        {extractedTables.map(tableId => (
          <div
            key={tableId}
            onClick={() => handleTabClick(tableId)}
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
      
      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Only render the SingleTable component for the active tab */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Only render the SingleTable component for the active tab */}
          {activeTabId && (
            <SingleTable 
              id={activeTabId}
              isActive={true}
              rectangleId={activeTabId}
            />
          )}
        </div>
      </div>
    </div>
  );

};

export default TablesViewer;
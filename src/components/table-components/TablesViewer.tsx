// TablesViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import SingleTable from "./SingleTable";
import { useRectangleMapping } from "../../custom-context/RectangleTableMappingContext";

// Tab data interface
export interface TabData {
  id: string;
  label: string;
  content: React.ReactNode;
  rectangleId?: string;
  apiResponse?: any;
}

const TablesViewer: React.FC = () => {
  // Initial tabs state
  const [tabs, setTabs] = useState<TabData[]>([
    {
      id: 'instructions',
      label: 'Instructions',
      content: (
        <div>
          <h3>Drawing Instructions</h3>
          <ol>
            <li>Enable drawing mode using the toolbar button</li>
            <li>Draw rectangles over tables or areas of interest in the PDF</li>
            <li>Click the send icon on a rectangle to fetch data from the API</li>
            <li>View the API response in the corresponding tab</li>
          </ol>
          <p><strong>Note:</strong> Each rectangle will create a new tab when you click the send icon.</p>
        </div>
      )
    }
  ]);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  
  // Create a local ref object with tab management methods
  const tabsRef = useRef({
    addTab: (tabData: TabData) => {
      const existingTabIndex = tabs.findIndex(tab => tab.id === tabData.id);
      
      if (existingTabIndex >= 0) {
        // Update existing tab
        setTabs(prevTabs => prevTabs.map(tab => 
          tab.id === tabData.id ? tabData : tab
        ));
      } else {
        // Add new tab
        setTabs(prevTabs => [...prevTabs, tabData]);
      }
      
      // Activate the tab
      setActiveTab(tabData.id);
    },
    
    updateTabContent: (tabId: string, content: React.ReactNode, apiResponse?: any) => {
      setTabs(prevTabs => prevTabs.map(tab => {
        if (tab.id === tabId) {
          return { ...tab, content, apiResponse };
        }
        return tab;
      }));
    },
    
    findTabByRectangleId: (rectangleId: string) => {
      return tabs.find(tab => tab.rectangleId === rectangleId);
    },
    
    removeTab: (tabId: string) => {
      setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
      
      // If active tab is removed, select another one
      if (activeTab === tabId && tabs.length > 1) {
        const remainingTabs = tabs.filter(tab => tab.id !== tabId);
        setActiveTab(remainingTabs[0].id);
      }
    }
  });
  
  // Get access to the context
  const rectangleMapping = useRectangleMapping();
  
  // When the component mounts, set the tabsRef in the context
  useEffect(() => {
    if (rectangleMapping.tabsRef) {
      (rectangleMapping.tabsRef as any).current = tabsRef.current;
    }
  }, [rectangleMapping]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div style={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      {/* Tab headers */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #ddd',
        overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? '#f5f5f5' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #1976d2' : 'none',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span>{tab.label}</span>
            {tab.id !== 'instructions' && (
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  tabsRef.current.removeTab(tab.id);
                }}
                style={{
                  marginLeft: '8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ×
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tabs.map(tab => (
          <SingleTable 
            key={tab.id} 
            id={tab.id}
            isActive={activeTab === tab.id}
          >
            <div style={{ 
              border: '1px solid #eee', 
              borderRadius: '4px', 
              padding: '20px', 
              minHeight: '200px' 
            }}>
              {tab.content}
              
              {tab.apiResponse && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '10px', 
                  background: '#f9f9f9', 
                  borderRadius: '4px' 
                }}>
                  <h4>API Response:</h4>
                  <pre style={{ overflow: 'auto' }}>
                    {JSON.stringify(tab.apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </SingleTable>
        ))}
      </div>
    </div>
  );
};

export default TablesViewer;
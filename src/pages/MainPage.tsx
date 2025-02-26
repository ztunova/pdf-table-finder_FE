import PdfViewer from "../components/PdfViewer";
import TablesViewer from "../components/table-components/TablesViewer";
import { RectangleTableMappingProvider } from "../custom-context/RectangleTableMappingContext";

const MainPage: React.FC = () => {
    return (
      <RectangleTableMappingProvider>
        <div style={{ 
          display: 'flex', 
          height: '100vh', 
          width: '100%' 
        }}>
          {/* Left side - PDF Viewer */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <PdfViewer />
          </div>
    
          {/* Right side - Minimalistic Tabbed Panel */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <TablesViewer />
          </div>
        </div>
      </RectangleTableMappingProvider>
    );
};

export default MainPage;
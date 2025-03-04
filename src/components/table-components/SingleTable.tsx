import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

// register Handsontable's modules
registerAllModules();


interface SingleTableProps {
    id: string;
    isActive: boolean;
    children: React.ReactNode;
}

const SingleTable: React.FC<SingleTableProps> = ({ id, isActive, children }) => {
    if (!isActive) return null;
  
    return (
      <div className="ht-theme-main-dark-auto">
        <HotTable
          id={id}
          data={[
            ['', 'Tesla', 'Volvo', 'Toyota', 'Ford'],
            ['2019', 10, 11, 12, 13],
            ['2020', 20, 11, 14, 13],
            ['2021', 30, 15, 12, 13]
          ]}
          rowHeaders={true}
          colHeaders={true}
          height="auto"
          minCols={10}
          minRows={10}
          autoWrapRow={true}
          autoWrapCol={true}
          contextMenu={true}
          mergeCells={true}
          manualRowMove={true}
          manualColumnMove={true}
          manualColumnResize={true}
          manualRowResize={true}

          licenseKey="non-commercial-and-evaluation" // for non-commercial use only
        />
      </div>
    );
}

export default SingleTable;
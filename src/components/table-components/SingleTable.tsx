import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { useTableData } from '../../custom-context/TableContext';

// register Handsontable's modules
registerAllModules();


interface SingleTableProps {
    id: string;
    isActive: boolean;
    rectangleId: string;
}

const SingleTable: React.FC<SingleTableProps> = ({ id, isActive, rectangleId }) => {
  const { getTableDataById } = useTableData();
  const tableData = getTableDataById(rectangleId);

    if (!isActive) return null;

    const defaultData = [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ];
  
    // Use extracted data if available, otherwise use default
    const displayData = tableData?.extractedData || defaultData;
  
    return (
      <div className="ht-theme-main-dark-auto">
        <HotTable
          id={id}
          data={displayData}
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
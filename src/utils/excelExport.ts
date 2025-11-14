import * as XLSX from 'xlsx';
import type { Column } from '../components/DataTable/DataTable';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
}

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param columns Column definitions with title and dataIndex
 * @param options Export options
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: Column<T>[],
  options: ExcelExportOptions = {}
) => {
  const { filename = 'export', sheetName = 'Sheet1' } = options;

  // Prepare data for export
  const exportData = data.map((record, index) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const key = col.key || String(col.dataIndex || '');
      let value: any;
      
      if (col.render) {
        // For rendered columns, try to extract text value
        const rendered = col.render(
          col.dataIndex ? record[col.dataIndex] : undefined,
          record,
          index
        );
        // If it's a React element or object, try to get text content
        if (typeof rendered === 'string' || typeof rendered === 'number') {
          value = rendered;
        } else if (rendered && typeof rendered === 'object') {
          // Try to extract text from React elements
          value = String(rendered);
        } else {
          value = rendered || '';
        }
      } else {
        value = col.dataIndex ? record[col.dataIndex] : '';
      }
      
      row[col.title] = value ?? '';
    });
    return row;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


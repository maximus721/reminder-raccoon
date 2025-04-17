
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { isValid, parse, format } from 'date-fns';

const REQUIRED_COLUMNS = ['name', 'amount', 'dueDate', 'recurring', 'category'];

export const useExcelImport = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const parseDateValue = (value: any): string | null => {
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }

    if (typeof value === 'string') {
      const formats = [
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'MM-dd-yyyy',
        'dd-MM-yyyy',
        'yyyyMMdd'
      ];

      for (const dateFormat of formats) {
        const parsedDate = parse(value, dateFormat, new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, 'yyyy-MM-dd');
        }
      }

      const cleanedValue = value.replace(/[^\d-]/g, '');
      if (cleanedValue.length === 8 || cleanedValue.length === 10) {
        const year = cleanedValue.slice(0, 4);
        const month = cleanedValue.slice(4, 6);
        const day = cleanedValue.slice(6, 8);
        const testDate = new Date(`${year}-${month}-${day}`);
        if (isValid(testDate)) {
          return format(testDate, 'yyyy-MM-dd');
        }
      }
    }

    return null;
  };

  const readExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const validateBillData = (row: any) => {
    for (const field of REQUIRED_COLUMNS) {
      if (!row[field] && field !== 'interest') {
        return false;
      }
    }

    if (isNaN(Number(row.amount))) {
      return false;
    }

    const parsedDate = parseDateValue(row.dueDate);
    if (!parsedDate) {
      return false;
    }

    const validRecurring = ['once', 'daily', 'weekly', 'monthly', 'yearly'];
    if (!validRecurring.includes(row.recurring)) {
      return false;
    }

    return true;
  };

  const downloadSampleTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        name: 'Rent',
        amount: 1000,
        dueDate: '2025-04-15',
        recurring: 'monthly',
        category: 'Housing',
        notes: 'Apartment rent',
        paid: false,
        interest: 0
      },
      {
        name: 'Credit Card',
        amount: 2500,
        dueDate: '2025-04-20',
        recurring: 'monthly',
        category: 'Debt',
        notes: 'VISA payment',
        paid: false,
        interest: 16.99
      }
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');
    XLSX.writeFile(workbook, 'bills_import_template.xlsx');
  };

  return {
    file,
    uploading,
    previewData,
    setFile,
    setUploading,
    setPreviewData,
    readExcelFile,
    validateBillData,
    parseDateValue,
    downloadSampleTemplate
  };
};

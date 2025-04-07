
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, HelpCircle } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportBillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REQUIRED_COLUMNS = ['name', 'amount', 'dueDate', 'recurring', 'category'];
const OPTIONAL_COLUMNS = ['notes', 'paid', 'interest'];

const ImportBillsModal: React.FC<ImportBillsModalProps> = ({ open, onOpenChange }) => {
  const { addBill } = useFinance();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const validateBillData = (row: any) => {
    // Check required fields
    for (const field of REQUIRED_COLUMNS) {
      if (!row[field] && field !== 'interest') {
        return false;
      }
    }

    // Validate amount is a number
    if (isNaN(Number(row.amount))) {
      return false;
    }

    // Validate dueDate is a valid date
    try {
      new Date(row.dueDate);
    } catch (e) {
      return false;
    }

    // Validate recurring is valid
    const validRecurring = ['once', 'daily', 'weekly', 'monthly', 'yearly'];
    if (!validRecurring.includes(row.recurring)) {
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      const data = await readExcelFile(selectedFile);
      setPreviewData(data.slice(0, 5)); // Preview first 5 rows
    } catch (error) {
      toast.error('Error reading file: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
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

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const bills = await readExcelFile(file);
      
      let successCount = 0;
      let errorCount = 0;

      for (const bill of bills) {
        if (validateBillData(bill)) {
          await addBill({
            name: bill.name,
            amount: Number(bill.amount),
            dueDate: bill.dueDate,
            recurring: bill.recurring,
            category: bill.category,
            notes: bill.notes || '',
            paid: bill.paid === true || bill.paid === 'true',
            interest: bill.interest ? Number(bill.interest) : undefined
          });
          successCount++;
        } else {
          errorCount++;
        }
      }

      toast.success(`Imported ${successCount} bills successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Error importing bills: ' + (error as Error).message);
    } finally {
      setUploading(false);
      setFile(null);
      setPreviewData([]);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Bills from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file with your bills data to import them in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <HelpCircle className="h-4 w-4 mr-2" />
            <AlertTitle>File Format Instructions</AlertTitle>
            <AlertDescription>
              Your Excel file should have the following columns:
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="file-format">
                  <AccordionTrigger>View Required Format</AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>name</TableCell>
                          <TableCell>Yes</TableCell>
                          <TableCell>Bill name/description</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>amount</TableCell>
                          <TableCell>Yes</TableCell>
                          <TableCell>Numeric amount</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>dueDate</TableCell>
                          <TableCell>Yes</TableCell>
                          <TableCell>Due date (YYYY-MM-DD)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>recurring</TableCell>
                          <TableCell>Yes</TableCell>
                          <TableCell>once, daily, weekly, monthly, yearly</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>category</TableCell>
                          <TableCell>Yes</TableCell>
                          <TableCell>Bill category</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>notes</TableCell>
                          <TableCell>No</TableCell>
                          <TableCell>Additional notes</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>paid</TableCell>
                          <TableCell>No</TableCell>
                          <TableCell>true/false</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>interest</TableCell>
                          <TableCell>No</TableCell>
                          <TableCell>Interest rate (for debt)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full"
                      onClick={downloadSampleTemplate}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Download Sample Template
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm font-medium mb-1">
                {file ? file.name : 'Click to upload Excel file'}
              </span>
              <span className="text-xs text-muted-foreground">
                Support for .xlsx, .xls files
              </span>
            </label>
          </div>

          {previewData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Data Preview (first 5 rows):</h3>
              <div className="max-h-[200px] overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <TableCell key={i}>
                            {typeof value === 'object' ? JSON.stringify(value) : value?.toString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || uploading}
          >
            {uploading ? 'Importing...' : 'Import Bills'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportBillsModal;

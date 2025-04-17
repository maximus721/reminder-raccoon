
import React from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUpload } from './import/FileUpload';
import { ImportInstructions } from './import/ImportInstructions';
import { DataPreview } from './import/DataPreview';
import { useExcelImport } from './import/useExcelImport';

interface ImportBillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportBillsModal: React.FC<ImportBillsModalProps> = ({ open, onOpenChange }) => {
  const { addBill } = useFinance();
  const {
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
  } = useExcelImport();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      const data = await readExcelFile(selectedFile);
      setPreviewData(data.slice(0, 5));
    } catch (error) {
      toast.error('Error reading file: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
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
          try {
            const parsedDate = parseDateValue(bill.dueDate);
            if (!parsedDate) {
              throw new Error('Invalid date format');
            }

            await addBill({
              name: bill.name,
              amount: Number(bill.amount),
              dueDate: parsedDate,
              recurring: bill.recurring,
              category: bill.category,
              notes: bill.notes || '',
              paid: bill.paid === true || bill.paid === 'true',
              interest: bill.interest ? Number(bill.interest) : null,
              snoozedUntil: null,
              originalDueDate: null,
              pastDueDays: 0
            });
            successCount++;
          } catch (error) {
            console.error('Error adding bill:', error);
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Imported ${successCount} bills successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        onOpenChange(false);
      } else {
        toast.error(`Failed to import any bills. Please check your file format.`);
      }
    } catch (error) {
      console.error('Error importing bills:', error);
      toast.error('Error importing bills: ' + (error as Error).message);
    } finally {
      setUploading(false);
      setFile(null);
      setPreviewData([]);
    }
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
          <ImportInstructions onDownloadTemplate={downloadSampleTemplate} />
          <FileUpload file={file} onFileChange={handleFileChange} />
          {previewData.length > 0 && <DataPreview data={previewData} />}
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

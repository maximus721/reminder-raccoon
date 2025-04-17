
import React from 'react';
import { HelpCircle, FileSpreadsheet } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';

interface ImportInstructionsProps {
  onDownloadTemplate: () => void;
}

export const ImportInstructions: React.FC<ImportInstructionsProps> = ({ onDownloadTemplate }) => {
  return (
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
                onClick={onDownloadTemplate}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Sample Template
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AlertDescription>
    </Alert>
  );
};

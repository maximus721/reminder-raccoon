
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface DataPreviewProps {
  data: Record<string, any>[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Data Preview (first 5 rows):</h3>
      <div className="max-h-[200px] overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(data[0]).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
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
  );
};

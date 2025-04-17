
import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
      <input
        type="file"
        id="file-upload"
        onChange={onFileChange}
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
  );
};

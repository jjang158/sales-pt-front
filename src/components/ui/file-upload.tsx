import React, { useCallback, useState } from 'react';
import { Upload, File, X, Paperclip } from 'lucide-react';
import { useIsMobile } from './use-mobile';
import { Button } from './button';
import { Card, CardContent } from './card';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf,.doc,.docx,.txt",
  multiple = true,
  maxSize = 10,
  className = ""
}: FileUploadProps) {
  const isMobile = useIsMobile();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        alert(`파일 크기가 ${maxSize}MB를 초과합니다: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));

      setUploadedFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
      onFileSelect(validFiles);
    }
  }, [maxSize, multiple, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFileSelect(updated.map(f => f.file));
      return updated;
    });
  }, [onFileSelect]);

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        <input
          id="mobile-file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* 드래그 중일 때만 드롭 존 표시 */}
        {dragActive && (
          <div
            className="border-2 border-dashed border-primary bg-primary/5 rounded-lg p-6 text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">파일을 여기에 드롭하세요</p>
          </div>
        )}

        {/* 기본 파일 선택 버튼 */}
        {!dragActive && (
          <Button
            variant="outline"
            className="w-full h-12 flex items-center gap-2"
            onClick={() => document.getElementById('mobile-file-input')?.click()}
          >
            <Paperclip className="w-5 h-5" />
            파일 선택
          </Button>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{uploadedFile.file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 h-6 w-6 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="desktop-file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

        <div className="space-y-2">
          <p className="text-lg font-medium">
            파일을 드래그하여 업로드하거나
          </p>
          <Button
            variant="outline"
            onClick={() => document.getElementById('desktop-file-input')?.click()}
          >
            파일 선택
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          지원 형식: PDF, DOC, DOCX, TXT (최대 {maxSize}MB)
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-6 h-6 flex-shrink-0 text-blue-500" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-2 h-8 w-8 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
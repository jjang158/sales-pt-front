import React, { useState, useCallback } from 'react';
import { X, Download, Eye, FileText, File } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Badge } from './badge';
import { useIsMobile } from './use-mobile';

interface PDFViewerProps {
  file: File;
  onRemove: () => void;
}

interface FileManagerProps {
  files: File[];
  onRemove: (index: number) => void;
  onPreview: (file: File) => void;
}

export function PDFViewer({ file, onRemove }: PDFViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const isMobile = useIsMobile();

  const generatePreview = useCallback(() => {
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const downloadFile = useCallback(() => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate flex-1">
            {file.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 ml-2 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {file.type.includes('pdf') ? 'PDF' : file.type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-2">
          {file.type === 'application/pdf' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePreview}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  미리보기
                </Button>
              </DialogTrigger>
              <DialogContent className={`${isMobile ? 'w-[95vw] h-[90vh]' : 'max-w-4xl w-[90vw] h-[80vh]'}`}>
                <DialogHeader>
                  <DialogTitle className="truncate">{file.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                  {previewUrl && (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border rounded-lg"
                      title={`PDF 미리보기: ${file.name}`}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={downloadFile}
            className={file.type === 'application/pdf' ? 'flex-1' : 'w-full'}
          >
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
        </div>

        {file.type.startsWith('image/') && (
          <div className="mt-3">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-32 object-cover rounded-lg border"
              onLoad={(e) => {
                // 이미지 로드 후 URL 정리
                setTimeout(() => {
                  URL.revokeObjectURL((e.target as HTMLImageElement).src);
                }, 1000);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FileManager({ files, onRemove, onPreview }: FileManagerProps) {
  const isMobile = useIsMobile();

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>업로드된 파일이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="relative">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onPreview(file)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-8 h-8 text-red-500" />
                  ) : file.type.startsWith('image/') ? (
                    <div className="w-8 h-8 rounded border overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onLoad={(e) => {
                          setTimeout(() => {
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }, 1000);
                        }}
                      />
                    </div>
                  ) : (
                    <File className="w-8 h-8 text-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
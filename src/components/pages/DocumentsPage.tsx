import React, { useState, useCallback } from 'react';
import { Plus, Search, Filter, FileText, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileUpload } from '../ui/file-upload';
import { PDFViewer, FileManager } from '../ui/pdf-viewer';
import { useIsMobile } from '../ui/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface Document {
  id: string;
  name: string;
  type: 'insurance' | 'contract' | 'manual' | 'other';
  file: File;
  uploadDate: string;
  tags: string[];
}

export function DocumentsPage() {
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleFileUpload = useCallback((files: File[]) => {
    const newDocuments: Document[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.toLowerCase().includes('보험') ? 'insurance' :
            file.name.toLowerCase().includes('계약') ? 'contract' : 'other',
      file,
      uploadDate: new Date().toLocaleDateString('ko-KR'),
      tags: []
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    setShowUpload(false);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'insurance': return '보험약관';
      case 'contract': return '계약서';
      case 'manual': return '매뉴얼';
      default: return '기타';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insurance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contract': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'manual': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* 헤더 */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              문서 관리
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              보험약관 및 관련 문서를 관리합니다
            </p>
          </div>

          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className={`${isMobile ? 'px-3' : 'px-4'}`}>
                <Plus className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4 mr-2'}`} />
                {!isMobile && '문서 추가'}
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isMobile ? 'w-[95vw]' : 'max-w-2xl'}`}>
              <DialogHeader>
                <DialogTitle>문서 업로드</DialogTitle>
              </DialogHeader>
              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                multiple={true}
                maxSize={50}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* 검색 및 필터 */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="문서명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-3 py-2 border border-input bg-background rounded-md text-sm ${
              isMobile ? 'w-full' : 'w-40'
            }`}
          >
            <option value="all">모든 유형</option>
            <option value="insurance">보험약관</option>
            <option value="contract">계약서</option>
            <option value="manual">매뉴얼</option>
            <option value="other">기타</option>
          </select>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  전체 문서
                </p>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {documents.length}
                </p>
              </div>
              <FileText className={`text-muted-foreground ${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  보험약관
                </p>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {documents.filter(d => d.type === 'insurance').length}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full bg-blue-500 ${isMobile ? 'w-2 h-2' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  계약서
                </p>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {documents.filter(d => d.type === 'contract').length}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full bg-green-500 ${isMobile ? 'w-2 h-2' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  기타
                </p>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {documents.filter(d => d.type === 'other').length}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full bg-gray-500 ${isMobile ? 'w-2 h-2' : ''}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 문서 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            문서 목록
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredDocuments.length}개)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                {documents.length === 0 ? '업로드된 문서가 없습니다' : '검색 결과가 없습니다'}
              </p>
              <Button onClick={() => setShowUpload(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                첫 문서 추가하기
              </Button>
            </div>
          ) : (
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setPreviewFile(doc.file)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate mb-1">
                          {doc.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(doc.type)}`}>
                            {getTypeLabel(doc.type)}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          업로드: {doc.uploadDate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          크기: {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(doc.id);
                        }}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF 미리보기 다이얼로그 */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className={`${isMobile ? 'w-[95vw] h-[90vh]' : 'max-w-4xl w-[90vw] h-[80vh]'}`}>
            <PDFViewer
              file={previewFile}
              onRemove={() => setPreviewFile(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
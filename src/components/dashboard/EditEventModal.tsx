import React from 'react';
import { Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: {
    id: string;
    title: string;
    description: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    customerName: string;
  };
  setEditingEvent: React.Dispatch<React.SetStateAction<{
  id: string;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  customerName: string;
}>>
  onSave: () => void;
  onClose: () => void;
}

export function EditEventModal({
  open, onOpenChange, editingEvent, setEditingEvent, onSave, onClose
}: EditEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>할 일 수정</DialogTitle>
          <DialogDescription>
            할 일 정보를 수정하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4 px-6 pb-6 space-y-0">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={editingEvent.title}
              onChange={(e) => setEditingEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="할 일 제목을 입력하세요"
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={editingEvent.description}
              onChange={(e) => setEditingEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="상세 설명을 입력하세요"
              rows={3}
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">시간</Label>
            <Input
              id="time"
              type="time"
              value={editingEvent.time}
              onChange={(e) => setEditingEvent(prev => ({ ...prev, time: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">우선순위</Label>
            <Select 
              value={editingEvent.priority} 
              onValueChange={(value: string) => setEditingEvent(prev => ({ ...prev, priority: value as 'high' | 'medium' | 'low' }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="우선순위 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">중간</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">고객명</Label>
            <Input
              id="customerName"
              value={editingEvent.customerName}
              onChange={(e) => setEditingEvent(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="고객명을 입력하세요"
              className="rounded-xl"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4 mr-2" />
            취소
          </Button>
          <Button onClick={onSave} className="rounded-xl">
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
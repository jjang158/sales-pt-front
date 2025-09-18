import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import type { SalesStageParent } from '../../lib/api';

interface StageSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allSalesStages: SalesStageParent[];
  selectedManualStages: number[];
  removedAIStages: number[];
  llmAnalysis: any;
  isLoadingSalesStages: boolean;
  salesStagesError: string | null;
  onLoadSalesStages: () => Promise<void>;
  onToggleManualStage: (stageId: number) => void;
  onToggleParentStage: (parent: SalesStageParent) => void;
  onToggleAIStage: (stageId: number) => void;
  getParentCheckState: (parent: SalesStageParent) => 'checked' | 'unchecked' | 'indeterminate';
}

export function StageSelectionModal({
  open,
  onOpenChange,
  allSalesStages,
  selectedManualStages,
  removedAIStages,
  llmAnalysis,
  isLoadingSalesStages,
  salesStagesError,
  onLoadSalesStages,
  onToggleManualStage,
  onToggleParentStage,
  onToggleAIStage,
  getParentCheckState
}: StageSelectionModalProps) {
  React.useEffect(() => {
    if (open && allSalesStages.length === 0) {
      onLoadSalesStages();
    }
  }, [open, allSalesStages.length, onLoadSalesStages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            추가 단계 선택
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          {isLoadingSalesStages ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">단계 목록 로딩 중...</p>
            </div>
          ) : salesStagesError ? (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                단계 목록 로딩 실패: {salesStagesError}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4 py-4">
              {allSalesStages.map(parent => {
                const checkState = getParentCheckState(parent);
                
                return (
                  <div key={parent.id} className="space-y-2">
                    {/* 부모 단계 */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`parent-${parent.id}`}
                        checked={checkState === 'checked' || checkState === 'indeterminate'}
                        ref={(el :HTMLInputElement | null) => {
                          if (el) el.indeterminate = checkState === 'indeterminate';
                        }}
                        onCheckedChange={() => onToggleParentStage(parent)}
                        className="w-4 h-4"
                      />
                      <Label 
                        htmlFor={`parent-${parent.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {parent.name}
                        {checkState === 'indeterminate' && (
                          <span className="text-xs text-orange-600 ml-2">(일부 선택)</span>
                        )}
                        {checkState === 'checked' && (
                          <span className="text-xs text-green-600 ml-2">(전체 선택)</span>
                        )}
                      </Label>
                    </div>
                    
                    {/* 자식 단계들 */}
                    <div className="ml-4 pl-6 border-l-2 border-gray-200 space-y-2">
                      {parent.child_list.map(child => {
                        const isAISelected = llmAnalysis?.stages.some((stage: any) => stage.id === child.id);
                        const isAIRemoved = removedAIStages.includes(child.id);
                        const isManualSelected = selectedManualStages.includes(child.id);
                        
                        return (
                          <div key={child.id} className="flex items-center gap-3">
                            <Checkbox
                              id={`modal-stage-${child.id}`}
                              checked={(isAISelected && !isAIRemoved) || isManualSelected}
                              onCheckedChange={() => {
                                if (isAISelected) {
                                  onToggleAIStage(child.id);
                                } else {
                                  onToggleManualStage(child.id);
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <Label 
                              htmlFor={`modal-stage-${child.id}`} 
                              className="text-sm cursor-pointer flex-1"
                            >
                              {child.name}
                              {isAISelected && !isAIRemoved && (
                                <span className="text-xs text-blue-600 ml-2">(AI 선택)</span>
                              )}
                              {isAISelected && isAIRemoved && (
                                <span className="text-xs text-red-600 ml-2">(AI 제거)</span>
                              )}
                              {!isAISelected && isManualSelected && (
                                <span className="text-xs text-purple-600 ml-2">(수동 선택)</span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            선택 완료 ({selectedManualStages.length}개)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
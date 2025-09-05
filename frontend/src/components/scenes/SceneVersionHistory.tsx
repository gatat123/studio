'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  User,
  FileText,
  RotateCcw,
  Eye,
  Compare,
  MessageSquare,
  MoreVertical,
  Download,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SceneVersionCompare } from './SceneVersionCompare';

interface SceneVersion {
  id: string;
  version: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: 'draft' | 'artwork';
  comment?: string;
  changes?: string;
  fileSize?: number;
}

interface SceneVersionHistoryProps {
  sceneId: string;
  sceneName: string;
  versions: SceneVersion[];
  currentVersion: number;
  onRollback?: (versionId: string) => void;
  onAddComment?: (versionId: string, comment: string) => void;
}

export function SceneVersionHistory({
  sceneId,
  sceneName,
  versions,
  currentVersion,
  onRollback,
  onAddComment,
}: SceneVersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null);
  const [rollbackDialog, setRollbackDialog] = useState<{
    isOpen: boolean;
    version: SceneVersion | null;
  }>({ isOpen: false, version: null });
  const [commentDialog, setCommentDialog] = useState<{
    isOpen: boolean;
    version: SceneVersion | null;
    comment: string;
  }>({ isOpen: false, version: null, comment: '' });

  const handleCompare = (version1: string, version2: string) => {
    setSelectedVersions([version1, version2]);
  };

  const handleRollback = (version: SceneVersion) => {
    setRollbackDialog({ isOpen: true, version });
  };

  const confirmRollback = () => {
    if (rollbackDialog.version && onRollback) {
      onRollback(rollbackDialog.version.id);
      setRollbackDialog({ isOpen: false, version: null });
    }
  };

  const handleAddComment = (version: SceneVersion) => {
    setCommentDialog({ 
      isOpen: true, 
      version, 
      comment: version.comment || '' 
    });
  };

  const saveComment = () => {
    if (commentDialog.version && onAddComment) {
      onAddComment(commentDialog.version.id, commentDialog.comment);
      setCommentDialog({ isOpen: false, version: null, comment: '' });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Sort versions by version number (descending)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            버전 히스토리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                총 {versions.length}개 버전 | 현재 버전: v{currentVersion}
              </p>
            </div>
            {sortedVersions.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCompare(
                  sortedVersions[0].id,
                  sortedVersions[1].id
                )}
              >
                <Compare className="h-4 w-4 mr-2" />
                최근 2개 버전 비교
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Version Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

        {/* Version items */}
        <div className="space-y-4">
          {sortedVersions.map((version, index) => {
            const isCurrent = version.version === currentVersion;
            const isFirst = index === 0;

            return (
              <div key={version.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    isCurrent ? "bg-primary text-primary-foreground" : "bg-card border-2"
                  )}>
                    {isFirst ? (
                      <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                        최신
                      </Badge>
                    ) : null}
                    <span className="text-sm font-semibold">v{version.version}</span>
                  </div>
                </div>

                {/* Version card */}
                <Card className={cn(
                  "flex-1",
                  isCurrent && "border-primary"
                )}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={version.url}
                          alt={`Version ${version.version}`}
                          fill
                          className="object-cover"
                        />
                        <div className={cn(
                          "absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs text-white",
                          version.type === 'draft' ? 'bg-yellow-500' : 'bg-green-500'
                        )}>
                          {version.type === 'draft' ? '초안' : '아트워크'}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                버전 {version.version}
                              </h4>
                              {isCurrent && (
                                <Badge variant="default" className="text-xs">
                                  현재 버전
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(version.uploadedAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {version.uploadedBy.name}
                              </span>
                              {version.fileSize && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {formatFileSize(version.fileSize)}
                                </span>
                              )}
                            </div>

                            {version.comment && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <MessageSquare className="h-3 w-3 inline mr-1" />
                                {version.comment}
                              </div>
                            )}

                            {version.changes && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {version.changes}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(version.url)}>
                                <Eye className="h-4 w-4 mr-2" />
                                보기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const link = document.createElement('a');
                                link.href = version.url;
                                link.download = `${sceneName}_v${version.version}.jpg`;
                                link.click();
                              }}>
                                <Download className="h-4 w-4 mr-2" />
                                다운로드
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddComment(version)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                {version.comment ? '주석 수정' : '주석 추가'}
                              </DropdownMenuItem>
                              {!isCurrent && (
                                <DropdownMenuItem 
                                  onClick={() => handleRollback(version)}
                                  className="text-warning"
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  이 버전으로 롤백
                                </DropdownMenuItem>
                              )}
                              {index > 0 && (
                                <DropdownMenuItem onClick={() => handleCompare(
                                  version.id,
                                  sortedVersions[index - 1].id
                                )}>
                                  <Compare className="h-4 w-4 mr-2" />
                                  이전 버전과 비교
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Version Compare Modal */}
      {selectedVersions && (
        <SceneVersionCompare
          isOpen={!!selectedVersions}
          onClose={() => setSelectedVersions(null)}
          version1={versions.find(v => v.id === selectedVersions[0])!}
          version2={versions.find(v => v.id === selectedVersions[1])!}
        />
      )}

      {/* Rollback Confirmation Dialog */}
      <Dialog open={rollbackDialog.isOpen} onOpenChange={(open) => 
        setRollbackDialog({ isOpen: open, version: rollbackDialog.version })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>버전 롤백 확인</DialogTitle>
            <DialogDescription>
              정말 버전 {rollbackDialog.version?.version}으로 롤백하시겠습니까?
              현재 버전의 변경사항이 손실될 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRollbackDialog({ isOpen: false, version: null })}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRollback}
            >
              롤백
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={commentDialog.isOpen} onOpenChange={(open) => 
        setCommentDialog({ ...commentDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>버전 주석 {commentDialog.version?.comment ? '수정' : '추가'}</DialogTitle>
            <DialogDescription>
              버전 {commentDialog.version?.version}에 대한 설명을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={commentDialog.comment}
            onChange={(e) => setCommentDialog({ ...commentDialog, comment: e.target.value })}
            placeholder="이 버전에서 변경된 내용이나 특이사항을 입력하세요..."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCommentDialog({ isOpen: false, version: null, comment: '' })}
            >
              취소
            </Button>
            <Button onClick={saveComment}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

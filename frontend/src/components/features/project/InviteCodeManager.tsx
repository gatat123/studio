'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { generateInviteCode, getInviteCodes, deleteInviteCode } from '@/lib/api/invites';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InviteCode {
  id: string;
  code: string;
  type: 'one-time' | 'permanent' | 'limited';
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  role: 'viewer' | 'editor' | 'admin';
  createdAt: string;
}

interface InviteCodeManagerProps {
  projectId: string;
}

export default function InviteCodeManager({ projectId }: InviteCodeManagerProps) {
  const { toast } = useToast();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // 폼 상태
  const [codeType, setCodeType] = useState<'one-time' | 'permanent' | 'limited'>('permanent');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [maxUses, setMaxUses] = useState(5);
  const [expiryDays, setExpiryDays] = useState(7);

  const loadInviteCodes = async () => {
    try {
      const codes = await getInviteCodes(projectId);
      setInviteCodes(codes);
    } catch (error) {
      console.error('Failed to load invite codes:', error);
    }
  };

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      const expiresAt = codeType !== 'permanent' 
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) 
        : undefined;
        
      const code = await generateInviteCode(projectId, {
        type: codeType,
        role,
        maxUses: codeType === 'limited' ? maxUses : undefined,
        expiresAt,
      });
      
      setInviteCodes(prev => [code, ...prev]);
      setShowForm(false);
      
      toast({
        title: '초대 코드 생성 완료',
        description: `코드: ${code.code}`,
      });
    } catch (error) {
      toast({
        title: '초대 코드 생성 실패',
        description: '초대 코드 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await deleteInviteCode(projectId, codeId);
      setInviteCodes(prev => prev.filter(c => c.id !== codeId));
      
      toast({
        title: '초대 코드 삭제 완료',
        description: '초대 코드가 삭제되었습니다.',
      });
    } catch (error) {
      toast({
        title: '초대 코드 삭제 실패',
        description: '초대 코드 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '복사 완료',
      description: '클립보드에 복사되었습니다.',
    });
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 초대 코드 생성
        </Button>
      ) : (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>초대 유형</Label>
              <Select value={codeType} onValueChange={(v: any) => setCodeType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">영구</SelectItem>
                  <SelectItem value="one-time">일회용</SelectItem>
                  <SelectItem value="limited">제한됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>권한</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">열람자</SelectItem>
                  <SelectItem value="editor">편집자</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {codeType === 'limited' && (
              <div className="space-y-2">
                <Label>최대 사용 횟수</Label>
                <Input 
                  type="number" 
                  value={maxUses} 
                  onChange={(e) => setMaxUses(parseInt(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>
            )}
            
            {codeType !== 'permanent' && (
              <div className="space-y-2">
                <Label>만료 기간 (일)</Label>
                <Input 
                  type="number" 
                  value={expiryDays} 
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  min={1}
                  max={365}
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '생성'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isLoading}
            >
              취소
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {inviteCodes.map(code => (
          <div 
            key={code.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold">{code.code}</code>
                <Badge variant="secondary">{code.role}</Badge>
                <Badge variant="outline">
                  {code.type === 'one-time' ? '일회용' : 
                   code.type === 'limited' ? `${code.usedCount}/${code.maxUses}회` : '영구'}
                </Badge>
              </div>
              {code.expiresAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  만료: {format(new Date(code.expiresAt), 'PPP', { locale: ko })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(`${window.location.origin}/invite/${code.code}`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteCode(code.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

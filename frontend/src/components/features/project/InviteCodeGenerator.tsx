'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Copy, 
  Check, 
  Link2, 
  QrCode, 
  Calendar as CalendarIcon,
  Users,
  Shield,
  Clock,
  X,
  AlertCircle 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface InviteCode {
  id: string;
  code: string;
  type: 'one-time' | 'permanent' | 'limited';
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  role: 'viewer' | 'editor' | 'admin';
  createdAt: Date;
  createdBy: string;
}

interface InviteCodeGeneratorProps {
  projectId: string;
  projectName: string;
  existingCodes: InviteCode[];
  onGenerate: (options: {
    type: 'one-time' | 'permanent' | 'limited';
    maxUses?: number;
    expiresAt?: Date;
    role: 'viewer' | 'editor' | 'admin';
  }) => Promise<InviteCode>;
  onDelete: (code: string) => Promise<void>;
}

export function InviteCodeGenerator({
  projectId,
  projectName,
  existingCodes,
  onGenerate,
  onDelete,
}: InviteCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Generation options
  const [inviteType, setInviteType] = useState<'one-time' | 'permanent' | 'limited'>('permanent');
  const [maxUses, setMaxUses] = useState<number>(5);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const options = {
        type: inviteType,
        role,
        ...(inviteType === 'limited' && { maxUses }),
        ...(expiresAt && { expiresAt }),
      };
      
      const newCode = await onGenerate(options);
      toast({
        title: '초대 코드 생성됨',
        description: `코드: ${newCode.code}`,
      });
      
      setShowGenerator(false);
      // Reset form
      setInviteType('permanent');
      setMaxUses(5);
      setExpiresAt(undefined);
      setRole('viewer');
    } catch (error) {
      toast({
        title: '오류',
        description: '초대 코드 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    const inviteUrl = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    
    toast({
      title: '복사됨',
      description: '초대 링크가 클립보드에 복사되었습니다.',
    });
  };

  const handleDelete = async (code: string) => {
    if (!confirm('이 초대 코드를 삭제하시겠습니까?')) return;
    
    try {
      await onDelete(code);
      toast({
        title: '삭제됨',
        description: '초대 코드가 삭제되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '초대 코드 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      viewer: '열람자',
      editor: '편집자',
      admin: '관리자',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'one-time': '일회용',
      'permanent': '영구',
      'limited': '제한적',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">초대 코드 관리</h3>
          <p className="text-sm text-gray-600">
            팀원을 초대하기 위한 링크를 생성하고 관리합니다.
          </p>
        </div>
        <Button onClick={() => setShowGenerator(!showGenerator)}>
          <Link2 className="w-4 h-4 mr-2" />
          새 초대 코드 생성
        </Button>
      </div>

      {/* Generator Form */}
      {showGenerator && (
        <Card>
          <CardHeader>
            <CardTitle>새 초대 코드 생성</CardTitle>
            <CardDescription>
              프로젝트에 참여할 수 있는 초대 링크를 생성합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>초대 유형</Label>
              <RadioGroup value={inviteType} onValueChange={(value: any) => setInviteType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permanent" id="permanent" />
                  <label htmlFor="permanent" className="cursor-pointer">
                    영구 링크 (계속 사용 가능)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <label htmlFor="one-time" className="cursor-pointer">
                    일회용 링크 (한 번만 사용)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limited" id="limited" />
                  <label htmlFor="limited" className="cursor-pointer">
                    제한적 링크 (횟수 제한)
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Max Uses (for limited type) */}
            {inviteType === 'limited' && (
              <div className="space-y-2">
                <Label htmlFor="maxUses">최대 사용 횟수</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  max="100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label>만료일 (선택사항)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "PPP", { locale: ko }) : "만료일 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>권한 설정</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-gray-400" />
                      열람자 - 읽기 전용
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-400" />
                      편집자 - 읽기 및 쓰기
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-purple-400" />
                      관리자 - 모든 권한
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowGenerator(false)}>
                취소
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    초대 코드 생성
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Codes List */}
      {existingCodes.length > 0 ? (
        <div className="space-y-3">
          {existingCodes.map((code) => (
            <Card key={code.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {code.code}
                      </code>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        code.type === 'permanent' && "bg-green-100 text-green-700",
                        code.type === 'one-time' && "bg-yellow-100 text-yellow-700",
                        code.type === 'limited' && "bg-blue-100 text-blue-700"
                      )}>
                        {getTypeLabel(code.type)}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        code.role === 'admin' && "bg-purple-100 text-purple-700",
                        code.role === 'editor' && "bg-blue-100 text-blue-700",
                        code.role === 'viewer' && "bg-gray-100 text-gray-700"
                      )}>
                        {getRoleLabel(code.role)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {code.maxUses && (
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {code.usedCount}/{code.maxUses} 사용
                        </span>
                      )}
                      {code.expiresAt && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(code.expiresAt), "yyyy-MM-dd")}까지
                        </span>
                      )}
                      <span className="text-gray-500">
                        생성: {format(new Date(code.createdAt), "yyyy-MM-dd HH:mm")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copiedCode === code.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(code.code)}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">아직 생성된 초대 코드가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-1">
              위 버튼을 클릭하여 첫 번째 초대 코드를 생성하세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
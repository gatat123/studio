'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, QrCode, Mail, Link2, Loader2 } from 'lucide-react';
import { generateInviteCode, getInviteCodes } from '@/lib/api/invites';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InviteCodeModalProps {
  projectId: string;
  onClose: () => void;
}

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

export default function InviteCodeModal({ projectId, onClose }: InviteCodeModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [newCode, setNewCode] = useState<InviteCode | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // 새 초대코드 생성 옵션
  const [codeType, setCodeType] = useState<'one-time' | 'permanent' | 'limited'>('permanent');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [maxUses, setMaxUses] = useState(5);
  const [expiryDays, setExpiryDays] = useState(7);
  
  useEffect(() => {
    loadInviteCodes();
  }, [projectId]);
  
  useEffect(() => {
    if (newCode) {
      generateQRCode(newCode.code);
    }
  }, [newCode]);
  
  const loadInviteCodes = async () => {
    try {
      const codes = await getInviteCodes(projectId);
      setInviteCodes(codes);
    } catch (error) {
      console.error('Failed to load invite codes:', error);
    }
  };
  
  const generateQRCode = async (code: string) => {
    const inviteUrl = `${window.location.origin}/invite/${code}`;
    const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 200,
      margin: 2,
    });
    setQrCodeUrl(qrDataUrl);
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
      
      setNewCode(code);
      setInviteCodes(prev => [code, ...prev]);
      
      toast({
        title: '초대 코드 생성 완료',
        description: '초대 코드가 성공적으로 생성되었습니다.',
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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '복사 완료',
      description: '클립보드에 복사되었습니다.',
    });
  };
  
  const getInviteUrl = (code: string) => {
    return `${window.location.origin}/invite/${code}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>프로젝트 초대</DialogTitle>
          <DialogDescription>
            초대 코드를 생성하여 팀원을 프로젝트에 초대하세요.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">새 초대코드</TabsTrigger>
            <TabsTrigger value="existing">기존 코드 목록</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="space-y-4">
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
            
            <Button 
              onClick={handleGenerateCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초대 코드 생성
                </>
              )}
            </Button>
            
            {newCode && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">초대 코드</p>
                    <p className="text-xl font-mono font-bold">{newCode.code}</p>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newCode.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">초대 링크</p>
                    <p className="text-sm font-mono break-all">
                      {getInviteUrl(newCode.code)}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(getInviteUrl(newCode.code))}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white rounded">
                    <img src={qrCodeUrl} alt="QR Code" />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="existing" className="space-y-4">
            {inviteCodes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                아직 생성된 초대 코드가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {inviteCodes.map(code => (
                  <div 
                    key={code.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-mono font-bold">{code.code}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>권한: {code.role}</span>
                        <span>사용: {code.usedCount}{code.maxUses && `/${code.maxUses}`}</span>
                        {code.expiresAt && (
                          <span>
                            만료: {format(new Date(code.expiresAt), 'PPP', { locale: ko })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getInviteUrl(code.code))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

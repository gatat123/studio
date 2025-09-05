'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types/project.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateProject, deleteProject } from '@/lib/api/projects';
import { Trash2, Save, AlertTriangle, Loader2 } from 'lucide-react';
import CategorySelector from './CategorySelector';
import InviteCodeManager from './InviteCodeManager';
import ProjectMemberManager from './ProjectMemberManager';

interface ProjectSettingsProps {
  project: Project;
  studioId: string;
}

export default function ProjectSettings({ project, studioId }: ProjectSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  // 프로젝트 정보 상태
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [category, setCategory] = useState(project.category);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProject(project.id, {
        title,
        description,
        category,
      });
      
      toast({
        title: '설정 저장 완료',
        description: '프로젝트 설정이 저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '설정 저장 실패',
        description: '설정 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== project.title) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      
      toast({
        title: '프로젝트 삭제 완료',
        description: '프로젝트가 삭제되었습니다.',
      });
      
      router.push(`/studios/${studioId}/projects`);
    } catch (error) {
      toast({
        title: '프로젝트 삭제 실패',
        description: '프로젝트 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">일반</TabsTrigger>
        <TabsTrigger value="members">멤버 관리</TabsTrigger>
        <TabsTrigger value="invites">초대 코드</TabsTrigger>
        <TabsTrigger value="danger">위험 지역</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 정보</CardTitle>
            <CardDescription>
              프로젝트의 기본 정보를 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">프로젝트 이름</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="프로젝트 이름"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="프로젝트 설명"
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label>카테고리</Label>
              <CategorySelector
                value={category}
                onChange={setCategory}
              />
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  변경사항 저장
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="members" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>멤버 관리</CardTitle>
            <CardDescription>
              프로젝트 멤버를 관리하고 권한을 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectMemberManager
              projectId={project.id}
              members={project.collaborators || []}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="invites" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>초대 코드 관리</CardTitle>
            <CardDescription>
              프로젝트 초대 코드를 생성하고 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteCodeManager projectId={project.id} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="danger" className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              <AlertTriangle className="inline-block mr-2 h-5 w-5" />
              위험 지역
            </CardTitle>
            <CardDescription>
              이 작업들은 되돌릴 수 없습니다. 신중하게 진행하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">프로젝트 삭제</h3>
              <p className="text-sm text-muted-foreground">
                프로젝트를 삭제하면 모든 씬, 댓글, 파일이 영구적으로 삭제됩니다.
                이 작업은 되돌릴 수 없습니다.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    프로젝트 삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 프로젝트와 관련된 모든 데이터가
                      영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="my-4">
                    <Label htmlFor="confirm">
                      프로젝트 이름을 입력하여 확인: <strong>{project.title}</strong>
                    </Label>
                    <Input
                      id="confirm"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="프로젝트 이름 입력"
                      className="mt-2"
                    />
                  </div>
                  
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={confirmText !== project.title || isDeleting}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          삭제 중...
                        </>
                      ) : (
                        '영구 삭제'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

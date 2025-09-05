'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudio } from '@/components/features/studio/hooks/useStudio';
import { UpdateStudioDto } from '@/types/studio';

export default function StudioSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params.studioId as string;
  const { studio, loading, error, updateStudio, deleteStudio } = useStudio(studioId);
  
  const [formData, setFormData] = useState<UpdateStudioDto>({
    name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 스튜디오 정보가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (studio) {
      setFormData({
        name: studio.name,
        description: studio.description || '',
      });
    }
  }, [studio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">스튜디오를 찾을 수 없습니다.</p>
        <Button onClick={() => router.push('/studios')}>
          스튜디오 목록으로
        </Button>
      </div>
    );
  }

  const canManage = studio.role === 'owner' || studio.role === 'admin';

  if (!canManage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">이 페이지에 접근할 권한이 없습니다.</p>
        <Button onClick={() => router.push(`/studios/${studioId}`)}>
          스튜디오로 돌아가기
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = '스튜디오 이름을 입력해주세요.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSaving(true);
    try {
      await updateStudio(formData);
      router.push(`/studios/${studioId}`);
    } catch (error) {
      console.error('Failed to update studio:', error);
      setErrors({ submit: '스튜디오 업데이트에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`정말 "${studio.name}" 스튜디오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await deleteStudio();
      router.push('/studios');
    } catch (error) {
      console.error('Failed to delete studio:', error);
      alert('스튜디오 삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/studios/${studioId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          스튜디오로 돌아가기
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">스튜디오 설정</h1>
        <p className="text-gray-600 mt-2">스튜디오 정보를 수정하고 관리합니다.</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>스튜디오의 기본 정보를 수정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">스튜디오 이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 디자인 스튜디오"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="스튜디오에 대한 간단한 설명을 입력하세요."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="logo">로고</Label>
              <div className="flex items-center gap-4">
                {studio.logo ? (
                  <img 
                    src={studio.logo} 
                    alt="Studio logo" 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <Button variant="outline" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  로고 업로드
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                최대 2MB, JPG/PNG 형식
              </p>
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm">{errors.submit}</p>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    변경사항 저장
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {studio.role === 'owner' && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">위험 구역</CardTitle>
              <CardDescription>
                이 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">스튜디오 삭제</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      스튜디오와 모든 프로젝트, 데이터가 영구적으로 삭제됩니다.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        삭제 중...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        스튜디오 삭제
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
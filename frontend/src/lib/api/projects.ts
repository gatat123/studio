import { API_BASE_URL } from './client';

export interface Project {
  id: string;
  studioId: string;
  title: string;
  description?: string;
  category: 'webtoon' | 'illustration' | 'storyboard' | 'concept';
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'archived';
  deadline?: string;
  thumbnail?: string;
  scenes?: any[];
  collaborators?: any[];
  inviteCode?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// 프로젝트 목록 조회
export async function getProjects(
  studioId: string, 
  filters?: { status?: string; category?: string; sort?: string }
): Promise<Project[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sort) params.append('sort', filters.sort);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/studios/${studioId}/projects${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// 프로젝트 상세 조회
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// 프로젝트 생성
export async function createProject(
  studioId: string,
  data: Partial<Project>
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/studios/${studioId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
}

// 프로젝트 수정
export async function updateProject(
  projectId: string,
  data: Partial<Project>
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
}

// 프로젝트 상태 변경
export async function updateProjectStatus(
  projectId: string,
  status: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) throw new Error('Failed to update project status');
}

// 프로젝트 삭제
export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to delete project');
}

// 프로젝트 활동 내역 조회
export async function getProjectActivity(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/activity`, {
      credentials: 'include',
    });
    
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching project activity:', error);
    return [];
  }
}

// 멤버 권한 변경
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: 'viewer' | 'editor' | 'admin'
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/members/${memberId}/role`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ role }),
    }
  );
  
  if (!response.ok) throw new Error('Failed to update member role');
}

// 멤버 제거
export async function removeMember(
  projectId: string,
  memberId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/members/${memberId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );
  
  if (!response.ok) throw new Error('Failed to remove member');
}

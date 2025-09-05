# 스토리보드 협업 플랫폼

## 개요
그림 작가와 원활한 커뮤니케이션을 위한 웹 기반 스토리보드 협업 플랫폼

## 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL (Railway)
- **Storage**: Volume 기반 파일 저장
- **Authentication**: JWT
- **Real-time**: WebSocket

## 설치 및 실행

### 필수 요구사항
- Node.js 18.x 이상
- PostgreSQL 데이터베이스
- npm 또는 yarn

### 백엔드 설정

```bash
cd backend
npm install
# .env 파일 생성 및 환경 변수 설정
npm run start:dev
```

### 프론트엔드 설정

```bash
cd frontend
npm install
# .env.local 파일 생성 및 환경 변수 설정
npm run dev
```

## 환경 변수 설정

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/storyboard
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 프로젝트 구조
```
studio/
├── frontend/         # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/     # App Router
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── public/
├── backend/          # NestJS 백엔드
│   ├── src/
│   │   ├── auth/
│   │   ├── studios/
│   │   ├── projects/
│   │   ├── scenes/
│   │   └── common/
│   └── test/
└── .taskmaster/      # 작업 관리
```

## 주요 기능
- 🔐 **인증 시스템**: JWT 기반 보안 인증
- 🏢 **스튜디오 관리**: 팀 협업 공간
- 📁 **프로젝트 관리**: 프로젝트 생성 및 관리
- 🎨 **씬 관리**: 다중 파일 업로드, 버전 관리
- 💬 **실시간 협업**: 댓글, 알림, 실시간 업데이트
- 📊 **데이터 영속성**: 모든 작업 자동 저장

## 개발 현황
- Task Master AI를 통한 체계적인 작업 관리
- 총 25개 메인 작업, 하위 작업 진행 중
- 현재 Phase 1 (Core) 구현 중

## 라이센스
MIT
# 📚 스토리보드 협업 플랫폼 (Studio)

> 그림 작가와 클라이언트를 위한 실시간 협업 스토리보드 관리 플랫폼

## 🎨 프로젝트 소개

Studio는 그림 작가와 클라이언트가 원활하게 소통하며 프로젝트를 진행할 수 있도록 돕는 웹 기반 협업 플랫폼입니다. 실시간 피드백, 버전 관리, 다중 파일 업로드 등의 기능을 통해 창작 과정을 효율적으로 관리할 수 있습니다.

### 주요 기능
- 🏢 **스튜디오 관리**: 프로젝트별 작업 공간 생성 및 멤버 초대
- 📁 **프로젝트 관리**: 웹툰, 일러스트, 스토리보드 등 다양한 프로젝트 타입 지원
- 🎞️ **씬 관리**: 드래그&드롭 다중 업로드, 순서 변경, 버전 관리
- 💬 **실시간 협업**: 위치 기반 댓글, 실시간 알림, 활동 로그
- 🔐 **보안**: JWT 기반 인증, 역할 기반 접근 제어
- 💾 **데이터 영속성**: 모든 작업 자동 저장 및 히스토리 관리

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **UI Components**: shadcn/ui
- **Real-time**: Socket.io-client

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (Railway)
- **ORM**: TypeORM
- **Authentication**: JWT (Access + Refresh Token)
- **Real-time**: Socket.io
- **File Storage**: Local + Cloud (Railway Volume)

### Infrastructure
- **Deployment**: Railway
- **Version Control**: Git + GitHub
- **Task Management**: Task Master AI
- **Code Quality**: ESLint + Prettier

## 📋 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- PostgreSQL 14 이상
- Git

### 설치 방법

1. **리포지토리 클론**
```bash
git clone https://github.com/gatat123/studio.git
cd studio
```

2. **환경 변수 설정**

`.env.example`을 `.env`로 복사하고 필요한 값을 설정합니다:

```bash
# Root .env
NODE_ENV=development

# Backend 환경 변수 (backend/.env)
cp backend/.env.example backend/.env

# Frontend 환경 변수 (frontend/.env.local)
cp frontend/.env.local.example frontend/.env.local
```

3. **의존성 설치**

```bash
# Backend 의존성 설치
cd backend
npm install

# Frontend 의존성 설치
cd ../frontend
npm install
```

4. **데이터베이스 설정**

PostgreSQL 데이터베이스를 생성하고 연결 정보를 `backend/.env`에 설정합니다:

```env
# backend/.env
DATABASE_URL=postgresql://username:password@localhost:5432/studio_db
```

5. **개발 서버 실행**

```bash
# Backend 서버 실행 (포트 3001)
cd backend
npm run start:dev

# Frontend 서버 실행 (포트 3000)
cd frontend
npm run dev
```

## 🔧 환경 변수 설정

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/studio_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Server
PORT=3001

# Email (옵션)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_NAME=Studio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 프로젝트 구조

```
studio/
├── backend/                    # NestJS 백엔드
│   ├── src/
│   │   ├── auth/              # 인증 모듈
│   │   ├── studios/           # 스튜디오 관리
│   │   ├── projects/          # 프로젝트 관리
│   │   ├── scenes/            # 씬 관리
│   │   ├── comments/          # 댓글 시스템
│   │   ├── upload/            # 파일 업로드
│   │   ├── websocket/         # 실시간 통신
│   │   ├── common/            # 공통 모듈
│   │   └── config/            # 설정 파일
│   ├── test/                  # 테스트 파일
│   └── uploads/               # 업로드 임시 저장소
│
├── frontend/                  # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/              # App Router 페이지
│   │   ├── components/       # React 컴포넌트
│   │   ├── hooks/            # 커스텀 훅
│   │   ├── lib/              # 유틸리티 함수
│   │   ├── types/            # TypeScript 타입
│   │   └── styles/           # 글로벌 스타일
│   └── public/               # 정적 파일
│
├── .taskmaster/              # Task Master 설정
├── .cursor/                  # Cursor 에디터 설정
└── docs/                     # 추가 문서
```

## 🚀 배포

### Railway 배포

1. **Railway 계정 생성 및 프로젝트 생성**
   - [Railway](https://railway.app) 접속 및 로그인
   - New Project 생성

2. **PostgreSQL 서비스 추가**
   - Add Service → Database → PostgreSQL
   - 연결 정보 확인 및 저장

3. **환경 변수 설정**
   - Railway 대시보드에서 Variables 탭 접속
   - 필요한 환경 변수 추가

4. **GitHub 연동 및 자동 배포**
   - GitHub 리포지토리 연결
   - 자동 배포 설정

## 📝 API 문서

백엔드 서버 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:
- Swagger UI: `http://localhost:3001/api-docs` (구현 예정)

### 주요 API 엔드포인트

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃

#### 스튜디오
- `GET /api/studios` - 스튜디오 목록 조회
- `POST /api/studios` - 스튜디오 생성
- `PUT /api/studios/:id` - 스튜디오 수정
- `DELETE /api/studios/:id` - 스튜디오 삭제

#### 프로젝트
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 프로젝트 생성
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

## 🧪 테스트

```bash
# Backend 테스트
cd backend
npm run test           # 유닛 테스트
npm run test:e2e       # E2E 테스트
npm run test:cov       # 커버리지 확인

# Frontend 테스트 (구현 예정)
cd frontend
npm run test
```

## 🔍 트러블슈팅

### 일반적인 문제 해결

1. **데이터베이스 연결 오류**
   - PostgreSQL 서비스가 실행 중인지 확인
   - 환경 변수의 데이터베이스 연결 정보 확인
   - 방화벽 설정 확인

2. **포트 충돌**
   - 3000, 3001 포트가 사용 중인지 확인
   - 필요시 환경 변수에서 포트 변경

3. **의존성 설치 오류**
   - Node.js 버전 확인 (18.0.0 이상)
   - npm 캐시 정리: `npm cache clean --force`
   - node_modules 삭제 후 재설치

## 🤝 기여하기

프로젝트 기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **GitHub**: [https://github.com/gatat123/studio](https://github.com/gatat123/studio)
- **Issues**: [https://github.com/gatat123/studio/issues](https://github.com/gatat123/studio/issues)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움으로 만들어졌습니다:
- Next.js
- NestJS
- PostgreSQL
- TypeScript
- Tailwind CSS
- shadcn/ui

---
*Last Updated: 2025-01-10*
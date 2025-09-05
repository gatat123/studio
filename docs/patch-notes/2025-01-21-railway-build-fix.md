# 패치노트 - Railway 백엔드 빌드 에러 수정
**날짜**: 2025-01-21
**작업자**: Claude Desktop Assistant
**작업 유형**: 버그 수정

## 🐛 문제 설명
Railway 백엔드 빌드 시 다음 에러 발생:
```
build.nixpacksConfigPath: Expected string, received object
```

## 🔍 원인 분석
1. **railway.toml** 파일에 잘못된 설정 형식 존재
2. nixpacksConfigPath가 객체 형태로 잘못 설정됨:
   ```toml
   [build.nixpacksConfigPath]  # 잘못된 형식
   path = "nixpacks.toml"
   ```
3. railway.json과 railway.toml이 동시에 존재하여 설정 충돌

## ✅ 해결 방법
### 수행 작업
1. **railway.toml** 파일을 **railway.toml.backup**으로 백업
2. Railway는 이제 **railway.json** 파일만 사용하도록 설정
### 현재 유효한 빌드 설정 (railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 📝 변경 파일 목록
- `railway.toml` → `railway.toml.backup` (백업)
- `railway.json` (유지 - 메인 설정 파일)
- `nixpacks.toml` (유지 - Nixpacks 빌드 설정)

## 🚀 다음 단계
1. Railway 대시보드에서 재배포 시도
2. 빌드 로그 확인
3. 성공적으로 빌드되는지 모니터링

## ⚠️ 주의사항
- railway.toml.backup 파일은 참고용으로 보관
- 향후 Railway 설정 변경 시 railway.json 파일만 수정
- nixpacks.toml은 그대로 유지 (Nixpacks 빌드 프로세스 설정)
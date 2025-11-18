#!/bin/bash

###############################################################################
# Docker 컨테이너 Entrypoint
#
# 역할:
# 1. 환경 설정 확인
# 2. Node.js 애플리케이션 실행
#
# 참고: 환경변수는 Docker Compose의 env_file을 통해 자동 전달됨
###############################################################################

set -e

echo "=========================================="
echo "Recruitment Parser 컨테이너 시작"
echo "시작 시간: $(date)"
echo "=========================================="

# 환경변수 확인 (민감정보 제외)
echo ""
echo "환경 설정:"
echo "  NODE_ENV: ${NODE_ENV:-production}"
echo "  TZ: ${TZ:-Asia/Seoul}"
echo "  MYSQL_HOST: ${MYSQL_HOST:-NOT SET}"
echo "  MYSQL_DATABASE: ${MYSQL_DATABASE:-NOT SET}"
echo ""

# 로그 디렉토리 확인
if [ ! -d "/app/logs" ]; then
    echo "로그 디렉토리 생성 중..."
    mkdir -p /app/logs
    echo "✅ 로그 디렉토리 생성 완료"
fi

echo "=========================================="
echo "Recruitment Parser 시작"
echo "=========================================="
echo ""

# Node.js 애플리케이션 실행
# 환경변수 검증은 애플리케이션 코드(dotenv)에서 처리
exec node dist/index.js

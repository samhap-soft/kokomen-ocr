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

# Cron이 환경변수를 사용할 수 있도록 설정
printenv | grep -v "no_proxy" >> /etc/environment

# Cron 작업을 위한 환경 변수 파일 생성
echo "Cron용 환경 변수 파일 생성 중..."
printenv | grep -v "no_proxy" | sed 's/^\(.*\)$/export \1/g' > /etc/cron.d/env-vars
chmod +x /etc/cron.d/env-vars
echo "✅ 환경 변수 파일 생성 완료: /etc/cron.d/env-vars"

# Cron 데몬 시작
echo "Cron 데몬 시작 중..."
service cron start

# Cron 상태 확인
if service cron status > /dev/null 2>&1; then
    echo "✅ Cron 데몬 시작 성공"
else
    echo "❌ Cron 데몬 시작 실패"
    exit 1
fi

# Crontab 내용 출력
echo ""
echo "등록된 Cron 스케줄:"
if crontab -l 2>/dev/null; then
    echo "✅ Cron 작업이 정상적으로 등록되었습니다"
else
    echo "⚠️  등록된 Cron 작업이 없습니다"
fi
echo ""

# Cron 작업 파일 확인
echo "Cron 작업 파일 확인:"
if [ -f /etc/cron.d/recruitment-parser-cron ]; then
    echo "✅ /etc/cron.d/recruitment-parser-cron 파일 존재"
    cat /etc/cron.d/recruitment-parser-cron
else
    echo "⚠️  /etc/cron.d/recruitment-parser-cron 파일이 없습니다"
fi
echo ""

# 초기 연결 테스트 (Node.js 사용)
echo "MySQL 연결 테스트 중..."
if node mysqlConnectionTest.js; then
    echo "✅ MySQL 연결 성공"
else
    echo "⚠️  MySQL 연결 실패 - 환경변수를 확인하세요"
fi

echo "=========================================="
echo "Cron 작업 시작"
echo "=========================================="
echo ""

# Cron 로그를 tail로 포어그라운드에서 실행
# 이렇게 해야 컨테이너가 종료되지 않음
echo "Cron 로그 모니터링 시작..."
touch /var/log/recruitment-parse.log
tail -f /var/log/recruitment-parse.log

FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 도구 설치
RUN apt-get update && apt-get install -y \
    curl \
    cron \
    && rm -rf /var/lib/apt/lists/*

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# 의존성 파일 복사 및 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# TypeScript 설정 파일 복사
COPY tsconfig.json .
COPY eslint.config.js .
COPY .prettierrc.json .

# 소스 코드 복사
COPY src ./src

# TypeScript 빌드
RUN pnpm run build

COPY dist ./dist

# 로그 및 이미지 디렉토리 생성
RUN mkdir -p /app/images

# 크론 스크립트 및 테스트 파일 복사
COPY run_recruitment_parse.sh /app/run_recruitment_parse.sh
COPY mysqlConnectionTest.js /app/mysqlConnectionTest.js

# Crontab 및 Entrypoint 파일 복사
COPY crontab /etc/cron.d/recruitment-parser-cron
COPY entrypoint.sh /entrypoint.sh

# 권한 설정
RUN chmod 0644 /etc/cron.d/recruitment-parser-cron && \
    chmod +x /entrypoint.sh && \
    chmod +x /app/run_recruitment_parse.sh

# 환경변수 기본값 설정
ENV NODE_ENV=production
ENV TZ=Asia/Seoul

# 헬스체크 스크립트 생성 (cron 프로세스 체크)
RUN echo '#!/bin/sh\nps aux | grep -v grep | grep "cron" > /dev/null && exit 0 || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Entrypoint 설정
ENTRYPOINT ["/entrypoint.sh"]

# المرحلة 1: بناء التطبيق باستخدام pnpm
FROM node:20-alpine AS builder

# عرّف متغيرات البيئة
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_ENVIRONMENT

WORKDIR /app

# سجل معلومات البناء
RUN echo "Building $RAILWAY_SERVICE_NAME in $RAILWAY_ENVIRONMENT environment"

# انسخ package.json و pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# استخدم cache عام لـ pnpm
RUN --mount=type=cache,id=s/pnpm-store,target=/root/.pnpm-store \
    npm install -g pnpm@8 && \
    pnpm install --frozen-lockfile

# انسخ باقي الكود
COPY . .

# بناء المشروع
RUN pnpm run build

# المرحلة 2: خدمة الملفات الثابتة عبر nginx
FROM nginx:alpine

# تثبيت bash لتمكين تنفيذ أوامر shell
RUN apk add --no-cache bash

# انسخ الملفات المبنية إلى مجلد nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# انسخ ملف nginx كقالب
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# قم بتعديل ملف الإعدادات باستخدام PORT عند التشغيل
CMD envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'

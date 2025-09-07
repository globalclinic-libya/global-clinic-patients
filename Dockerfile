# المرحلة 1: بناء التطبيق باستخدام pnpm
FROM node:20-alpine AS builder

# عرّف متغيرات البيئة من Railway (اختيارية، لكن مفيدة للتصحيح)
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_ENVIRONMENT

WORKDIR /app

# سجل معلومات البناء
RUN echo "🏗️ Building $RAILWAY_SERVICE_NAME in $RAILWAY_ENVIRONMENT environment"

# انسخ ملف القفل أولاً
COPY pnpm-lock.yaml ./

# استخدم cache mount لتسريع التثبيت
RUN --mount=type=cache,id=s/4f4b8ecf-8b2a-40c5-b28f-51e93180ef5b-pnpm,target=/root/.pnpm-store \
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

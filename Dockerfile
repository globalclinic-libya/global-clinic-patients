# المرحلة 1: بناء التطبيق باستخدام pnpm
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@8 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# المرحلة 2: خدمة الملفات الثابتة عبر nginx
FROM nginx:alpine

# تثبيت bash و util-linux (لوجود envsubst)
RUN apk add --no-cache bash curl

# انسخ الملفات المبنية إلى مجلد nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# انسخ ملف nginx كقالب
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# قم بتعديل ملف الإعدادات باستخدام PORT عند التشغيل
CMD envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'

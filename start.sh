#!/bin/sh
set -e

echo "🚀 Starting server setup..."
echo "📁 PORT is set to: $PORT"

# تأكد من أن الملف موجود
if [ ! -f "/etc/nginx/conf.d/default.conf.template" ]; then
  echo "❌ Error: default.conf.template not found!"
  exit 1
fi

# استبدل المتغيرات
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# عرض المحتوى للتحقق
echo "📄 Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

# ابدأ nginx
exec nginx -g 'daemon off;'

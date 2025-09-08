#!/bin/sh
set -e

echo "Starting server setup..."

# تأكد من أن الملف موجود
if [ ! -f "/etc/nginx/conf.d/default.conf.template" ]; then
  echo "Error: default.conf.template not found!"
  exit 1
fi

# استبدل المتغيرات في ملف الإعدادات
echo "Substituting PORT into nginx config..."
echo "Current PORT value: $PORT"
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# عرض المحتوى للتحقق (للتصحيح فقط)
echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

# ابدأ nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'

#!/bin/sh
set -e

echo "Starting server..."
echo "PORT is set to: $PORT"

# تأكد من أن الملف موجود
if [ ! -f "/etc/nginx/conf.d/default.conf.template" ]; then
  echo "Error: default.conf.template not found!"
  exit 1
fi

# استبدل المتغيرات
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# ابدأ nginx
echo "Starting nginx on port $PORT"
exec nginx -g 'daemon off;'

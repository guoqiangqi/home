FROM nginx:alpine

# 复制 dist 目录到 nginx 默认目录
COPY dist/ /usr/share/nginx/html/

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 
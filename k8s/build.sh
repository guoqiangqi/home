#!/bin/bash

# 构建脚本
echo "开始构建 Docker 镜像..."

# 创建临时构建目录
mkdir -p temp-build
cp -r ../dist temp-build/
cp Dockerfile temp-build/

# 构建 Docker 镜像
echo "构建 guoqiangqi/home-app:latest 镜像..."
sudo docker build -t guoqiangqi/home-app:latest temp-build/

# 清理临时目录
rm -rf temp-build

echo "Docker 镜像构建完成！"
echo "现在可以应用 Kubernetes 配置："
echo "kubectl apply -f deployment.yaml"
echo "kubectl apply -f service.yaml"
echo "kubectl apply -f ingress.yaml" 
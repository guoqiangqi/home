#!/bin/bash

# 清理脚本
echo "开始清理 Kubernetes 资源..."

# 删除 Kubernetes 资源
kubectl -n home-app delete -f ingress.yaml --ignore-not-found=true
kubectl -n home-app delete -f service.yaml --ignore-not-found=true
kubectl -n home-app delete -f deployment.yaml --ignore-not-found=true

# 删除命名空间（可选）
read -p "是否删除命名空间 home-app？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl delete namespace home-app
    echo "命名空间已删除"
else
    echo "保留命名空间"
fi

# 删除 Docker 镜像（可选）
read -p "是否删除 Docker 镜像 home-app:latest？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo docker rmi home-app:latest
    echo "Docker 镜像已删除"
else
    echo "保留 Docker 镜像"
fi

echo "清理完成！" 
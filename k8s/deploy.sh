#!/bin/bash

# 部署脚本
echo "开始部署到 Kubernetes..."

# 检查命名空间是否存在，如果不存在则创建
kubectl get namespace home-app >/dev/null 2>&1 || kubectl create namespace home-app

# 应用 Kubernetes 配置
echo "应用 Deployment..."
kubectl -n home-app apply -f deployment.yaml

echo "应用 Service..."
kubectl -n home-app apply -f service.yaml

echo "应用 Ingress..."
kubectl -n home-app apply -f ingress.yaml

# 等待 Pod 启动
echo "等待 Pod 启动..."
kubectl -n home-app wait --for=condition=ready pod -l app=home-app --timeout=300s

# 显示部署状态
echo "部署状态："
kubectl -n home-app get pods
kubectl -n home-app get svc
kubectl -n home-app get ingress

echo "部署完成！" 
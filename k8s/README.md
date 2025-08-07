# Kubernetes 部署指南

## 文件说明

- `Dockerfile` - 用于构建包含 dist 文件的 nginx 镜像
- `deployment.yaml` - Kubernetes Deployment 配置
- `service.yaml` - Kubernetes Service 配置
- `ingress.yaml` - Kubernetes Ingress 配置
- `build.sh` - 构建 Docker 镜像的脚本
- `deploy.sh` - 部署到 Kubernetes 的脚本
- `cleanup.sh` - 清理 Kubernetes 资源的脚本

## 部署步骤

### 1. 构建项目
```bash
# 在项目根目录执行
pnpm build
```

### 2. 构建 Docker 镜像
```bash
# 在 k8s 目录下执行
cd k8s
chmod +x build.sh
./build.sh
```

### 3. 部署到 Kubernetes
```bash
# 在 k8s 目录下执行
chmod +x deploy.sh
./deploy.sh
```

### 4. 验证部署
```bash
# 检查 Pod 状态
kubectl -n home-app get pods

# 检查服务状态
kubectl -n home-app get svc

# 检查 Ingress 状态
kubectl -n home-app get ingress
```

## 配置说明

### Ingress 配置
在 `ingress.yaml` 中修改以下配置：

1. **域名配置**：将 `home.example.com` 替换为您的实际域名
2. **Ingress Controller**：根据您使用的控制器调整：
   - nginx-ingress：使用 `ingressClassName: nginx`
   - traefik：使用 `ingressClassName: traefik`

### HTTPS 配置
如需启用 HTTPS，在 `ingress.yaml` 中取消注释 TLS 配置并创建相应的 Secret。

## 更新部署

当您修改代码后需要重新部署：

```bash
# 重新构建项目
pnpm build

# 重新构建镜像
./build.sh

# 重启 Deployment
kubectl -n home-app rollout restart deployment/home-app
```

## 清理资源

```bash
# 在 k8s 目录下执行
chmod +x cleanup.sh
./cleanup.sh
```

## 故障排除

### 常见问题

1. **Pod 无法启动**：
   ```bash
   kubectl -n home-app describe pod <pod-name>
   kubectl -n home-app logs <pod-name>
   ```

2. **Ingress 无法访问**：
   ```bash
   kubectl -n home-app describe ingress home-app-ingress
   kubectl get events --sort-by=.metadata.creationTimestamp
   ```

3. **镜像构建失败**：
   - 确保 dist 目录存在且包含文件
   - 检查 Docker 权限

### 监控和日志

```bash
# 查看应用日志
kubectl -n home-app logs -l app=home-app

# 查看 Ingress Controller 日志
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# 监控资源使用
kubectl -n home-app top pods
``` 
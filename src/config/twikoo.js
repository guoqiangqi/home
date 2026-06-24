// Twikoo 配置文件
export const twikooConfig = {
  // Twikoo 环境 ID：优先读取环境变量 VITE_TWIKOO_ENVID（你自己部署的后端地址或腾讯云环境 ID）
  envId: import.meta.env.VITE_TWIKOO_ENVID || 'https://twikoo-one-brown-59.vercel.app',
  
  // 评论容器选择器
  el: '#twikoo',
  
  // 语言设置
  lang: 'zh-CN',
  
  // 当前页面路径
  path: window.location.pathname,
  
  // 评论框配置
  comment: {
    placeholder: '分享你的想法，让这里成为思想的交汇点...',
    maxLength: 500,
    showCount: true
  },
  
  // 用户信息配置
  user: {
    nickname: '昵称',
    email: '邮箱',
    website: '网址（选填）'
  }
};

// 自定义样式配置
export const twikooStyles = `
  /* Twikoo 自定义样式 - 现代化设计 */
  .twikoo-comments {
    background: transparent !important;
    padding: 0 !important;
  }
  
  /* 评论容器 - 玻璃态设计 */
  .twikoo .twikoo-comment {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 20px !important;
    margin-bottom: 25px !important;
    padding: 30px !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative !important;
    overflow: hidden !important;
  }
  
  .twikoo .twikoo-comment::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 1px !important;
    background: linear-gradient(90deg, transparent, rgba(78, 205, 196, 0.5), transparent) !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease !important;
  }
  
  .twikoo .twikoo-comment:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 12px 30px rgba(78, 205, 196, 0.25) !important;
    border-color: rgba(78, 205, 196, 0.3) !important;
  }
  
  .twikoo .twikoo-comment:hover::before {
    opacity: 1 !important;
  }
  
  /* 用户头像 - 现代化设计 */
  .twikoo .twikoo-comment .twikoo-avatar {
    border-radius: 50% !important;
    border: 3px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s ease !important;
  }
  
  .twikoo .twikoo-comment:hover .twikoo-avatar {
    border-color: rgba(78, 205, 196, 0.5) !important;
    transform: scale(1.05) !important;
  }
  
  /* 用户名 - 渐变文字 */
  .twikoo .twikoo-comment .twikoo-nick {
    background: linear-gradient(135deg, #4ecdc4 0%, #a78bff 100%) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    font-weight: 700 !important;
    font-size: 1.1rem !important;
    text-shadow: none !important;
  }
  
  /* 评论时间 - 优雅设计 */
  .twikoo .twikoo-comment .twikoo-time {
    color: rgba(255, 255, 255, 0.6) !important;
    font-size: 0.85rem !important;
    font-weight: 400 !important;
    margin-left: 10px !important;
    padding: 4px 8px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px !important;
    backdrop-filter: blur(5px) !important;
  }
  
  /* 评论内容 - 优化排版 */
  .twikoo .twikoo-comment .twikoo-content {
    color: rgba(255, 255, 255, 0.95) !important;
    line-height: 1.8 !important;
    margin: 15px 0 !important;
    font-size: 1rem !important;
    font-weight: 400 !important;
    text-shadow: none !important;
  }
  
  /* 评论操作按钮 - 现代化按钮 */
  .twikoo .twikoo-comment .twikoo-actions {
    margin-top: 20px !important;
    display: flex !important;
    gap: 10px !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 12px !important;
    color: rgba(255, 255, 255, 0.9) !important;
    padding: 10px 16px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    font-weight: 500 !important;
    font-size: 0.9rem !important;
    backdrop-filter: blur(10px) !important;
    cursor: pointer !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action:hover {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(167, 139, 255, 0.15) 100%) !important;
    border-color: rgba(78, 205, 196, 0.4) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2) !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action.liked {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(167, 139, 255, 0.25) 100%) !important;
    border-color: rgba(78, 205, 196, 0.6) !important;
    color: #4ecdc4 !important;
    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3) !important;
  }
  
  /* 评论表单 - 玻璃态设计 */
  .twikoo .twikoo-comment-form {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
    backdrop-filter: blur(25px) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 24px !important;
    padding: 35px !important;
    margin-bottom: 35px !important;
    position: relative !important;
    overflow: hidden !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  }
  
  .twikoo .twikoo-comment-form:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 12px 35px rgba(78, 205, 196, 0.25) !important;
    border-color: rgba(78, 205, 196, 0.3) !important;
  }
  
  .twikoo .twikoo-comment-form::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 2px !important;
    background: linear-gradient(90deg, #4ecdc4, #a78bff, #4ecdc4) !important;
    background-size: 200% 100% !important;
    animation: gradientMove 3s ease-in-out infinite !important;
  }
  
  .twikoo .twikoo-comment-form::after {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.05) 0%, rgba(167, 139, 255, 0.03) 100%) !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease !important;
    pointer-events: none !important;
  }
  
  .twikoo .twikoo-comment-form:hover::after {
    opacity: 1 !important;
  }
  
  /* 表单输入框 - 现代化设计 */
  .twikoo .twikoo-comment-form input,
  .twikoo .twikoo-comment-form textarea {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 12px !important;
    color: #333 !important;
    padding: 15px 18px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    font-size: 1rem !important;
    font-weight: 400 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  }
  
  .twikoo .twikoo-comment-form input:hover,
  .twikoo .twikoo-comment-form textarea:hover {
    box-shadow: 0 4px 15px rgba(78, 205, 196, 0.15) !important;
    border-color: rgba(78, 205, 196, 0.4) !important;
    transform: translateY(-1px) !important;
  }
  
  .twikoo .twikoo-comment-form input:focus,
  .twikoo .twikoo-comment-form textarea:focus {
    border-color: #4ecdc4 !important;
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.15), 0 6px 20px rgba(78, 205, 196, 0.2) !important;
    outline: none !important;
    transform: translateY(-2px) !important;
  }
  
  .twikoo .twikoo-comment-form input::placeholder,
  .twikoo .twikoo-comment-form textarea::placeholder {
    color: #a0a0a0 !important;
    font-weight: 400 !important;
  }

  /* ===== Twikoo 实际 DOM 适配（深色玻璃态，统一太空主题） ===== */
  #twikoo .tk-comments,
  #twikoo .tk-input {
    color: rgba(255, 255, 255, 0.92) !important;
  }

  /* 输入框：主评论框 + 昵称/邮箱/网址 */
  #twikoo .el-input__inner,
  #twikoo .el-textarea__inner {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.14) !important;
    border-radius: 12px !important;
    color: rgba(255, 255, 255, 0.92) !important;
    box-shadow: none !important;
    transition: all 0.3s ease !important;
    -webkit-text-fill-color: rgba(255, 255, 255, 0.92) !important;
  }

  #twikoo .el-input__inner::placeholder,
  #twikoo .el-textarea__inner::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  #twikoo .el-input__inner:hover,
  #twikoo .el-textarea__inner:hover {
    border-color: rgba(78, 205, 196, 0.45) !important;
    background: rgba(255, 255, 255, 0.07) !important;
  }

  #twikoo .el-input__inner:focus,
  #twikoo .el-textarea__inner:focus {
    border-color: #4ecdc4 !important;
    background: rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.15) !important;
    outline: none !important;
  }

  /* 输入框前置标签：昵称 / 邮箱 / 网址 */
  #twikoo .el-input-group__prepend {
    background: rgba(78, 205, 196, 0.12) !important;
    border: 1px solid rgba(78, 205, 196, 0.25) !important;
    border-right: none !important;
    border-radius: 12px 0 0 12px !important;
    color: rgba(135, 206, 235, 0.9) !important;
    box-shadow: none !important;
    font-weight: 500 !important;
  }

  #twikoo .el-input-group--prepend .el-input__inner {
    border-radius: 0 12px 12px 0 !important;
  }

  /* 元信息三栏间距 */
  #twikoo .tk-meta-input {
    gap: 12px !important;
  }

  /* 发送 / 提交按钮 */
  #twikoo .tk-send,
  #twikoo .el-button--primary {
    background: linear-gradient(135deg, #4ecdc4 0%, #a78bff 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    color: #06121f !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3) !important;
  }

  #twikoo .tk-send:hover,
  #twikoo .el-button--primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 22px rgba(78, 205, 196, 0.45) !important;
  }

  /* 评论列表项玻璃态 */
  #twikoo .tk-comment {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    padding: 18px 20px !important;
    backdrop-filter: blur(10px) !important;
    transition: all 0.35s ease !important;
  }

  #twikoo .tk-comment:hover {
    border-color: rgba(78, 205, 196, 0.3) !important;
    box-shadow: 0 10px 28px rgba(0, 0, 8, 0.4) !important;
  }

  #twikoo .tk-nick {
    color: #87ceeb !important;
    font-weight: 600 !important;
  }

  #twikoo .tk-content,
  #twikoo .tk-content p {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  #twikoo .tk-meta,
  #twikoo .tk-time,
  #twikoo .tk-extras,
  #twikoo .tk-extra {
    color: rgba(255, 255, 255, 0.45) !important;
  }

  #twikoo .tk-avatar {
    border-radius: 50% !important;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.25) !important;
  }

  #twikoo .tk-action-icon,
  #twikoo .tk-comments-count,
  #twikoo .tk-icon {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  /* 字数统计 / 提示文字 */
  #twikoo .tk-meta-input .el-input,
  #twikoo .tk-row {
    color: rgba(255, 255, 255, 0.7) !important;
  }
  
  /* 提交按钮 - 渐变按钮 */
  .twikoo .twikoo-comment-form .twikoo-submit {
    background: linear-gradient(135deg, #4ecdc4 0%, #a78bff 50%, #4ecdc4 100%) !important;
    background-size: 200% 200% !important;
    border: none !important;
    border-radius: 12px !important;
    color: white !important;
    padding: 15px 30px !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer !important;
    position: relative !important;
    overflow: hidden !important;
    animation: gradientShift 3s ease-in-out infinite !important;
    box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3) !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: -100% !important;
    width: 100% !important;
    height: 100% !important;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
    transition: left 0.5s ease !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 10px 30px rgba(78, 205, 196, 0.5) !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit:hover::before {
    left: 100% !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit:active {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4) !important;
  }
  
  /* 回复区域 - 优雅设计 */
  .twikoo .twikoo-reply {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(167, 139, 255, 0.08) 100%) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    margin-top: 20px !important;
    border-left: 4px solid #4ecdc4 !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(78, 205, 196, 0.2) !important;
  }
  
  /* 加载动画 - 现代化加载 */
  .twikoo .twikoo-loading {
    color: #4ecdc4 !important;
    text-align: center !important;
    padding: 40px 20px !important;
    font-size: 1.1rem !important;
    font-weight: 500 !important;
  }
  
  .twikoo .twikoo-loading::before {
    content: '⏳' !important;
    display: block !important;
    font-size: 2rem !important;
    margin-bottom: 15px !important;
    animation: spin 1s linear infinite !important;
  }
  
  /* 空状态 - 友好提示 */
  .twikoo .twikoo-empty {
    color: rgba(255, 255, 255, 0.8) !important;
    text-align: center !important;
    padding: 60px 20px !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
    border-radius: 20px !important;
    backdrop-filter: blur(15px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }
  
  .twikoo .twikoo-empty::before {
    content: '💭' !important;
    display: block !important;
    font-size: 3rem !important;
    margin-bottom: 20px !important;
    animation: float 3s ease-in-out infinite !important;
  }
  
  /* 动画定义 */
  @keyframes gradientMove {
    0%, 100% {
      background-position: 0% 50% !important;
    }
    50% {
      background-position: 100% 50% !important;
    }
  }
  
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50% !important;
    }
    50% {
      background-position: 100% 50% !important;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg) !important;
    }
    to {
      transform: rotate(360deg) !important;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) !important;
    }
    50% {
      transform: translateY(-10px) !important;
    }
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .twikoo .twikoo-comment {
      padding: 25px 20px !important;
      border-radius: 16px !important;
    }
    
    .twikoo .twikoo-comment-form {
      padding: 25px 20px !important;
      border-radius: 20px !important;
    }
    
    .twikoo .twikoo-comment .twikoo-actions {
      flex-wrap: wrap !important;
      gap: 8px !important;
    }
    
    .twikoo .twikoo-comment .twikoo-action {
      padding: 8px 12px !important;
      font-size: 0.85rem !important;
    }
  }
  
  /* 深色模式优化 */
  @media (prefers-color-scheme: dark) {
    .twikoo .twikoo-comment-form input,
    .twikoo .twikoo-comment-form textarea {
      background: rgba(255, 255, 255, 0.9) !important;
      color: #333 !important;
    }
  }
`;

// Twikoo 工具函数
export const twikooUtils = {
  // 初始化 Twikoo
  init: async (config = {}) => {
    try {
      // 检查是否已经加载了 Twikoo
      if (typeof window !== 'undefined' && window.twikoo) {
        if (typeof window.twikoo.init === 'function') {
          return window.twikoo.init(config);
        } else {
          throw new Error('Twikoo init 方法不存在');
        }
      }
      
      // 动态加载 Twikoo
      return new Promise((resolve, reject) => {
        // 检查是否已经存在脚本标签
        const existingScript = document.querySelector('script[src*="twikoo"]');
        if (existingScript) {
          const checkTwikoo = () => {
            if (window.twikoo && typeof window.twikoo.init === 'function') {
              try {
                const result = window.twikoo.init(config);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            } else {
              setTimeout(checkTwikoo, 100);
            }
          };
          checkTwikoo();
          return;
        }
        
        // 创建新的脚本标签
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js';
        script.async = true;
        
        script.onload = () => {
          setTimeout(() => {
            if (window.twikoo && typeof window.twikoo.init === 'function') {
              try {
                const result = window.twikoo.init(config);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error('Twikoo 加载失败或 init 方法不存在'));
            }
          }, 200);
        };
        
        script.onerror = () => {
          reject(new Error('Twikoo 脚本加载失败'));
        };
        
        document.head.appendChild(script);
      });
      
    } catch (error) {
      throw error;
    }
  },
  
  // 注入自定义样式
  injectStyles: (styles) => {
    const existingStyle = document.querySelector('style[data-twikoo-styles]');
    if (existingStyle) {
      return;
    }
    
    const style = document.createElement('style');
    style.setAttribute('data-twikoo-styles', 'true');
    style.textContent = styles;
    document.head.appendChild(style);
  }
};
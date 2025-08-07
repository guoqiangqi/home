// Twikoo 配置文件
export const twikooConfig = {
  // Twikoo 环境 ID
  envId: 'https://twikoo-one-brown-59.vercel.app',
  
  // 评论容器选择器
  el: '#twikoo',
  
  // 语言设置
  lang: 'zh-CN',
  
  // 当前页面路径
  path: window.location.pathname,
  
  // 评论框配置
  comment: {
    placeholder: '万水千山总是情，来句评论行不行？',
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
  /* Twikoo 自定义样式 */
  .twikoo-comments {
    background: transparent !important;
    padding: 0 !important;
  }
  
  /* 评论容器 */
  .twikoo .twikoo-comment {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%) !important;
    backdrop-filter: blur(15px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 16px !important;
    margin-bottom: 20px !important;
    padding: 25px !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease !important;
  }
  
  .twikoo .twikoo-comment:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2) !important;
  }
  
  /* 用户头像 */
  .twikoo .twikoo-comment .twikoo-avatar {
    border-radius: 50% !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
  }
  
  /* 用户名 */
  .twikoo .twikoo-comment .twikoo-nick {
    color: #667eea !important;
    font-weight: 600 !important;
  }
  
  /* 评论时间 */
  .twikoo .twikoo-comment .twikoo-time {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 0.85rem !important;
  }
  
  /* 评论内容 */
  .twikoo .twikoo-comment .twikoo-content {
    color: white !important;
    line-height: 1.6 !important;
    margin: 10px 0 !important;
  }
  
  /* 评论操作按钮 */
  .twikoo .twikoo-comment .twikoo-actions {
    margin-top: 15px !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 8px !important;
    color: white !important;
    padding: 8px 12px !important;
    transition: all 0.3s ease !important;
    margin-right: 10px !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action.liked {
    background: rgba(102, 126, 234, 0.3) !important;
    border-color: #667eea !important;
    color: #667eea !important;
  }
  
  /* 评论表单 */
  .twikoo .twikoo-comment-form {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
    backdrop-filter: blur(15px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 16px !important;
    padding: 25px !important;
    margin-bottom: 30px !important;
  }
  
  /* 表单输入框 */
  .twikoo .twikoo-comment-form input,
  .twikoo .twikoo-comment-form textarea {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 8px !important;
    color: #333 !important;
    padding: 12px !important;
    transition: all 0.3s ease !important;
  }
  
  .twikoo .twikoo-comment-form input:focus,
  .twikoo .twikoo-comment-form textarea:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1) !important;
    outline: none !important;
  }
  
  .twikoo .twikoo-comment-form input::placeholder,
  .twikoo .twikoo-comment-form textarea::placeholder {
    color: #c0c4cc !important;
  }
  
  /* 提交按钮 */
  .twikoo .twikoo-comment-form .twikoo-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    border-radius: 8px !important;
    color: white !important;
    padding: 12px 24px !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
  }
  
  /* 回复区域 */
  .twikoo .twikoo-reply {
    background: rgba(255, 255, 255, 0.05) !important;
    border-radius: 12px !important;
    padding: 15px !important;
    margin-top: 15px !important;
    border-left: 3px solid #667eea !important;
  }
  
  /* 加载动画 */
  .twikoo .twikoo-loading {
    color: #667eea !important;
    text-align: center !important;
    padding: 20px !important;
  }
  
  /* 空状态 */
  .twikoo .twikoo-empty {
    color: rgba(255, 255, 255, 0.8) !important;
    text-align: center !important;
    padding: 40px 20px !important;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .twikoo .twikoo-comment {
      padding: 20px !important;
    }
    
    .twikoo .twikoo-comment-form {
      padding: 20px !important;
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
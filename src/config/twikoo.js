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
    placeholder: '分享你的想法，让这里成为思想的交汇点...',
    maxLength: 500,
    showCount: true
  },
  
  // 用户信息配置
  user: {
    nickname: '昵称',
    email: '邮箱',
    website: '网址（选填）'
  },
  
  // 地点信息配置
  location: {
    enabled: true,
    showInComments: true,
    showInForm: true
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
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent) !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease !important;
  }
  
  .twikoo .twikoo-comment:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.25) !important;
    border-color: rgba(102, 126, 234, 0.3) !important;
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
    border-color: rgba(102, 126, 234, 0.5) !important;
    transform: scale(1.05) !important;
  }
  
  /* 用户名 - 渐变文字 */
  .twikoo .twikoo-comment .twikoo-nick {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
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
  
  /* 地点信息 - 现代化设计 */
  .twikoo .twikoo-comment .twikoo-location {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 0.8rem !important;
    font-weight: 400 !important;
    margin-left: 10px !important;
    padding: 4px 8px !important;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
    border-radius: 6px !important;
    backdrop-filter: blur(5px) !important;
    border: 1px solid rgba(102, 126, 234, 0.2) !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
  }
  
  .twikoo .twikoo-comment .twikoo-location:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.2) 100%) !important;
    border-color: rgba(102, 126, 234, 0.4) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2) !important;
  }
  
  /* 地点信息图标 */
  .twikoo .twikoo-comment .twikoo-location::before {
    content: '📍' !important;
    margin-right: 4px !important;
    font-size: 0.9em !important;
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
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%) !important;
    border-color: rgba(102, 126, 234, 0.4) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2) !important;
  }
  
  .twikoo .twikoo-comment .twikoo-action.liked {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.25) 100%) !important;
    border-color: rgba(102, 126, 234, 0.6) !important;
    color: #667eea !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
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
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.25) !important;
    border-color: rgba(102, 126, 234, 0.3) !important;
  }
  
  .twikoo .twikoo-comment-form::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 2px !important;
    background: linear-gradient(90deg, #667eea, #764ba2, #667eea) !important;
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
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%) !important;
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
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15) !important;
    border-color: rgba(102, 126, 234, 0.4) !important;
    transform: translateY(-1px) !important;
  }
  
  .twikoo .twikoo-comment-form input:focus,
  .twikoo .twikoo-comment-form textarea:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15), 0 6px 20px rgba(102, 126, 234, 0.2) !important;
    outline: none !important;
    transform: translateY(-2px) !important;
  }
  
  .twikoo .twikoo-comment-form input::placeholder,
  .twikoo .twikoo-comment-form textarea::placeholder {
    color: #a0a0a0 !important;
    font-weight: 400 !important;
  }
  
  /* 提交按钮 - 渐变按钮 */
  .twikoo .twikoo-comment-form .twikoo-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%) !important;
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
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
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
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5) !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit:hover::before {
    left: 100% !important;
  }
  
  .twikoo .twikoo-comment-form .twikoo-submit:active {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  }
  
  /* 回复区域 - 优雅设计 */
  .twikoo .twikoo-reply {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.08) 100%) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    margin-top: 20px !important;
    border-left: 4px solid #667eea !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(102, 126, 234, 0.2) !important;
  }
  
  /* 加载动画 - 现代化加载 */
  .twikoo .twikoo-loading {
    color: #667eea !important;
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
  },
  
  // 添加地点信息到评论
  addLocationToComments: async () => {
    try {
      const { getFormattedLocation } = await import('@/utils/location.js');
      const locationText = await getFormattedLocation();
      
      console.log('获取到地点信息:', locationText);
      
      // 查找所有可能的评论容器
      const selectors = [
        '.tk-comment',
        '.twikoo-comment',
        '.twikoo .tk-comment',
        '.twikoo .twikoo-comment',
        '[class*="comment"]'
      ];
      
      let comments = [];
      for (const selector of selectors) {
        comments = document.querySelectorAll(selector);
        if (comments.length > 0) {
          console.log(`使用选择器 "${selector}" 找到 ${comments.length} 个评论`);
          break;
        }
      }
      
      if (comments.length === 0) {
        console.log('未找到任何评论，尝试查找所有可能的评论元素...');
        // 查找所有可能包含评论的元素
        const allElements = document.querySelectorAll('*');
        comments = Array.from(allElements).filter(el => {
          const text = el.textContent || '';
          return text.includes('分钟前') || text.includes('小时前') || text.includes('天前');
        });
        console.log('通过文本内容找到可能的评论元素:', comments.length);
      }
      
      comments.forEach((comment, index) => {
        console.log(`处理第${index + 1}个评论:`, comment);
        
        // 检查是否已经有地点信息
        if (!comment.querySelector('.twikoo-location')) {
          // 尝试多种方式查找时间元素
          const timeSelectors = [
            '.tk-time',
            '.twikoo-time',
            '[class*="time"]',
            'span:contains("分钟前"), span:contains("小时前"), span:contains("天前")'
          ];
          
          let timeElement = null;
          for (const selector of timeSelectors) {
            timeElement = comment.querySelector(selector);
            if (timeElement) break;
          }
          
          // 如果没找到时间元素，尝试通过文本内容查找
          if (!timeElement) {
            const spans = comment.querySelectorAll('span');
            timeElement = Array.from(spans).find(span => {
              const text = span.textContent || '';
              return text.includes('分钟前') || text.includes('小时前') || text.includes('天前');
            });
          }
          
          if (timeElement) {
            console.log('找到时间元素:', timeElement);
            
            const locationElement = document.createElement('span');
            locationElement.className = 'twikoo-location';
            locationElement.textContent = locationText.replace('📍 ', '');
            locationElement.title = '点击查看详细位置';
            locationElement.style.cssText = `
              color: rgba(255, 255, 255, 0.7) !important;
              font-size: 0.8rem !important;
              font-weight: 400 !important;
              margin-left: 10px !important;
              padding: 4px 8px !important;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
              border-radius: 6px !important;
              backdrop-filter: blur(5px) !important;
              border: 1px solid rgba(102, 126, 234, 0.2) !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
            `;
            
            // 插入到时间元素后面
            timeElement.parentNode.insertBefore(locationElement, timeElement.nextSibling);
            console.log(`为第${index + 1}个评论添加地点信息:`, locationText);
          } else {
            console.log(`第${index + 1}个评论没有找到时间元素，尝试添加到评论末尾`);
            
            // 如果找不到时间元素，添加到评论末尾
            const locationElement = document.createElement('div');
            locationElement.className = 'twikoo-location';
            locationElement.textContent = locationText;
            locationElement.title = '点击查看详细位置';
            locationElement.style.cssText = `
              color: rgba(255, 255, 255, 0.7) !important;
              font-size: 0.8rem !important;
              font-weight: 400 !important;
              margin-top: 8px !important;
              padding: 4px 8px !important;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
              border-radius: 6px !important;
              backdrop-filter: blur(5px) !important;
              border: 1px solid rgba(102, 126, 234, 0.2) !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
              display: inline-block !important;
            `;
            
            comment.appendChild(locationElement);
            console.log(`为第${index + 1}个评论末尾添加地点信息:`, locationText);
          }
        } else {
          console.log(`第${index + 1}个评论已有地点信息`);
        }
      });
    } catch (error) {
      console.error('添加地点信息失败:', error);
    }
  },
  
  // 监听新评论并添加地点信息
  observeNewComments: () => {
    console.log('开始监听新评论...');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 检查新添加的节点是否是评论
            let newComments = [];
            
            // 检查节点本身是否是评论
            if (node.classList) {
              const isComment = node.classList.contains('tk-comment') || 
                               node.classList.contains('twikoo-comment') ||
                               node.textContent?.includes('分钟前') ||
                               node.textContent?.includes('小时前') ||
                               node.textContent?.includes('天前');
              if (isComment) {
                newComments.push(node);
              }
            }
            
            // 检查节点内的评论
            if (node.querySelectorAll) {
              const selectors = [
                '.tk-comment',
                '.twikoo-comment',
                '[class*="comment"]'
              ];
              
              for (const selector of selectors) {
                const foundComments = node.querySelectorAll(selector);
                if (foundComments.length > 0) {
                  newComments.push(...foundComments);
                  break;
                }
              }
              
              // 如果没找到，尝试通过文本内容查找
              if (newComments.length === 0) {
                const allElements = node.querySelectorAll('*');
                const commentElements = Array.from(allElements).filter(el => {
                  const text = el.textContent || '';
                  return text.includes('分钟前') || text.includes('小时前') || text.includes('天前');
                });
                newComments.push(...commentElements);
              }
            }
            
            newComments.forEach(async (comment) => {
              if (!comment.querySelector('.twikoo-location')) {
                try {
                  const { getFormattedLocation } = await import('@/utils/location.js');
                  const locationText = await getFormattedLocation();
                  
                  // 尝试多种方式查找时间元素
                  const timeSelectors = [
                    '.tk-time',
                    '.twikoo-time',
                    '[class*="time"]'
                  ];
                  
                  let timeElement = null;
                  for (const selector of timeSelectors) {
                    timeElement = comment.querySelector(selector);
                    if (timeElement) break;
                  }
                  
                  // 如果没找到时间元素，尝试通过文本内容查找
                  if (!timeElement) {
                    const spans = comment.querySelectorAll('span');
                    timeElement = Array.from(spans).find(span => {
                      const text = span.textContent || '';
                      return text.includes('分钟前') || text.includes('小时前') || text.includes('天前');
                    });
                  }
                  
                  if (timeElement) {
                    const locationElement = document.createElement('span');
                    locationElement.className = 'twikoo-location';
                    locationElement.textContent = locationText.replace('📍 ', '');
                    locationElement.title = '点击查看详细位置';
                    locationElement.style.cssText = `
                      color: rgba(255, 255, 255, 0.7) !important;
                      font-size: 0.8rem !important;
                      font-weight: 400 !important;
                      margin-left: 10px !important;
                      padding: 4px 8px !important;
                      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
                      border-radius: 6px !important;
                      backdrop-filter: blur(5px) !important;
                      border: 1px solid rgba(102, 126, 234, 0.2) !important;
                      transition: all 0.3s ease !important;
                      cursor: pointer !important;
                    `;
                    
                    timeElement.parentNode.insertBefore(locationElement, timeElement.nextSibling);
                    console.log('为新评论添加地点信息:', locationText);
                  } else {
                    // 如果找不到时间元素，添加到评论末尾
                    const locationElement = document.createElement('div');
                    locationElement.className = 'twikoo-location';
                    locationElement.textContent = locationText;
                    locationElement.title = '点击查看详细位置';
                    locationElement.style.cssText = `
                      color: rgba(255, 255, 255, 0.7) !important;
                      font-size: 0.8rem !important;
                      font-weight: 400 !important;
                      margin-top: 8px !important;
                      padding: 4px 8px !important;
                      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
                      border-radius: 6px !important;
                      backdrop-filter: blur(5px) !important;
                      border: 1px solid rgba(102, 126, 234, 0.2) !important;
                      transition: all 0.3s ease !important;
                      cursor: pointer !important;
                      display: inline-block !important;
                    `;
                    
                    comment.appendChild(locationElement);
                    console.log('为新评论末尾添加地点信息:', locationText);
                  }
                } catch (error) {
                  console.error('为新评论添加地点信息失败:', error);
                }
              }
            });
          }
        });
      });
    });
    
    const twikooContainer = document.getElementById('twikoo');
    if (twikooContainer) {
      observer.observe(twikooContainer, {
        childList: true,
        subtree: true
      });
      console.log('已开始监听twikoo容器变化');
    } else {
      console.error('未找到twikoo容器');
    }
    
    return observer;
  }
};
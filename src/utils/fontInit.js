// 字体初始化工具
export const initLogoFont = () => {
  // 从本地存储获取保存的字体
  const savedFont = localStorage.getItem('selected-logo-font')
  
  if (savedFont) {
    // 设置 CSS 变量
    document.documentElement.style.setProperty('--logo-font-family', savedFont)
    document.documentElement.style.setProperty('--logo-font-weight', '500')
  } else {
    // 默认字体
    document.documentElement.style.setProperty('--logo-font-family', 'Satisfy, cursive')
    document.documentElement.style.setProperty('--logo-font-weight', '500')
  }
}

// 设置字体
export const setLogoFont = (fontFamily) => {
  document.documentElement.style.setProperty('--logo-font-family', fontFamily)
  localStorage.setItem('selected-logo-font', fontFamily)
}

// 获取当前字体
export const getCurrentLogoFont = () => {
  return localStorage.getItem('selected-logo-font') || 'Satisfy, cursive'
}

// 重置为默认字体
export const resetToDefaultFont = () => {
  localStorage.removeItem('selected-logo-font')
  document.documentElement.style.setProperty('--logo-font-family', 'Satisfy, cursive')
  document.documentElement.style.setProperty('--logo-font-weight', '500')
} 
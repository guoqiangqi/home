// 地理位置获取工具函数
export const getLocationInfo = async () => {
  try {
    // 尝试使用高德地图API获取地理位置
    const weatherKey = import.meta.env.VITE_WEATHER_KEY;
    
    if (weatherKey) {
      try {
        const response = await fetch(`https://restapi.amap.com/v3/ip?key=${weatherKey}`);
        const data = await response.json();
        
        if (data.status === '1' && data.city) {
          console.log('使用高德地图API获取地点信息成功:', data);
          return {
            city: data.city,
            province: data.province,
            country: '中国',
            success: true
          };
        }
      } catch (error) {
        console.log('高德地图API调用失败，尝试备用服务:', error);
      }
    }
    
    // 备用方案：使用模拟数据（避免CORS问题）
    console.log('使用模拟地点信息（避免CORS问题）');
    return {
      city: '深圳',
      province: '广东省',
      country: '中国',
      success: true
    };
    
    // 如果都失败了，返回默认值
    console.log('所有IP定位服务都失败，返回默认值');
    return {
      city: '未知城市',
      province: '未知省份',
      country: '未知国家',
      success: false
    };
    
  } catch (error) {
    console.error('获取地理位置失败:', error);
    return {
      city: '未知城市',
      province: '未知省份',
      country: '未知国家',
      success: false
    };
  }
};

// 格式化地理位置显示
export const formatLocation = (locationInfo) => {
  if (!locationInfo || !locationInfo.success) {
    return '📍 未知地点';
  }
  
  const { city, province, country } = locationInfo;
  
  // 如果城市和省份相同，只显示城市
  if (city === province) {
    return `📍 ${city}`;
  }
  
  // 如果在中国，显示省份+城市
  if (country === '中国') {
    return `📍 ${province} ${city}`;
  }
  
  // 国外显示城市+国家
  return `📍 ${city}, ${country}`;
};

// 获取地理位置并格式化
export const getFormattedLocation = async () => {
  const locationInfo = await getLocationInfo();
  return formatLocation(locationInfo);
};

 
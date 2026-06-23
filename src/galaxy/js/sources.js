/**
 * 定义项目所需的静态资源列表。
 * Resources 类会根据 'type' 属性自动选择合适的加载器。
 *
 * 当前 Resources 已精简为仅支持实际使用的资源类型 (type):
 * - texture:     TextureLoader (普通图像纹理, 如 jpg, png)
 * - cubeTexture: CubeTextureLoader (立方体贴图, 用于环境映射等)
 * - video:       自定义加载逻辑，创建 VideoTexture (加载视频作为纹理)
 *
 * 如需 gltf/fbx/obj/hdr/exr/svg/ktx2/font 等类型，请在 resources.js 中按需引入
 * 对应加载器（避免默认打入大型 three 扩展拖累打包体积）。
 */
export default [
  {
    name: 'environmentMapTexture',
    type: 'cubeTexture',
    path: [
      'textures/environmentMap/px.jpg',
      'textures/environmentMap/nx.jpg',
      'textures/environmentMap/py.jpg',
      'textures/environmentMap/ny.jpg',
      'textures/environmentMap/pz.jpg',
      'textures/environmentMap/nz.jpg',
    ],
  },
  {
    name: 'starTexture',
    type: 'texture',
    path: 'textures/galaxy/1.png',
  },

  {
    name: 'starTexture2',
    type: 'texture',
    path: 'textures/galaxy/4.png',
  },
  {
    name: 'spaceTexture',
    type: 'texture',
    path: 'textures/galaxy/2k_stars_milky_way.jpg',
  },
  {
    name: 'earthTexture',
    type: 'texture',
    path: 'textures/galaxy/2k_earth_daymap.jpg',
  },
  {
    name: 'earthNormal',
    type: 'texture',
    path: 'textures/galaxy/2k_earth_normal_map.jpg',
  },
  {
    name: 'planetTexture',
    type: 'texture',
    path: 'textures/galaxy/2k_ceres_fictional.jpg',
  },
  {
    name: 'planetTexture2',
    type: 'texture',
    path: 'textures/galaxy/2k_eris_fictional.jpg',
  },
  {
    name: 'planetTexture3',
    type: 'texture',
    path: 'textures/galaxy/2k_venus_surface.jpg',
  },
  {
    name: 'planetNormal',
    type: 'texture',
    path: 'textures/galaxy/red_sand_nor_gl_1k.jpg',
  },
  {
    name: 'planetDisplacement',
    type: 'texture',
    path: 'textures/galaxy/red_sand_disp_1k.png',
  },
  {
    name: 'lensDirtTexture',
    type: 'texture',
    path: 'textures/lensflare/lensDirtTexture.jpg',
  },
]

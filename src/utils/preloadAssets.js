import sources from "@/galaxy/js/sources.js";

const TEXTURE_TYPES = new Set([
  "texture",
  "hdrTexture",
  "exrTexture",
  "ktx2Texture",
]);

function resolvePublicUrl(path) {
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/${path}`;
}

function getPersistedCoverType() {
  try {
    const raw = localStorage.getItem("data");
    if (!raw) return "0";
    return JSON.parse(raw).coverType ?? "0";
  } catch {
    return "0";
  }
}

export function getWallpaperPreloadUrl() {
  const coverType = getPersistedCoverType();
  if (coverType === "0") return "/images/background1.jpg";
  return null;
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function preloadFetch(url) {
  return fetch(url, { cache: "force-cache" }).then(
    () => true,
    () => false,
  );
}

function injectLinkPreload(url, as = "image") {
  if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

function collectTextureUrls() {
  const urls = new Set();

  for (const source of sources) {
    if (source.type === "cubeTexture") {
      source.path.forEach((p) => urls.add(resolvePublicUrl(p)));
      continue;
    }
    if (TEXTURE_TYPES.has(source.type)) {
      urls.add(resolvePublicUrl(source.path));
    }
  }

  return [...urls];
}

const PRIORITY_TEXTURES = [
  "textures/galaxy/2k_stars_milky_way.jpg",
  "textures/galaxy/2k_earth_daymap.jpg",
  "textures/galaxy/1.png",
  "textures/environmentMap/px.jpg",
  "textures/environmentMap/nx.jpg",
  "textures/environmentMap/py.jpg",
  "textures/environmentMap/ny.jpg",
  "textures/environmentMap/pz.jpg",
  "textures/environmentMap/nz.jpg",
].map(resolvePublicUrl);

/**
 * 在 Vue 挂载前尽早预加载太空页与壁纸资源，利用浏览器缓存加速后续 Three.js / img 请求。
 * 不改变任何展示时序，仅提前发起网络下载。
 */
export function preloadCriticalAssets() {
  const wallpaperUrl = getWallpaperPreloadUrl();
  if (wallpaperUrl) {
    injectLinkPreload(wallpaperUrl, "image");
    preloadImage(wallpaperUrl);
  }

  PRIORITY_TEXTURES.forEach((url) => {
    injectLinkPreload(url, "image");
    preloadImage(url);
  });

  preloadFetch("/draco/draco_wasm_wrapper.js");
  preloadFetch("/draco/draco_decoder.js");

  const allTextures = collectTextureUrls();
  const rest = allTextures.filter((url) => !PRIORITY_TEXTURES.includes(url));

  const scheduleIdle =
    window.requestIdleCallback ||
    ((cb) => setTimeout(cb, 120));

  scheduleIdle(() => {
    rest.forEach((url) => preloadImage(url));
  });
}

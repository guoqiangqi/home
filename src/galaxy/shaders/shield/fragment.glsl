uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // 菲涅尔边缘发光
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.5);

  // 六边形网格纹理（程序化）
  vec3 p = vPosition * 2.8;
  float hexX = p.x * 1.1547; // 2/sqrt(3)
  float hexY = p.y;
  float cx = floor(hexX + hexY * 0.5 + 0.5);
  float cy = floor(hexY + 0.5);
  float px_ = hexX - cx + hexY * 0.5 - cy * 0.5;
  float py_ = hexY - cy;
  float hexDist = max(abs(px_), max(abs(py_), abs(px_ + py_)));
  float grid = smoothstep(0.46, 0.50, hexDist);

  // 扫描线
  float scan = sin(p.y * 8.0 - uTime * 1.5) * 0.5 + 0.5;
  scan = pow(scan, 6.0) * 0.4;

  // 组合
  float alpha = (fresnel * 0.6 + grid * 0.25 + scan * 0.15) * uOpacity;
  alpha = clamp(alpha, 0.0, 0.85);

  vec3 color = uColor + vec3(1.0) * grid * 0.3;
  gl_FragColor = vec4(color, alpha);
}

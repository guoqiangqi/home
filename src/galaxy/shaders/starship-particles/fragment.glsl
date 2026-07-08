varying vec3 vColor;
varying float vAlpha;

void main() {
  // 软圆点
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;

  // 中心高光
  float core = 1.0 - smoothstep(0.0, 0.25, dist);
  float rim  = 1.0 - smoothstep(0.2, 0.5, dist);

  float alpha = rim * vAlpha;
  vec3 color = vColor + core * 0.6;

  gl_FragColor = vec4(color, alpha);
}

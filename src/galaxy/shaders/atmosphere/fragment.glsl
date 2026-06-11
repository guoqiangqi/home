// 大气层片段着色器
uniform vec3 uPointLightPosition;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;
uniform float uAtmosphereIntensity;
uniform float uAtmosphereThickness;
uniform float uTwilightStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 lightDirection = normalize(uPointLightPosition - vPosition);
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);

  float sunAngle = dot(normal, lightDirection);
  float viewAngle = max(dot(normal, viewDirection), 0.0);
  float atmosphereStrength = pow(viewAngle, uAtmosphereThickness) * uAtmosphereIntensity;

  vec3 atmosphereColor;
  const float twilightEdge = 0.07;

  if (sunAngle > twilightEdge) {
    atmosphereColor = uAtmosphereDayColor;
  } else if (sunAngle > -twilightEdge) {
    float twilightFactor = (sunAngle + twilightEdge) / (twilightEdge * 2.0);
    atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, twilightFactor);
    atmosphereStrength *= mix(0.24 * uTwilightStrength, 1.0, twilightFactor);
  } else {
    atmosphereColor = vec3(0.0);
    atmosphereStrength *= 0.06;
  }

  gl_FragColor = vec4(atmosphereColor, atmosphereStrength);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

#define PI 3.14159

uniform float uVisibleDepth;
uniform float uVisibleScale;
uniform float uGroundDepth;
uniform vec3 uMainColor;
uniform vec3 uSoftColor;
uniform sampler2D uGroundTexture;

varying vec2 vUv;
varying vec3 vNormal; 
varying vec3 vPosition; 
varying vec4 vTest; 


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 _uv, vec2 _mid, float _rotation){
    return vec2(
        cos(_rotation) * (_uv.x - _mid.x) + sin(_rotation) * (_uv.y - _mid.y) + _mid.x,
        cos(_rotation) * (_uv.y - _mid.y) - sin(_rotation) * (_uv.x - _mid.x) + _mid.y
    );
}

float getDepth(float value, float uVisibleScale){
    vec3 cameraDirection = normalize(vec3(0.0, 0.0, -5.0));
    vec3 normal = normalize(vPosition);
    float result = dot(normal, cameraDirection) * uVisibleScale + value;
    return clamp(result, 0.0, 1.0);
}

float averageColor(vec4 color){
    return clamp((color.x + color.y + color.z)/3.0, 0.0, 1.0);
}

float getEdgeDepth(){
    return getDepth(uVisibleDepth - 0.5, uVisibleScale);
}

float getGroundDepth(){
    return getDepth(uGroundDepth, uVisibleScale);
}

float getMeshDepth(){
    return getDepth(0.81, 0.6);
}


void main()
{
    vec4 textureColor = texture2D(uGroundTexture, vUv);
    vec3 mainColor = vec3(0.0);
    mainColor = mix(uMainColor, uSoftColor, getMeshDepth());
    
    // calculate cloud
    float groundStrength = clamp((averageColor(textureColor) - getGroundDepth()*2.0) * (1.0 - getMeshDepth()*1.2), 0.0, 1.0)*0.3;
    // float groundStrength = clamp(averageColor(textureColor), 0.0, 1.0)*0.3;
    
    mainColor = mix(mainColor, vec3(0.5, 0.8, 1.0), getEdgeDepth());
    mainColor = mix(vec3(1.0, 1.0, 1.0), mainColor, 1.0 - groundStrength);
    
    
    
    gl_FragColor = vec4(vec3(getEdgeDepth()), 1.0);
    // gl_FragColor = vec4(vec3(getMeshDepth()), 1);
}

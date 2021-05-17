
varying vec2 vUv;
varying vec3 vNormal; 
varying vec3 vPosition; 
varying vec4 vTest; 

void main()
{
    vUv = uv;
    vNormal = normal;
    vTest = projectionMatrix * vec4(1.0, 1.0, 1.0, 1.0);
    vPosition = vec3(projectionMatrix * modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
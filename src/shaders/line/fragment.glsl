uniform vec3 diffuse;
uniform float opacity;

#ifdef USE_DASH

uniform float dashSize;
uniform float dashOffset;
uniform float gapSize;

#endif

varying float vLineDistance;

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vUv;
varying float vCustomAlpha;

void main(){
    #include <clipping_planes_fragment>
    
    #ifdef USE_DASH
    
    if(vUv.y<-1.||vUv.y>1.)discard;// discard endcaps
    
    if(mod(vLineDistance+dashOffset,dashSize+gapSize)>dashSize)discard;// todo - FIX
    
    #endif
    
    float alpha=vCustomAlpha;
    
    #ifdef ALPHA_TO_COVERAGE
    
    // artifacts appear on some hardware if a derivative is taken within a conditional
    float a=vUv.x;
    float b=(vUv.y>0.)?vUv.y-1.:vUv.y+1.;
    float len2=a*a+b*b;
    float dlen=fwidth(len2);
    
    if(abs(vUv.y)>1.){
        
        alpha=1.-smoothstep(1.-dlen,1.+dlen,len2);
        
    }
    
    #else
    
    if(abs(vUv.y)>1.){
        
        float a=vUv.x;
        float b=(vUv.y>0.)?vUv.y-1.:vUv.y+1.;
        float len2=a*a+b*b;
        
        if(len2>1.)discard;
        
    }
    
    #endif
    
    vec4 diffuseColor=vec4(diffuse,alpha);
    #include <logdepthbuf_fragment>
    #include <color_fragment>
    
    gl_FragColor=vec4(diffuseColor.rgb, alpha);
    
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    
    // gl_FragColor = vec4(diffuseColor.rgb, vCustomAlpha);
}
uniform float size;
uniform float scale;
uniform float testAlpha;
uniform vec3 cameraPos;
uniform float cameraOffset;
uniform float jooner;

varying float vAlpha;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
float normalizeStep(float _value, float _min, float _max){
	return clamp((_value - _min)/(_max - _min), _min, _max);
}
float add(float _a, float _b){
	return _a + _b;
}
void main() {

	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

	// vec4 worldPosition = modelMatrix * vec4(position, 1.0);
	// vec4 projectPosition = projectionMatrix * viewMatrix * worldPosition;
	// float pointDistance = distance(cameraPos, worldPosition.xyz);
	// float nearestDistance = distance(cameraPos, vec3(0.)) - 1.;
	// float cameraDistance = clamp(pointDistance - nearestDistance + 0.4, 0., 1.);
	// float c = sqrt(2. * pow(nearestDistance, 2.));
	// float cameraDistance = normalizeStep(pointDistance - nearestDistance + 1.75, 0., c);

	vAlpha = 0.8;
}
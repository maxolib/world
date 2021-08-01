import * as THREE from "three";
import * as ThreeMath from '../modules/threejs-utils/math/ThreeMath.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import fragmentShader from '../shaders/line/fragment.glsl'
import vertexShader from '../shaders/line/vertex.glsl'
import ThreeHandler from "../modules/threejs-utils/handlers/threeHandler.js";

interface SignalPoints {
    start: THREE.Vector3
    mid1: THREE.Vector3
    mid2: THREE.Vector3
    end: THREE.Vector3
}
interface SignalLineParams{
    start: THREE.Vector3
    end: THREE.Vector3
	division?: number
    color?: number 
	startVisible?: number
	endVisible?: number
    idleDuration?: number
    animDuration?: number
    planeGeometry?: THREE.BufferGeometry
    planeMaterial?: THREE.Material
}
interface UniformNumber{
    value: number
}
export class SingalLine extends THREE.Mesh{
	mainPoints: SignalPoints
	points: THREE.Vector3[]
	division: number
    color: number
	startVisible: number
	endVisible: number
	startVisibleUniform: UniformNumber
	endVisibleUniform: UniformNumber
    idleDuration: number
    animDuration: number

    plane?: THREE.Mesh

	constructor(params: SignalLineParams){
		super()
		this.startVisible = params.startVisible ?? 0 
		this.endVisible = params.endVisible ?? 1
        this.startVisibleUniform = { value: this.startVisible }
        this.endVisibleUniform = { value: this.endVisible }
        this.idleDuration = params.idleDuration ?? 2
        this.animDuration = params.animDuration ?? 2
		this.division = params.division ?? 250
        this.color = params.color ?? 0xffffff
		this.mainPoints = this.createMainPoints(params.start, params.end)
		this.points = this.createPoints()
		this.geometry = this.createGeometry()
		this.material = this.createMaterial()
        if(params.planeGeometry && params.planeMaterial){
            this.plane = new THREE.Mesh(params.planeGeometry, params.planeMaterial);
            this.plane.position.set(params.end.x, params.end.y, params.end.z)
            this.plane.lookAt(params.end.multiplyScalar(2))
            this.plane.scale.set(0, 0, 0)

            this.add(this.plane)
        }
	}
	createMaterial(color?: number): LineMaterial{
        const material = new LineMaterial({
            color: color ?? this.color,
            linewidth: 0.0015,
            dashed: false,
            transparent: true,
            opacity: 1,
            alphaTest: 0.001,
            depthWrite: false,
        })
        material.onBeforeCompile = _shader => {
            _shader.uniforms.startVisible = this.startVisibleUniform
            _shader.uniforms.endVisible = this.endVisibleUniform
            _shader.vertexShader = vertexShader
            _shader.fragmentShader = fragmentShader
        }
        
		return material
	}
	setVisible(startVisible?: number, endVisible?: number){
		this.startVisible = startVisible ?? this.startVisible
		this.endVisible = endVisible ?? this.endVisible
        
        this.startVisibleUniform.value = this.startVisible
        this.endVisibleUniform.value = this.endVisible
	}
	createGeometry(points?: THREE.Vector3[], startVisible?: number, endVisible?: number,test?: any): LineGeometry{
        points = points ?? new THREE.CubicBezierCurve3(
            this.mainPoints.start,
            this.mainPoints.mid1,
            this.mainPoints.mid2,
            this.mainPoints.end,
        ).getPoints(this.division)
		startVisible = startVisible ?? this.startVisible
		endVisible = endVisible ?? this.endVisible
		
		
        const positions = [] 
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            positions.push(point.x, point.y, point.z)
        }
        
        const indexRatios = new Float32Array(this.division)
        const customCount = this.division
        for (let i = 0; i < customCount; i++) {
			var ratio = i/customCount
            indexRatios[i] = i / this.division
        }

        var geometry = new LineGeometry()
        geometry.setPositions(positions)

        var indexRatioInterleavedBuffer = new THREE.InstancedInterleavedBuffer(indexRatios, 1);
        geometry.setAttribute("indexRatio", new THREE.InterleavedBufferAttribute(indexRatioInterleavedBuffer, 1, 0))
        

		return geometry
	}
	createPoints(signalPoints?: SignalPoints, division?: number): THREE.Vector3[]{
		signalPoints = signalPoints ?? this.mainPoints
        return new THREE.CubicBezierCurve3(
            signalPoints.start,
            signalPoints.mid1,
            signalPoints.mid2,
            signalPoints.end,
        ).getPoints(division ?? this.division)
	}
    createMainPoints(startPoint: THREE.Vector3, endPoint: THREE.Vector3): SignalPoints {
        var startPoint = startPoint.clone()
        var endPoint = endPoint.clone()

        var midPoint = startPoint.clone().add(endPoint).divideScalar(2)

        var distance = (startPoint.distanceTo(endPoint))


        var mid1Point = ThreeMath
            .getNextPoint(startPoint, midPoint, startPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9)
        var mid2Point = ThreeMath
            .getNextPoint(endPoint, midPoint, endPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9)

        return {
            start: startPoint,
            end: endPoint,
            mid1: mid1Point,
            mid2: mid2Point,
        }
    }
    Dispose(){
        this.geometry?.dispose()
        var material = this.material as THREE.Material
        material?.dispose()
    }
    // -----------------------------------------------------------------
    RunAnimation(handler: ThreeHandler){
        // gsap example
        var timeline = handler.gsap.timeline({
            // repeat: -1,
            delay: Math.random() * 6,
        })
        this.setVisible(0, 0)
        var count = 0
        timeline.to(this,{
            endVisible: 1, 
            duration: this.animDuration, 
            onUpdate: () => {
                this.setVisible()
                count++
            },
        })
        if(this.plane){
            timeline.to(this.plane.scale, {
                'x': 1,
                'y': 1,
            })
        }
        timeline.to(this,{
            startVisible: 1, 
            duration: this.animDuration, 
            delay: this.idleDuration,
            onUpdate: () => {
                this.setVisible()
                count++
            },
            onComplete: () => {
                count = 0
                
            }
        })
        if(this.plane){
            timeline.to(this.plane.scale, {
                'x': 0,
                'y': 0,
                delay: -0.5,
            })
        }
        timeline.call(this.Dispose)
        return timeline
    }
}
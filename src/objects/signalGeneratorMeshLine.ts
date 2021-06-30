import * as THREE from 'three'
import { Uniform } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import ThreeHandler from '../utils/handlers/threeHandler'
import * as ThreeMath from '../utils/Math/ThreeMath.js'
import fragmentShader from '../shaders/line/fragment.glsl'
import vertexShader from '../shaders/line/vertex.glsl'
interface IUniform<T> {
    value: T
}
interface SignalPoint {
    startPoint: THREE.Vector3
    mid1Point: THREE.Vector3
    mid2Point: THREE.Vector3
    endPoint: THREE.Vector3
    height: number
}
interface SignalCurve {
    curve: THREE.Mesh
    geometry: THREE.BufferGeometry
    material: THREE.Material
    count: IUniform<number>
    progress: IUniform<number>
    points: THREE.Vector3[]
    currentIndex: IUniform<number>
    limitBeginPoint: IUniform<THREE.Vector3>
    limitLastPoint: IUniform<THREE.Vector3>
}
interface SignalPlane {
    startPlane: THREE.Mesh
    endPlane: THREE.Mesh
}
interface Signal extends SignalPoint, SignalCurve, SignalPlane {

}
interface SignalGeneratorParams {
    scene: THREE.Scene
    division?: number
    planeSize?: number
    lineWidth?: number
}

export default class SignalGenerator {
    textureLoader: THREE.TextureLoader
    dotTexture: THREE.Texture
    scene: THREE.Scene
    division: number
    planeSize: number
    lineWidth: number
    planeGeometry: THREE.PlaneGeometry
    planeMaterial: THREE.Material

    constructor(params: SignalGeneratorParams) {
        this.division = params.division || 50
        this.planeSize = params.planeSize || 0.02
        this.lineWidth = params.lineWidth || 0.003
        this.scene = params.scene
        this.textureLoader = new THREE.TextureLoader
        this.dotTexture = this.textureLoader.load('textures/lit/dot_256.jpg')
        this.planeGeometry = new THREE.PlaneGeometry(this.planeSize, this.planeSize, 20, 20)
        this.planeMaterial = new THREE.MeshBasicMaterial({
            color: '#DA00FF',
            alphaMap: this.dotTexture,
            transparent: true
        })
        console.log(this.lineWidth);


    }

    static addSignalToScene(signal: Signal, scene: THREE.Scene) {
        scene.add(signal.curve)
        scene.add(signal.startPlane)
        scene.add(signal.endPlane)
    }

    static addAxeHelper(signal: Signal, scene: THREE.Scene) {
        const startHelper = new THREE.AxesHelper(0.1)
        startHelper.position.set(signal.startPoint.x, signal.startPoint.y, signal.startPoint.z)
        scene.add(startHelper)
        const mid1Helper = new THREE.AxesHelper(0.1)
        mid1Helper.position.set(signal.mid1Point.x, signal.mid1Point.y, signal.mid1Point.z)
        scene.add(mid1Helper)
        const mid2Helper = new THREE.AxesHelper(0.1)
        mid2Helper.position.set(signal.mid2Point.x, signal.mid2Point.y, signal.mid2Point.z)
        scene.add(mid2Helper)
        const endHelper = new THREE.AxesHelper(0.1)
        endHelper.position.set(signal.endPoint.x, signal.endPoint.y, signal.endPoint.z)
        scene.add(endHelper)
    }

    createSignal(startPoint: THREE.Vector3, endPoint: THREE.Vector3): Signal {
        var signalPoint = this.createPoints(startPoint, endPoint)
        var signalCurve = this.createCurve(signalPoint)
        var signalPlane = this.createPlane(signalPoint)

        return { ...signalPoint, ...signalCurve, ...signalPlane }
    }
    createPoints(startPoint: THREE.Vector3, endPoint: THREE.Vector3): SignalPoint {
        var height = 0.5
        var startPoint = startPoint.clone()
        var endPoint = endPoint.clone()

        var midPoint = startPoint.clone().add(endPoint).divideScalar(2)

        var distance = (startPoint.distanceTo(endPoint))
        console.log(distance);


        var mid1Point = ThreeMath
            .getNextPoint(startPoint, midPoint, startPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9)
        var mid2Point = ThreeMath
            .getNextPoint(endPoint, midPoint, endPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9)

        return {
            startPoint,
            endPoint,
            mid1Point,
            mid2Point,
            height
        }
    }

    createCurve(signal: SignalPoint): SignalCurve {
        const points = new THREE.CubicBezierCurve3(
            signal.startPoint,
            signal.mid1Point,
            signal.mid2Point,
            signal.endPoint
        ).getPoints(this.division)
        const positions = []
        const colors = []
        const indexs = new Int32Array(points.length)
        const count = { value: 0 }
        const progress = { value: 0 }
        const limitBeginPoint = { value: points[0] }
        const limitLastPoint = { value: points[0] }
        const currentIndex = { value: 8 }
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            positions.push(point.x, point.y, point.z)
            colors.push(1, 0, 0)
            indexs[i] = i
        }
        console.log(indexs);
        
        const geometry = new LineGeometry()
        geometry.setPositions(positions)
        geometry.setColors(colors)
        geometry.setAttribute('indexx', new THREE.Int32BufferAttribute(indexs, 1))

        const material = this.getLineMaterial()
        material.uniforms.count = count
        material.uniforms.progress = progress
        material.uniforms.limitBeginPoint = limitBeginPoint
        material.uniforms.limitLastPoint = limitLastPoint
        material.uniforms.currentIndex = currentIndex
        material.needsUpdate = true
        console.log(material.defaultAttributeValues);
        console.log(12);

        var curve = new Line2(
            geometry,
            material
        )
        curve.computeLineDistances()
        curve.scale.set(1, 1, 1)
        return {
            curve,
            geometry,
            points,
            count,
            progress,
            material,
            limitBeginPoint,
            limitLastPoint,
            currentIndex,
        }
    }

    createPlane(signalPoints: SignalPoint) {
        var startPlane = new THREE.Mesh(
            this.planeGeometry,
            this.planeMaterial
        )
        startPlane.position.set(signalPoints.startPoint.x, 0, 0)
        startPlane.rotateX(- Math.PI / 2)

        var endPlane = new THREE.Mesh(
            this.planeGeometry,
            this.planeMaterial
        )
        endPlane.position.set(signalPoints.endPoint.x, 0, 0)
        endPlane.rotateX(- Math.PI / 2)
        return {
            startPlane,
            endPlane
        }
    }

    getLineMaterial() {
        const material = new LineMaterial({
            linewidth: this.lineWidth,
            vertexColors: true,
            dashed: false,
            alphaToCoverage: true,
            transparent: true,
        })
        material.onBeforeCompile = shader => {

            shader.vertexShader = vertexShader



            shader.fragmentShader = fragmentShader
        }


        return material
    }
}
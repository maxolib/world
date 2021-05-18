import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

interface SignalPoint{
    startPoint: THREE.Vector3
    mid1Point: THREE.Vector3
    mid2Point: THREE.Vector3
    endPoint: THREE.Vector3
}
interface SignalCurve{
    curve: Line2
}
interface SignalPlane{
    startPlane: THREE.Mesh
    endPlane: THREE.Mesh
}
interface Signal extends SignalPoint, SignalCurve, SignalPlane{

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
    lineMaterial: LineMaterial
    scene: THREE.Scene
    division: number
    planeSize: number
    lineWidth: number
    planeGeometry: THREE.PlaneGeometry
    planeMaterial: THREE.MeshBasicMaterial

    constructor(params: SignalGeneratorParams) {
        this.division = params.division || 100
        this.planeSize = params.planeSize || 0.02
        this.lineWidth = params.lineWidth || 0.003
        this.scene = params.scene
        this.textureLoader = new THREE.TextureLoader
        this.lineMaterial = new LineMaterial({
            linewidth: 0.005,
            vertexColors: true,
            dashed: false,
            alphaToCoverage: true,
            transparent: true,
            opacity: 0.2,
        })
        this.dotTexture = this.textureLoader.load('textures/lit/dot_256.jpg')
        this.planeGeometry = new THREE.PlaneGeometry(this.planeSize, this.planeSize, 20, 20)
        this.planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            alphaMap: this.dotTexture,
            transparent: true
        })

    }

    static addSignalToScene(signal: Signal, scene: THREE.Scene){
        scene.add(signal.curve)
        scene.add(signal.startPlane)
        scene.add(signal.endPlane)
    }

    createSignal(startPoint: THREE.Vector3, endPoint: THREE.Vector3): Signal {
        var signalPoint = this.createPoints(startPoint, endPoint)
        var signalCurve = this.createCurve(signalPoint)
        var signalPlane = this.createPlane(signalPoint)

        return {...signalPoint, ...signalCurve, ...signalPlane}
    }
    createPoints(startPoint: THREE.Vector3, endPoint: THREE.Vector3): SignalPoint{
        var startPoint = startPoint.clone()
        var endPoint = endPoint.clone()
        
        var midPoint = startPoint.clone().add(endPoint).divideScalar(2)

        var mid1Point = midPoint.clone()
        mid1Point.y += 1
        var mid2Point = midPoint.clone()
        mid2Point.y += 1
        return {
            startPoint,
            endPoint,
            mid1Point,
            mid2Point
        }
    }
    createCurve(signal: SignalPoint): SignalCurve{
        const points = new THREE.CubicBezierCurve3(
            signal.startPoint, 
            signal.mid1Point, 
            signal.mid2Point, 
            signal.endPoint
        ).getPoints(this.division)
        const positions = []
        const colors = []
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            positions.push(point.x, point.y, point.z)
            colors.push(1, 0, 0)
        }
        const lineGeometry = new LineGeometry()
        lineGeometry.setPositions(positions)
        lineGeometry.setColors(colors)
        var curve = new Line2(
            lineGeometry,
            this.lineMaterial
        )
        curve.computeLineDistances()
        curve.scale.set(1, 1, 1)
        return { curve }
    }

    createPlane(signalPoints: SignalPoint){
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
}
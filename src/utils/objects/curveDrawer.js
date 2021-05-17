import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

export default () => {
    const start = new THREE.Vector3(-2, 0, 0)
    const mid1 = new THREE.Vector3(-1, 2, 0)
    const mid2 = new THREE.Vector3(1, 2, 0)
    const end = new THREE.Vector3(2, 0, 0)
    const curve1 = new THREE.CubicBezierCurve3(start, mid1, mid2, end)
    const points = curve1.getPoints(50)
    const geometry = new LineGeometry().setFromPoints(points)
    const material = new LineMaterial({
        color: 0xff00ff,
        linewidth: 5,
    })
    const curveLine = new Line2(geometry, material);
    curveLine.computeLineDistances()
    scene.add(curveLine)
    gui.add(material, 'linewidth', 1, 100, 1).onChange(() => {
        material.needsUpdate = true
    })
}
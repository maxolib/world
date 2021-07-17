import * as THREE from 'three'

export function getMiddlePoint(point1: THREE.Vector3, point2: THREE.Vector3){
    return point1.clone().add(point2).divideScalar(2)
}

export function getNextPoint(point1: THREE.Vector3, point2: THREE.Vector3, length: number){
    return point1.clone().add(point2.clone().sub(point1).normalize().multiplyScalar(length))
}

export function getCrossPoint(point1: THREE.Vector3, point2: THREE.Vector3){
    var midPoint = getMiddlePoint(point1, point2)
    return point1.clone().add(midPoint)
}
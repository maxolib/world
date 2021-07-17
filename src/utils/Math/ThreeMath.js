"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrossPoint = exports.getNextPoint = exports.getMiddlePoint = void 0;
function getMiddlePoint(point1, point2) {
    return point1.clone().add(point2).divideScalar(2);
}
exports.getMiddlePoint = getMiddlePoint;
function getNextPoint(point1, point2, length) {
    return point1.clone().add(point2.clone().sub(point1).normalize().multiplyScalar(length));
}
exports.getNextPoint = getNextPoint;
function getCrossPoint(point1, point2) {
    var midPoint = getMiddlePoint(point1, point2);
    return point1.clone().add(midPoint);
}
exports.getCrossPoint = getCrossPoint;

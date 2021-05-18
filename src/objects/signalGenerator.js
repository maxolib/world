"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var Line2_js_1 = require("three/examples/jsm/lines/Line2.js");
var LineGeometry_js_1 = require("three/examples/jsm/lines/LineGeometry.js");
var LineMaterial_js_1 = require("three/examples/jsm/lines/LineMaterial.js");
var SignalGenerator = /** @class */ (function () {
    function SignalGenerator(params) {
        this.division = params.division || 100;
        this.planeSize = params.planeSize || 0.02;
        this.lineWidth = params.lineWidth || 0.003;
        this.scene = params.scene;
        this.textureLoader = new THREE.TextureLoader;
        this.lineMaterial = new LineMaterial_js_1.LineMaterial({
            linewidth: 0.005,
            vertexColors: true,
            dashed: false,
            alphaToCoverage: true,
            transparent: true,
            opacity: 0.2,
        });
        this.dotTexture = this.textureLoader.load('textures/lit/dot_256.jpg');
        this.planeGeometry = new THREE.PlaneGeometry(this.planeSize, this.planeSize, 20, 20);
        this.planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            alphaMap: this.dotTexture,
            transparent: true
        });
    }
    SignalGenerator.addSignalToScene = function (signal, scene) {
        scene.add(signal.curve);
        scene.add(signal.startPlane);
        scene.add(signal.endPlane);
    };
    SignalGenerator.prototype.createSignal = function (startPoint, endPoint) {
        var signalPoint = this.createPoints(startPoint, endPoint);
        var signalCurve = this.createCurve(signalPoint);
        var signalPlane = this.createPlane(signalPoint);
        return __assign(__assign(__assign({}, signalPoint), signalCurve), signalPlane);
    };
    SignalGenerator.prototype.createPoints = function (startPoint, endPoint) {
        var startPoint = startPoint.clone();
        var endPoint = endPoint.clone();
        var midPoint = startPoint.clone().add(endPoint).divideScalar(2);
        var mid1Point = midPoint.clone();
        mid1Point.y += 1;
        var mid2Point = midPoint.clone();
        mid2Point.y += 1;
        return {
            startPoint: startPoint,
            endPoint: endPoint,
            mid1Point: mid1Point,
            mid2Point: mid2Point
        };
    };
    SignalGenerator.prototype.createCurve = function (signal) {
        var points = new THREE.CubicBezierCurve3(signal.startPoint, signal.mid1Point, signal.mid2Point, signal.endPoint).getPoints(this.division);
        var positions = [];
        var colors = [];
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            positions.push(point.x, point.y, point.z);
            colors.push(1, 0, 0);
        }
        var lineGeometry = new LineGeometry_js_1.LineGeometry();
        lineGeometry.setPositions(positions);
        lineGeometry.setColors(colors);
        var curve = new Line2_js_1.Line2(lineGeometry, this.lineMaterial);
        curve.computeLineDistances();
        curve.scale.set(1, 1, 1);
        return { curve: curve };
    };
    SignalGenerator.prototype.createPlane = function (signalPoints) {
        var startPlane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
        startPlane.position.set(signalPoints.startPoint.x, 0, 0);
        startPlane.rotateX(-Math.PI / 2);
        var endPlane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
        endPlane.position.set(signalPoints.endPoint.x, 0, 0);
        endPlane.rotateX(-Math.PI / 2);
        return {
            startPlane: startPlane,
            endPlane: endPlane
        };
    };
    return SignalGenerator;
}());
exports.default = SignalGenerator;

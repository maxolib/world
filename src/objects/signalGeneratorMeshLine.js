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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var ThreeMath = __importStar(require("../utils/Math/ThreeMath.js"));
var AnimatedMeshLine_js_1 = __importDefault(require("../utils/thirdParty/animateline/objects/AnimatedMeshLine.js"));
var SignalGenerator = /** @class */ (function () {
    function SignalGenerator(params) {
        this.division = params.division || 50;
        this.planeSize = params.planeSize || 0.02;
        this.lineWidth = params.lineWidth || 0.003;
        this.scene = params.scene;
        this.textureLoader = new THREE.TextureLoader;
        this.dotTexture = this.textureLoader.load('textures/lit/dot_256.jpg');
        this.planeGeometry = new THREE.PlaneGeometry(this.planeSize, this.planeSize, 20, 20);
        this.planeMaterial = new THREE.MeshBasicMaterial({
            color: '#DA00FF',
            alphaMap: this.dotTexture,
            transparent: true
        });
        console.log(this.lineWidth);
    }
    SignalGenerator.addSignalToScene = function (signal, scene) {
        scene.add(signal.curve);
        scene.add(signal.startPlane);
        scene.add(signal.endPlane);
    };
    SignalGenerator.addAxeHelper = function (signal, scene) {
        var startHelper = new THREE.AxesHelper(0.1);
        startHelper.position.set(signal.startPoint.x, signal.startPoint.y, signal.startPoint.z);
        scene.add(startHelper);
        var mid1Helper = new THREE.AxesHelper(0.1);
        mid1Helper.position.set(signal.mid1Point.x, signal.mid1Point.y, signal.mid1Point.z);
        scene.add(mid1Helper);
        var mid2Helper = new THREE.AxesHelper(0.1);
        mid2Helper.position.set(signal.mid2Point.x, signal.mid2Point.y, signal.mid2Point.z);
        scene.add(mid2Helper);
        var endHelper = new THREE.AxesHelper(0.1);
        endHelper.position.set(signal.endPoint.x, signal.endPoint.y, signal.endPoint.z);
        scene.add(endHelper);
    };
    SignalGenerator.prototype.createSignal = function (startPoint, endPoint) {
        var signalPoint = this.createPoints(startPoint, endPoint);
        var signalCurve = this.createCurve(signalPoint);
        var signalPlane = this.createPlane(signalPoint);
        return __assign(__assign(__assign({}, signalPoint), signalCurve), signalPlane);
    };
    SignalGenerator.prototype.createPoints = function (startPoint, endPoint) {
        var height = 0.5;
        var startPoint = startPoint.clone();
        var endPoint = endPoint.clone();
        var midPoint = startPoint.clone().add(endPoint).divideScalar(2);
        var distance = (startPoint.distanceTo(endPoint));
        console.log(distance);
        var mid1Point = ThreeMath
            .getNextPoint(startPoint, midPoint, startPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9);
        var mid2Point = ThreeMath
            .getNextPoint(endPoint, midPoint, endPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9);
        return {
            startPoint: startPoint,
            endPoint: endPoint,
            mid1Point: mid1Point,
            mid2Point: mid2Point,
            height: height
        };
    };
    SignalGenerator.prototype.createCurve = function (signal) {
        var points = new THREE.CubicBezierCurve3(signal.startPoint, signal.mid1Point, signal.mid2Point, signal.endPoint).getPoints(this.division);
        // const geometry = new THREE.BufferGeometry();
        // geometry.setFromPoints(points)
        // const line = new MeshLine()
        // line.setGeometry(geometry)
        // const material = new MeshLineMaterial({
        //     color: new THREE.Color("#ff00ff"),
        //     opacity: 1,
        //     lineWidth: 100,
        //     dashArray: 0.5,
        //     dashOffset: 0.5,
        //     deshRatio: 0.5,
        // });
        // var curve = new THREE.Line(line._geometry, material)
        var AnimatedMeshLine = new AnimatedMeshLine_js_1.default({});
        return {
            curve: curve,
            geometry: geometry,
            points: points,
            material: material,
        };
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

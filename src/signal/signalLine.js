"use strict";
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
exports.SingalLine = void 0;
const THREE = __importStar(require("three"));
const ThreeMath = __importStar(require("../modules/threejs-utils/math/ThreeMath.js"));
const LineGeometry_js_1 = require("three/examples/jsm/lines/LineGeometry.js");
const LineMaterial_js_1 = require("three/examples/jsm/lines/LineMaterial.js");
const fragment_glsl_1 = __importDefault(require("../shaders/line/fragment.glsl"));
const vertex_glsl_1 = __importDefault(require("../shaders/line/vertex.glsl"));
class SingalLine extends THREE.Mesh {
    constructor(params) {
        var _a, _b, _c, _d, _e, _f;
        super();
        this.startVisible = (_a = params.startVisible) !== null && _a !== void 0 ? _a : 0;
        this.endVisible = (_b = params.endVisible) !== null && _b !== void 0 ? _b : 1;
        this.startVisibleUniform = { value: this.startVisible };
        this.endVisibleUniform = { value: this.endVisible };
        this.idleDuration = (_c = params.idleDuration) !== null && _c !== void 0 ? _c : 2;
        this.animDuration = (_d = params.animDuration) !== null && _d !== void 0 ? _d : 2;
        this.division = (_e = params.division) !== null && _e !== void 0 ? _e : 250;
        this.color = (_f = params.color) !== null && _f !== void 0 ? _f : 0xffffff;
        this.mainPoints = this.createMainPoints(params.start, params.end);
        this.points = this.createPoints();
        this.geometry = this.createGeometry();
        this.material = this.createMaterial();
        if (params.planeGeometry && params.planeMaterial) {
            this.plane = new THREE.Mesh(params.planeGeometry, params.planeMaterial);
            this.plane.position.set(params.end.x, params.end.y, params.end.z);
            this.plane.lookAt(params.end.multiplyScalar(2));
            this.plane.scale.set(0, 0, 0);
            this.add(this.plane);
        }
    }
    createMaterial(color) {
        const material = new LineMaterial_js_1.LineMaterial({
            color: color !== null && color !== void 0 ? color : this.color,
            linewidth: 0.0015,
            dashed: false,
            transparent: true,
            opacity: 1,
            alphaTest: 0.001,
            depthWrite: false,
        });
        material.onBeforeCompile = _shader => {
            _shader.uniforms.startVisible = this.startVisibleUniform;
            _shader.uniforms.endVisible = this.endVisibleUniform;
            _shader.vertexShader = vertex_glsl_1.default;
            _shader.fragmentShader = fragment_glsl_1.default;
        };
        return material;
    }
    setVisible(startVisible, endVisible) {
        this.startVisible = startVisible !== null && startVisible !== void 0 ? startVisible : this.startVisible;
        this.endVisible = endVisible !== null && endVisible !== void 0 ? endVisible : this.endVisible;
        this.startVisibleUniform.value = this.startVisible;
        this.endVisibleUniform.value = this.endVisible;
    }
    createGeometry(points, startVisible, endVisible, test) {
        points = points !== null && points !== void 0 ? points : new THREE.CubicBezierCurve3(this.mainPoints.start, this.mainPoints.mid1, this.mainPoints.mid2, this.mainPoints.end).getPoints(this.division);
        startVisible = startVisible !== null && startVisible !== void 0 ? startVisible : this.startVisible;
        endVisible = endVisible !== null && endVisible !== void 0 ? endVisible : this.endVisible;
        const positions = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            positions.push(point.x, point.y, point.z);
        }
        const indexRatios = new Float32Array(this.division);
        const customCount = this.division;
        for (let i = 0; i < customCount; i++) {
            var ratio = i / customCount;
            indexRatios[i] = i / this.division;
        }
        var geometry = new LineGeometry_js_1.LineGeometry();
        geometry.setPositions(positions);
        var indexRatioInterleavedBuffer = new THREE.InstancedInterleavedBuffer(indexRatios, 1);
        geometry.setAttribute("indexRatio", new THREE.InterleavedBufferAttribute(indexRatioInterleavedBuffer, 1, 0));
        return geometry;
    }
    createPoints(signalPoints, division) {
        signalPoints = signalPoints !== null && signalPoints !== void 0 ? signalPoints : this.mainPoints;
        return new THREE.CubicBezierCurve3(signalPoints.start, signalPoints.mid1, signalPoints.mid2, signalPoints.end).getPoints(division !== null && division !== void 0 ? division : this.division);
    }
    createMainPoints(startPoint, endPoint) {
        var startPoint = startPoint.clone();
        var endPoint = endPoint.clone();
        var midPoint = startPoint.clone().add(endPoint).divideScalar(2);
        var distance = (startPoint.distanceTo(endPoint));
        var mid1Point = ThreeMath
            .getNextPoint(startPoint, midPoint, startPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9);
        var mid2Point = ThreeMath
            .getNextPoint(endPoint, midPoint, endPoint.distanceTo(midPoint) * 0.6)
            .normalize()
            .multiplyScalar(distance / 2 + 0.9);
        return {
            start: startPoint,
            end: endPoint,
            mid1: mid1Point,
            mid2: mid2Point,
        };
    }
    Dispose() {
        var _a;
        (_a = this.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
        var material = this.material;
        material === null || material === void 0 ? void 0 : material.dispose();
    }
    // -----------------------------------------------------------------
    RunAnimation(handler) {
        // gsap example
        var timeline = handler.gsap.timeline({
            // repeat: -1,
            delay: Math.random() * 6,
        });
        this.setVisible(0, 0);
        var count = 0;
        timeline.to(this, {
            endVisible: 1,
            duration: this.animDuration,
            onUpdate: () => {
                this.setVisible();
                count++;
            },
        });
        if (this.plane) {
            timeline.to(this.plane.scale, {
                'x': 1,
                'y': 1,
            });
        }
        timeline.to(this, {
            startVisible: 1,
            duration: this.animDuration,
            delay: this.idleDuration,
            onUpdate: () => {
                this.setVisible();
                count++;
            },
            onComplete: () => {
                count = 0;
            }
        });
        if (this.plane) {
            timeline.to(this.plane.scale, {
                'x': 0,
                'y': 0,
                delay: -0.5,
            });
        }
        timeline.call(this.Dispose);
        return timeline;
    }
}
exports.SingalLine = SingalLine;

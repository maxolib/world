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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalGenerator = void 0;
const THREE = __importStar(require("three"));
const signalLine_1 = require("./signalLine");
class SignalGenerator {
    constructor(params) {
        var _a, _b, _c;
        this.parant = params.parant;
        this.maxCount = params.maxCount;
        this.spawnRate = params.spawnRate;
        this.color = (_a = params.color) !== null && _a !== void 0 ? _a : 0xffffff;
        this.idleDuration = (_b = params.idleDuration) !== null && _b !== void 0 ? _b : 2;
        this.animDuration = (_c = params.animDuration) !== null && _c !== void 0 ? _c : 2;
        this.isPlay = true;
        this.handler = params.handler;
        this.gsap = params.handler.gsap;
        this.points = this.getPointsFromTarget(params.target);
        this.signals = [];
        this.score = 0;
        this.lastTime = 0;
        this.planeGeometry = params.planeGeometry;
        this.planeMaterial = params.planeMaterial;
        this.gsap.to(this, {
            repeat: -1,
            onUpdate: () => {
                if (!this.isPlay)
                    return;
                var deltaTime = this.gsap.ticker.time - this.lastTime;
                this.score += this.spawnRate * deltaTime;
                if (this.score > 1) {
                    this.score--;
                    this.Spawn();
                }
                this.lastTime = this.gsap.ticker.time;
            },
        });
    }
    Spawn(start, end) {
        if (this.signals.length > this.maxCount)
            return;
        // init
        start = start !== null && start !== void 0 ? start : this.points[Math.floor(Math.random() * this.points.length)];
        end = end !== null && end !== void 0 ? end : this.points[Math.floor(Math.random() * this.points.length)];
        // Respawn far points
        var distance = start.distanceTo(end);
        var distanceStart = start.distanceTo(new THREE.Vector3(0));
        var distanceEnd = start.distanceTo(new THREE.Vector3(0));
        if (distance > 1.5 ||
            distance < 0.2 ||
            start.x > 1.1 ||
            distanceStart > 1.1 ||
            distanceEnd > 1.1) {
            this.Spawn();
            return;
        }
        var signal = new signalLine_1.SingalLine({
            start: start,
            end: end,
            color: this.color,
            planeGeometry: this.planeGeometry,
            planeMaterial: this.planeMaterial
        });
        this.signals.push(signal);
        this.parant.add(signal);
        var timeline = signal.RunAnimation(this.handler);
        timeline.call(() => {
            this.signals = this.signals.filter((_item) => {
                return _item != signal;
            });
            this.parant.remove(signal);
        });
    }
    getPointsFromTarget(target) {
        var points = [];
        var array;
        if (target instanceof THREE.Mesh) {
            array = target.geometry.attributes.position.array;
            for (let i = 0; i < array.length / 3; i++) {
                var x = array[(i * 3) + 0];
                var y = array[(i * 3) + 1];
                var z = array[(i * 3) + 2];
                points.push(new THREE.Vector3(x, y, z));
            }
        }
        else if (target instanceof THREE.BufferGeometry) {
            var array = target.attributes.position.array;
            for (let i = 0; i < array.length / 3; i++) {
                var x = array[(i * 3) + 0];
                var y = array[(i * 3) + 1];
                var z = array[(i * 3) + 2];
                points.push(new THREE.Vector3(x, y, z));
            }
        }
        else {
            return target;
        }
        return points;
    }
    start() {
        this.isPlay = true;
    }
    stop() {
        this.isPlay = false;
    }
}
exports.SignalGenerator = SignalGenerator;

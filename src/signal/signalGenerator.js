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
exports.SignalGenerator = void 0;
const all_1 = __importDefault(require("gsap/all"));
const THREE = __importStar(require("three"));
const signalLine_1 = require("./signalLine");
class SignalGenerator {
    constructor(params) {
        var _a, _b, _c;
        this.maxCount = params.maxCount;
        this.spawnRate = params.spawnRate;
        this.color = (_a = params.color) !== null && _a !== void 0 ? _a : 0xffffff;
        this.idleDuration = (_b = params.idleDuration) !== null && _b !== void 0 ? _b : 2;
        this.animDuration = (_c = params.animDuration) !== null && _c !== void 0 ? _c : 2;
        this.isPlay = false;
        this.handler = params.handler;
        this.gsap = params.handler.gsap;
        this.points = this.getPointsFromTarget(params.target);
        this.signals = [];
        all_1.default.to(this, {
            repeat: -1,
            onUpdate: () => {
                if (false)
                    this.Spawn();
            },
        });
    }
    Spawn() {
        if (this.signals.length > this.maxCount)
            return;
        var signal = new signalLine_1.SingalLine({
            start: this.points[Math.floor(Math.random() * this.points.length)],
            end: this.points[Math.floor(Math.random() * this.points.length)],
            color: 0xaaaaff
        });
        this.signals.push(signal);
        var timeline = signal.RunAnimation(this.handler);
        timeline.call(() => {
            this.signals.filter((_item) => { return _item != signal; });
        });
    }
    getPointsFromTarget(target) {
        var points = [];
        if (target instanceof THREE.Mesh) {
            // TO DO
        }
        else if (target instanceof THREE.BufferGeometry) {
            // TO DO
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

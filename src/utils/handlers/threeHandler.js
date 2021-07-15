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
const THREE = __importStar(require("three"));
const events_1 = __importDefault(require("events"));
const stats_js_1 = __importDefault(require("stats.js"));
const dat = __importStar(require("dat.gui"));
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
const gsap_1 = __importDefault(require("gsap"));
class ThreeHandler {
    constructor(params) {
        var _a;
        this.emitter = new events_1.default.EventEmitter();
        this.canvas = params.canvas;
        this.scene = params.scene || new THREE.Scene();
        this.renderer = params.renderer || new THREE.WebGLRenderer({
            antialias: params.antialias
        });
        this.sizes = { width: window.innerWidth, height: window.innerHeight };
        this.camera = (_a = params.camera) !== null && _a !== void 0 ? _a : new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100);
        this.orbitControls = params.enableOrbitControls ? new OrbitControls_1.OrbitControls(this.camera, this.canvas) : null;
        this.clock = new THREE.Clock();
        this.prevElapsedTime = 0;
        this.elapsedTime = 0;
        this.deltaTime = 0;
        this.stats = params.enableStats ? new stats_js_1.default() : null;
        this.gui = params.enableGUI ? new dat.GUI() : null;
        gsap_1.default.ticker.add(this.tick);
        this.gsap = gsap_1.default;
        this.params = params;
        this.init();
    }
    init() {
        // Stats
        if (this.stats) {
            this.stats.showPanel(0);
            document.body.appendChild(this.stats.dom);
        }
        // Update in tick
        if (this.stats) {
            this.onEndTick(() => { var _a; (_a = this.stats) === null || _a === void 0 ? void 0 : _a.end(); });
            this.onAwakeTick(() => { var _a; (_a = this.stats) === null || _a === void 0 ? void 0 : _a.begin(); });
        }
        if (this.orbitControls) {
            this.onStartTick(() => { var _a; (_a = this.orbitControls) === null || _a === void 0 ? void 0 : _a.update(); });
            this.orbitControls.enableDamping = true;
        }
    }
    tick() {
        if (this.emitter) {
            // Awake tick
            this.emitter.emit('awakeTick');
            this.elapsedTime = this.clock.getElapsedTime();
            this.deltaTime = this.elapsedTime - this.prevElapsedTime;
            this.prevElapsedTime = this.elapsedTime;
            const elapsedTime = this.elapsedTime;
            const deltaTime = this.deltaTime;
            // Start tick
            this.emitter.emit('startTick', elapsedTime, deltaTime);
            this.renderer.render(this.scene, this.camera);
            window.requestAnimationFrame(() => { this.tick(); });
            // End tick
            this.emitter.emit('endTick', elapsedTime, deltaTime);
        }
    }
    onAwakeTick(action) {
        this.emitter.on('awakeTick', action);
    }
    // ...args:any[]
    onStartTick(action) {
        this.emitter.on('startTick', action);
    }
    onEndTick(action) {
        this.emitter.on('endTick', action);
    }
}
exports.default = ThreeHandler;

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
var THREE = __importStar(require("three"));
var events_1 = __importDefault(require("events"));
var stats_js_1 = __importDefault(require("stats.js"));
var dat = __importStar(require("dat.gui"));
var OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
var ThreeHandler = /** @class */ (function () {
    function ThreeHandler(params) {
        this.emitter = new events_1.default.EventEmitter();
        this.canvas = params.canvas;
        this.scene = params.scene || new THREE.Scene();
        this.renderer = params.renderer || new THREE.WebGLRenderer({
            antialias: params.antialias
        });
        this.sizes = { width: window.innerWidth, height: window.innerHeight };
        this.camera = params.camera || new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100);
        this.orbitControls = params.enableOrbitControls ? new OrbitControls_1.OrbitControls(this.camera, this.canvas) : null;
        this.clock = new THREE.Clock();
        this.prevElapsedTime = 0;
        this.elapsedTime = 0;
        this.deltaTime = 0;
        this.stats = params.enableStats ? new stats_js_1.default() : null;
        this.gui = params.enableGUI ? new dat.GUI() : null;
        this.params = params;
        this.init();
    }
    ThreeHandler.prototype.init = function () {
        var _this = this;
        // Stats
        if (this.stats) {
            this.stats.showPanel(0);
            document.body.appendChild(this.stats.dom);
        }
        // Update in tick
        if (this.stats) {
            this.onEndTick(function () { var _a; (_a = _this.stats) === null || _a === void 0 ? void 0 : _a.end(); });
            this.onAwakeTick(function () { var _a; (_a = _this.stats) === null || _a === void 0 ? void 0 : _a.begin(); });
        }
        if (this.orbitControls) {
            this.onStartTick(function () { var _a; (_a = _this.orbitControls) === null || _a === void 0 ? void 0 : _a.update(); });
            this.orbitControls.enableDamping = true;
        }
    };
    ThreeHandler.prototype.tick = function () {
        var _this = this;
        // Awake tick
        this.emitter.emit('awakeTick');
        this.elapsedTime = this.clock.getElapsedTime();
        this.deltaTime = this.elapsedTime - this.prevElapsedTime;
        this.prevElapsedTime = this.elapsedTime;
        var elapsedTime = this.elapsedTime;
        var deltaTime = this.deltaTime;
        // Start tick
        this.emitter.emit('startTick', elapsedTime, deltaTime);
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(function () { _this.tick(); });
        // End tick
        this.emitter.emit('endTick', elapsedTime, deltaTime);
    };
    ThreeHandler.prototype.onAwakeTick = function (action) {
        this.emitter.on('awakeTick', action);
    };
    ThreeHandler.prototype.onStartTick = function (action) {
        this.emitter.on('startTick', action);
    };
    ThreeHandler.prototype.onEndTick = function (action) {
        this.emitter.on('endTick', action);
    };
    return ThreeHandler;
}());
exports.default = ThreeHandler;

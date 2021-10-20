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
const meshLoadable_1 = __importDefault(require("../modules/threejs-utils/mesh/meshLoadable"));
const GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
const fragment_glsl_1 = __importDefault(require("../shaders//land/fragment.glsl"));
const vertex_glsl_1 = __importDefault(require("../shaders/land/vertex.glsl"));
const signalGenerator_1 = require("../signal/signalGenerator");
class MainWorld extends meshLoadable_1.default {
    constructor(camera, handler, params) {
        super();
        this.handler = handler;
        this.setting = params;
        // Model Loader
        const gltsLoader = new GLTFLoader_1.GLTFLoader(this.loadingManager);
        const textureLoader = new THREE.TextureLoader(this.loadingManager);
        const dotTexture = textureLoader.load('textures/lit/dot_256.jpg');
        const pinTexture = textureLoader.load('textures/common/pin.png');
        this.land = new THREE.Points();
        // Load Land mesh
        gltsLoader.load('models/world/world_geometry_vertex.gltf', model => {
            const landMesh = model.scene.children[0];
            const landGeometry = landMesh.geometry;
            const landMaterial = new THREE.PointsMaterial({
                color: 0x5341FF,
                size: 0.006,
                sizeAttenuation: true,
                transparent: true,
            });
            landMaterial.onBeforeCompile = _shader => {
                _shader.uniforms.testAlpha = { value: 1 };
                _shader.uniforms.cameraPos = { value: camera.position };
                _shader.uniforms.cameraOffset = { value: 2.5 };
                _shader.uniforms.jooner = { value: 0.98 };
                _shader.vertexShader = vertex_glsl_1.default;
                _shader.fragmentShader = fragment_glsl_1.default;
            };
            landMaterial.map = dotTexture;
            this.land = new THREE.Points(landGeometry, landMaterial);
            // Load ocean mesh
            // const oceanMesh = model.scene.children[0] as Mesh
            const oceanGeometry = new THREE.SphereBufferGeometry(1, 50, 50);
            const oceanMaterial = new THREE.MeshStandardMaterial({
                color: 0x04122d
            });
            const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
            ocean.scale.set(0.999, 0.999, 0.999);
            this.land.add(ocean);
            handler.gsap.from(this.land.scale, {
                'x': 0,
                'y': 0,
                'z': 0,
                delay: 0.5,
                duration: 1.8,
                ease: 'power1.easeOut'
            });
            handler.gsap.from(params, {
                "rotateYMultiplier": 20,
                duration: 6,
                ease: "cire",
            });
            // Add rotate event
            this.add(this.land);
            handler.onStartTick((elapsedTime, deltaTime) => {
                var _a;
                (_a = this.land) === null || _a === void 0 ? void 0 : _a.rotateY(deltaTime * params.rotateY * params.rotateYMultiplier);
            });
            // Add Signal
            new signalGenerator_1.SignalGenerator({
                target: this.land.geometry,
                parant: this.land,
                maxCount: 15,
                spawnRate: 2,
                handler: handler,
                color: 0xFF2EE0,
                planeGeometry: new THREE.PlaneGeometry(0.025, 0.025),
                planeMaterial: new THREE.MeshBasicMaterial({
                    map: dotTexture,
                    color: 0xFF2EE0,
                    transparent: true,
                    alphaMap: dotTexture
                })
            });
            // Add pin !!
            var logoGeometry = new THREE.PlaneGeometry(0.05, 0.05);
            var logoMaterial = new THREE.MeshBasicMaterial({
                map: pinTexture,
                transparent: true,
                alphaMap: pinTexture,
                color: '#ff0112',
                side: THREE.DoubleSide,
            });
            var logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.position.set(-0.2, 0.26, -0.97);
            logo.rotation.set(0, -1.1, 1.2);
            this.land.add(logo);
            this.handler.emitter.emit("Loaded", this.land);
        });
    }
    onLoaded(action) {
        this.handler.emitter.on("Loaded", action);
    }
}
exports.default = MainWorld;

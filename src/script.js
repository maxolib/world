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
require("./style.css");
const THREE = __importStar(require("three"));
const threeHandler_js_1 = __importDefault(require("./utils/handlers/threeHandler.js"));
const GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
const signalLine_1 = require("./signal/signalLine");
const events_1 = __importDefault(require("events"));
const signalGenerator_1 = require("./signal/signalGenerator");
// Event
const emitter = new events_1.default.EventEmitter();
// Scene
const scene = new THREE.Scene();
// Canvas
var canvas = document.querySelector('canvas.webgl');
// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 4);
scene.add(camera);
// Renderer
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);
// Three Handler
var handler = new threeHandler_js_1.default({
    scene: scene,
    canvas: canvas,
    renderer: renderer,
    camera: camera,
    enableGUI: true,
    enableStats: false,
    enableOrbitControls: true,
});
const { sizes, gui } = handler;
// Resize
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// Texture Loader
const textureLoader = new THREE.TextureLoader();
const landTexture = textureLoader.load('textures/world/world_land_map.jpg');
landTexture.flipY = false;
const dotTexture = textureLoader.load('textures/lit/dot_256.jpg');
// Parameters
const params = {
    glob: {
        lineWidth: 0.008,
        rotateY: 0
    }
};
if (gui) {
    var globGUI = gui.addFolder('glob');
    globGUI.add(params.glob, 'rotateY', -0.5, 0.5);
    globGUI.add(params.glob, 'lineWidth', -0.5, 0.5);
}
// Model Loader
const gltsLoader = new GLTFLoader_1.GLTFLoader();
gltsLoader.load('models/world/world_geometry.gltf', model => {
    console.log(model.scene);
    const sphereMesh = model.scene.children[0];
    const sphereGeometry = sphereMesh.geometry;
    const landMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: landTexture,
    });
    const land = new THREE.Mesh(sphereGeometry, landMaterial);
    emitter.emit('load.completed.land', land);
    scene.add(land);
    handler.onStartTick((elapsedTime, deltaTime) => {
        land.rotateY(deltaTime * params.glob.rotateY);
    });
});
// Curve Line
emitter.on('load.completed.land', land => {
    var spawn = 10;
    var array = land.geometry.attributes.position.array;
    var points = [];
    for (let i = 0; i < array.length / 3; i++) {
        var x = array[(i * 3) + 0];
        var y = array[(i * 3) + 1];
        var z = array[(i * 3) + 2];
        points.push(new THREE.Vector3(x, y, z));
    }
    for (let i = 0; i < spawn; i++) {
        var startRandom = Math.random();
        var endRandom = Math.random();
        var signal = new signalLine_1.SingalLine({
            start: points[Math.floor(startRandom * points.length)],
            end: points[Math.floor(endRandom * points.length)],
            color: 0xaaaaff
        });
        signal.RunAnimation(handler);
        land.add(signal);
    }
    var signalGenerator = new signalGenerator_1.SignalGenerator({
        target: points,
        maxCount: 50,
        spawnRate: 0.5,
        handler: handler
    });
});
// AxeHelper
const axeMain = new THREE.AxesHelper(1);
scene.add(axeMain);
// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(-2, 2, 1);
scene.add(directionalLight);
handler.tick();

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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
require("./style.css");
const THREE = __importStar(require("three"));
const threeHandler_js_1 = __importDefault(require("./modules/threejs-utils/handlers/threeHandler.js"));
const events_1 = __importDefault(require("events"));
const mainWorld_1 = __importDefault(require("./world/mainWorld"));
// Event
const emitter = new events_1.default.EventEmitter();
// Scene
const scene = new THREE.Scene();
// Canvas
var canvas = document.querySelector('canvas.webgl');
// Camera
var sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1, 2.5);
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
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x141026);
// Three Handler
var handler = new threeHandler_js_1.default({
    scene: scene,
    canvas: canvas,
    renderer: renderer,
    camera: camera,
    enableStats: false,
    enableOrbitControls: true,
    enableEffectComposer: true,
    enableFullscreen: true,
    enableResponsive: true,
});
if (handler.orbitControls) {
    handler.orbitControls.enableZoom = false;
    handler.orbitControls.enablePan = false;
    handler.orbitControls.maxPolarAngle = Math.PI - Math.PI / 3;
    handler.orbitControls.minPolarAngle = Math.PI / 3;
    handler.orbitControls.rotateSpeed = 0.75;
}
// Texture Loader
const textureLoader = new THREE.TextureLoader();
const landTexture = textureLoader.load('textures/world/world_land_map.jpg');
landTexture.flipY = false;
// Parameters
const params = {
    glob: {
        lineWidth: 0.008,
        rotateY: 0.05,
        rotateYMultiplier: 1
    }
};
const mainWorld = new mainWorld_1.default(camera, handler, params.glob);
scene.add(mainWorld);
// Lighting
const ambientLight = new THREE.AmbientLight(0x172254, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0x495ff4, 0.5); // default 3
directionalLight.position.set(-2, 2, 1);
camera.add(directionalLight);
const pointRedLight = new THREE.PointLight(0xff0000, 10, 5); // default 3
pointRedLight.position.set(1, 2, 1);
camera.add(pointRedLight);
const pointBlueLight = new THREE.PointLight(0x4444ff, 5, 4); // default 3
pointBlueLight.position.set(-2.2, 1.8, -1);
camera.add(pointBlueLight);
// Create background
const img = document.createElement('img');
img.src = 'textures/bg/blue_bg.png';
img.style.position = 'fixed';
img.style.left = '0%';
img.style.bottom = "0%";
img.style.width = '100%';
img.style.pointerEvents = 'none';
console.log(document.getElementsByTagName('body'));
(_a = document.getElementsByTagName('body')[0]) === null || _a === void 0 ? void 0 : _a.appendChild(img);
const img2 = document.createElement('img');
img2.src = 'textures/bg/red_bg.png';
img2.style.position = 'fixed';
img2.style.top = "0%";
img2.style.right = "0%";
img2.style.width = '100%';
img2.style.pointerEvents = 'none';
console.log(document.getElementsByTagName('body'));
(_b = document.getElementsByTagName('body')[0]) === null || _b === void 0 ? void 0 : _b.appendChild(img2);
// Animate H1
mainWorld.onLoaded(() => {
    handler.gsap.to('h1', {
        'opacity': 1,
        delay: 1.5,
        duration: 2.5,
    });
    handler.gsap.to('.loading', {
        'opacity': 0,
        duration: 3,
    });
    handler.gsap.from('h1', {
        'y': 30,
        delay: 1.5,
        duration: 1,
    });
});

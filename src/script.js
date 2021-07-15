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
const events_1 = __importDefault(require("events"));
const signalGenerator_1 = require("./signal/signalGenerator");
const fragment_glsl_1 = __importDefault(require("./shaders/land/fragment.glsl"));
const vertex_glsl_1 = __importDefault(require("./shaders/land/vertex.glsl"));
// Event
const emitter = new events_1.default.EventEmitter();
// Scene
const scene = new THREE.Scene();
// Canvas
var canvas = document.querySelector('canvas.webgl');
// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
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
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x17122c);
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
if (handler.orbitControls) {
    handler.orbitControls.enableZoom = false;
    handler.orbitControls.enablePan = false;
    handler.orbitControls.maxPolarAngle = Math.PI - Math.PI / 3;
    handler.orbitControls.minPolarAngle = Math.PI / 3;
    handler.orbitControls.rotateSpeed = 0.75;
}
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
        rotateY: 0.05
    }
};
var globGUI = null;
if (gui) {
    globGUI = gui.addFolder('glob');
    globGUI.add(params.glob, 'rotateY', -0.5, 0.5);
    globGUI.add(params.glob, 'lineWidth', -0.5, 0.5);
}
// Model Loader
const gltsLoader = new GLTFLoader_1.GLTFLoader();
// DEMO World 1
// gltsLoader.load(
//     'models/world/world_geometry.gltf',
//     model => {
//         console.log(model.scene);
//         const sphereMesh = model.scene.children[0] as Mesh
// 		const sphereGeometry = sphereMesh.geometry
//         const landMaterial = new THREE.MeshStandardMaterial({
//             color: 0xffffff,
//             map: landTexture,
//         })
//         const land = new THREE.Mesh(
//             sphereGeometry,
//             landMaterial,
//         )
//         emitter.emit('load.completed.land', land)
//         scene.add(land)
//         handler.onStartTick((elapsedTime, deltaTime) => {
//             land.rotateY(deltaTime * params.glob.rotateY)
//         })
//     }
// )
gltsLoader.load(
// 'models/world/world_geometry.gltf',
'models/world/world_geometry_vertex.gltf', model => {
    const sphereMesh = model.scene.children[0];
    const sphereGeometry = sphereMesh.geometry;
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
        if (globGUI) {
            globGUI.add(_shader.uniforms.cameraOffset, "value", 0., 3).name("cameraOffset");
            globGUI.add(_shader.uniforms.jooner, "value", 0, 2).name("cameraOffsetMutiplier");
        }
    };
    landMaterial.map = dotTexture;
    const land = new THREE.Points(sphereGeometry, landMaterial);
    emitter.emit('load.completed.land', land);
    scene.add(land);
    handler.onStartTick((elapsedTime, deltaTime) => {
        land.rotateY(deltaTime * params.glob.rotateY);
    });
});
gltsLoader.load('models/world/world_geometry.gltf', model => {
    const sphereMesh = model.scene.children[0];
    const sphereGeometry = sphereMesh.geometry;
    const material = new THREE.MeshStandardMaterial({
        color: 0x04122d
    });
    const ocean = new THREE.Mesh(sphereGeometry, material);
    ocean.scale.set(0.999, 0.999, 0.999);
    scene.add(ocean);
});
// Create signal generator
emitter.on('load.completed.land', land => {
    new signalGenerator_1.SignalGenerator({
        target: land.geometry,
        parant: land,
        maxCount: 20,
        spawnRate: 2,
        handler: handler,
        color: 0xFF2EE0
    });
});
// AxeHelper
const axeMain = new THREE.AxesHelper(1);
scene.add(axeMain);
// Lighting
const lightGUI = gui === null || gui === void 0 ? void 0 : gui.addFolder("Lighting");
const ambientLight = new THREE.AmbientLight(0x172254, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0x495ff4, 0.5); // default 3
directionalLight.position.set(-2, 2, 1);
camera.add(directionalLight);
const pointLight = new THREE.PointLight(0xff0000, 10, 5); // default 3
pointLight.position.set(1, 2, 1);
camera.add(pointLight);
lightGUI === null || lightGUI === void 0 ? void 0 : lightGUI.add(pointLight.position, 'x', -3, 3);
lightGUI === null || lightGUI === void 0 ? void 0 : lightGUI.add(pointLight.position, 'y', -3, 3);
lightGUI === null || lightGUI === void 0 ? void 0 : lightGUI.add(pointLight.position, 'z', -3, 3);
handler.tick();

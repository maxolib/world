import './style.css'
import * as THREE from 'three'
import ThreeHandler from './utils/handlers/threeHandler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import SignalGeneratorMeshLine from './objects/signalGeneratorMeshLine.js'
import events from 'events'


// Event
const emitter = new events.EventEmitter();

// Scene
const scene = new THREE.Scene()

// Canvas
var canvas = document.querySelector('canvas.webgl')

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 1, 4)
scene.add(camera)

// Renderer
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000);

// Three Handler
var handler = new ThreeHandler({
    scene: scene,
    canvas: canvas,
    renderer: renderer,
    camera: camera,
    enableGUI: true,
    enableStats: false,
    enableOrbitControls: true,
})

const { sizes, gui } = handler

// Resize
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Texture Loader
const textureLoader = new THREE.TextureLoader()
const landTexture = textureLoader.load('textures/world/world_land_map.jpg')
landTexture.flipY = false
const dotTexture = textureLoader.load('textures/lit/dot_256.jpg')

// Parameters
const params = {
    glob: {
        lineWidth: 0.008,
        rotateY: 0.0
    }
}
var globGUI = gui.addFolder('glob')
globGUI.add(params.glob, 'rotateY', -0.5, 0.5)
globGUI.add(params.glob, 'lineWidth', -0.5, 0.5)

// Model Loader
const gltsLoader = new GLTFLoader()
const sphereObject = gltsLoader.load(
    'models/world/world_geometry.gltf',
    model => {
        console.log(model);
        const sphereGeometry = model.scene.children[0].geometry
        const landMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: landTexture,
            transparent: true,
            opacity: 0.5,
        })
        const land = new THREE.Mesh(
            sphereGeometry,
            landMaterial,
        )
        emitter.emit('load.completed.land', land)
        scene.add(land)
        handler.onStartTick((elapsedTime, deltaTime) => {
            land.rotateY(deltaTime * params.glob.rotateY)
        })
    }
)
// Curve Line
const curveGroup = new THREE.Group()
scene.add(curveGroup)
const curveList = []
const signalGenerator = new SignalGeneratorMeshLine({
    scene,
    lineWidth: params.glob.lineWidth
})
// var signal = signalGenerator.createSignal(
//     new THREE.Vector3(1, 0, 0),
//     new THREE.Vector3(Math.cos(Math.PI / 8), Math.sin(Math.PI / 8), 0)
// )
var signal2 = signalGenerator.createSignal(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(Math.cos(Math.PI / 2), Math.sin(Math.PI / 2), 0)
)


// AxeHelper
const axeMain = new THREE.AxesHelper(1)
scene.add(axeMain)
emitter.on('load.completed.land', land => {
    // SignalGenerator.addSignalToScene(signal, land)
    SignalGeneratorMeshLine.addSignalToScene(signal2, land)
    // SignalGenerator.addAxeHelper(signal, land)
    SignalGeneratorMeshLine.addAxeHelper(signal2, land)
})


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-2, 2, 1)
scene.add(directionalLight)

handler.tick()
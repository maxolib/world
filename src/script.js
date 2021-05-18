import './style.css'
import * as THREE from 'three'
import ThreeHandler from './utils/handlers/threeHandler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import SignalGenerator from './objects/signalGenerator.js'

// Scene
const scene = new THREE.Scene()

// Canvas
var canvas = document.querySelector('canvas.webgl')

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 1, 2)
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

// Model Loader
const gltsLoader = new GLTFLoader()
const sphereObject = gltsLoader.load(
    'models/world/world_geometry.gltf',
    model => {
        console.log(model);
        const sphereGeometry = model.scene.children[0].geometry
        const landMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: landTexture
        })
        const land = new THREE.Mesh(
            sphereGeometry,
            landMaterial
        )
        scene.add(land)

        handler.onStartTick((elapsedTime, deltaTime) => {
            land.rotateY(deltaTime * 0.1)
        })
    }
)

// Curve Line
const signalGenerator = new SignalGenerator({
    scene
})
var signal1 = signalGenerator.createSignal(new THREE.Vector3(-1, 0, 2), new THREE.Vector3(1, 0, 2))
SignalGenerator.addSignalToScene(signal1, scene)



gui.add(signalGenerator.lineMaterial, 'linewidth', 0, 0.01)

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-2, 2, 1)
scene.add(directionalLight)

handler.tick()
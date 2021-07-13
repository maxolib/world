import './style.css'
import * as THREE from 'three'
import ThreeHandler from './utils/handlers/threeHandler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import events from 'events'
import { SignalGenerator } from './signal/signalGenerator'
import { Mesh } from 'three'

// Event
const emitter = new events.EventEmitter();

// Scene
const scene = new THREE.Scene()

// Canvas
var canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

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
        rotateY: 0.1
    }
}
if(gui){
	var globGUI = gui.addFolder('glob')
	globGUI.add(params.glob, 'rotateY', -0.5, 0.5)
	globGUI.add(params.glob, 'lineWidth', -0.5, 0.5)
}

// Model Loader
const gltsLoader = new GLTFLoader()
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
    'models/world/world_geometry_vertex.gltf',
    model => {
        console.log(model.scene);
        const sphereMesh = model.scene.children[0] as Mesh
        console.log(sphereMesh);
        
		const sphereGeometry = sphereMesh.geometry
        const landMaterial = new THREE.MeshBasicMaterial({
            color: 0x111111,
            wireframe: true
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

// Create signal generator
emitter.on('load.completed.land', land => {
	new SignalGenerator({
		target: land.geometry,
        parant: land,
		maxCount: 20,
		spawnRate: 2,
		handler: handler,
        color: 0x9D79EB
	})

})


// AxeHelper
const axeMain = new THREE.AxesHelper(1)
scene.add(axeMain)


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-2, 2, 1)
scene.add(directionalLight)

handler.tick()
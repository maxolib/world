import './style.css'
import * as THREE from 'three'
import ThreeHandler from './utils/handlers/threeHandler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { SingalLine } from './signal/signalLine'
import events from 'events'
import { random } from 'gsap/all'
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
        rotateY: 0
    }
}
if(gui){
	var globGUI = gui.addFolder('glob')
	globGUI.add(params.glob, 'rotateY', -0.5, 0.5)
	globGUI.add(params.glob, 'lineWidth', -0.5, 0.5)
}

// Model Loader
const gltsLoader = new GLTFLoader()
gltsLoader.load(
    'models/world/world_geometry.gltf',
    model => {
        console.log(model.scene);
        const sphereMesh = model.scene.children[0] as Mesh
		const sphereGeometry = sphereMesh.geometry
        const landMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: landTexture,
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
emitter.on('load.completed.land', land => {
    var spawn = 10
    var array = land.geometry.attributes.position.array
    var points: THREE.Vector3[] = []
    for (let i = 0; i < array.length / 3; i++) {
        var x = array[(i*3) + 0]
        var y = array[(i*3) + 1]
        var z = array[(i*3) + 2]
        points.push(new THREE.Vector3(x, y, z))
    }
    for (let i = 0; i < spawn; i++) {
        var startRandom = Math.random()
        var endRandom = Math.random()
        var signal = new SingalLine({
            start: points[Math.floor(startRandom * points.length)],
            end: points[Math.floor(endRandom * points.length)],
            color: 0xaaaaff
        })
        signal.RunAnimation(handler)
        land.add(signal)
    }

	var signalGenerator = new SignalGenerator({
		target: points,
		maxCount: 50,
		spawnRate: 0.5,
		handler: handler
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
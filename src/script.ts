import './style.css'
import * as THREE from 'three'
import ThreeHandler from './utils/handlers/threeHandler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import events from 'events'
import { SignalGenerator } from './signal/signalGenerator'
import { Mesh } from 'three'
import landFragmentShader from './shaders/land/fragment.glsl'
import landVertexShader from './shaders/land/vertex.glsl'
import { GUI } from 'dat.gui'

// Event
const emitter = new events.EventEmitter();

// Scene
const scene = new THREE.Scene()

// Canvas
var canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 1, 2.5)
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
renderer.setClearColor(0x17122c);

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
if(handler.orbitControls){
    handler.orbitControls.enableZoom = false
    handler.orbitControls.enablePan = false
    handler.orbitControls.maxPolarAngle = Math.PI - Math.PI / 3
    handler.orbitControls.minPolarAngle = Math.PI / 3
    handler.orbitControls.rotateSpeed = 0.75
}

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
        rotateY: 0.05
    }
}
var globGUI: GUI | null = null
if(gui){
	globGUI = gui.addFolder('glob')
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
        const sphereMesh = model.scene.children[0] as Mesh
        
		const sphereGeometry = sphereMesh.geometry
        const landMaterial = new THREE.PointsMaterial({
            color: 0x5341FF,
            size: 0.006,
            sizeAttenuation: true,
            transparent: true,

        })
        landMaterial.onBeforeCompile = _shader => {
            _shader.uniforms.testAlpha = { value: 1 }
            _shader.uniforms.cameraPos = { value: camera.position }
            _shader.uniforms.cameraOffset = { value: 2.5 }
            _shader.uniforms.jooner = { value: 0.98 }
            _shader.vertexShader = landVertexShader
            _shader.fragmentShader = landFragmentShader
            if(globGUI){
                globGUI.add(_shader.uniforms.cameraOffset, "value", 0., 3).name("cameraOffset")
                globGUI.add(_shader.uniforms.jooner, "value", 0, 2).name("cameraOffsetMutiplier")
            }
        }
        
        landMaterial.map = dotTexture
        const land = new THREE.Points(
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
gltsLoader.load(
    'models/world/world_geometry.gltf',
    model => {
        const sphereMesh = model.scene.children[0] as Mesh
		const sphereGeometry = sphereMesh.geometry
        const material = new THREE.MeshStandardMaterial({
            color: 0x04122d
        })
        const ocean = new THREE.Mesh(
            sphereGeometry,
            material
        )
        ocean.scale.set(0.999, 0.999, 0.999)
        scene.add(ocean)
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
        color: 0xFF2EE0
	})

})


// AxeHelper
const axeMain = new THREE.AxesHelper(1)
scene.add(axeMain)


// Lighting
const lightGUI = gui?.addFolder("Lighting")
const ambientLight = new THREE.AmbientLight(0x172254, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0x495ff4, 0.5) // default 3
directionalLight.position.set(-2, 2, 1)
camera.add(directionalLight)


const pointLight = new THREE.PointLight(0xff0000, 10, 5) // default 3
pointLight.position.set(1, 2, 1)
camera.add(pointLight)
lightGUI?.add(pointLight.position, 'x', -3, 3)
lightGUI?.add(pointLight.position, 'y', -3, 3)
lightGUI?.add(pointLight.position, 'z', -3, 3)

handler.tick()

import './style.css'
import * as THREE from 'three'
import ThreeHandler from './modules/threejs-utils/handlers/threeHandler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import events from 'events'
import { SignalGenerator } from './signal/signalGenerator'
import { Mesh } from 'three'
import landFragmentShader from './shaders/land/fragment.glsl'
import landVertexShader from './shaders/land/vertex.glsl'

// Event
const emitter = new events.EventEmitter();

// Scene
const scene = new THREE.Scene()

// Canvas
var canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

// Camera
var sizes = {width: window.innerWidth, height: window.innerHeight} 
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x141026);

// Three Handler
var handler = new ThreeHandler({
    scene: scene,
    canvas: canvas,
    renderer: renderer,
    camera: camera,
    enableStats: false,
    enableOrbitControls: true,
    enableEffectComposer: true,
    enableFullscreen: true,
    enableResponsive: true,
})
if(handler.orbitControls){
    handler.orbitControls.enableZoom = false
    handler.orbitControls.enablePan = false
    handler.orbitControls.maxPolarAngle = Math.PI - Math.PI / 3
    handler.orbitControls.minPolarAngle = Math.PI / 3
    handler.orbitControls.rotateSpeed = 0.75
}

// Texture Loader
const textureLoader = new THREE.TextureLoader()
const landTexture = textureLoader.load('textures/world/world_land_map.jpg')
landTexture.flipY = false
const dotTexture = textureLoader.load('textures/lit/dot_256.jpg')
const miximumTexture = textureLoader.load('textures/miximum/alpha.png')
const pinTexture = textureLoader.load('textures/common/pin.png')

// Parameters
const params = {
    glob: {
        lineWidth: 0.008,
        rotateY: 0.05,
        rotateYMultiplier: 1 
    }
}

// Model Loader
const gltsLoader = new GLTFLoader()

// Load Land mesh
gltsLoader.load(
    'models/world/world_geometry_vertex.gltf',
    model => {
        const landMesh = model.scene.children[0] as Mesh
        
		const landGeometry = landMesh.geometry
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
        }
        
        landMaterial.map = dotTexture
        const land = new THREE.Points(
            landGeometry,
            landMaterial,
        )
        // Load ocean mesh
        // const oceanMesh = model.scene.children[0] as Mesh
        const oceanGeometry = new THREE.SphereBufferGeometry(1, 50, 50)
        const oceanMaterial = new THREE.MeshStandardMaterial({
            color: 0x04122d
        })
        const ocean = new THREE.Mesh(
            oceanGeometry,
            oceanMaterial
        )
        ocean.scale.set(0.999, 0.999, 0.999)

        land.add(ocean)
        emitter.emit('load.completed.land', land)
    }
)

// Animate grob
emitter.on('load.completed.land', land => {
    handler.gsap.from(
        land.scale, 
        {
            'x': 0,
            'y': 0,
            'z': 0,
            duration: 1.8,
            ease: 'power1.easeOut'
        }
    )
    handler.gsap.from(params.glob, {
        "rotateYMultiplier": 20,
        duration: 6,
        ease: "cire",
        
    })
    scene.add(land)
    handler.onStartTick((elapsedTime, deltaTime) => {
        land.rotateY(deltaTime * params.glob.rotateY * params.glob.rotateYMultiplier)
    })
})

// Create signal generator
emitter.on('load.completed.land', land => {
	new SignalGenerator({
		target: land.geometry,
        parant: land,
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
	})

    // Miximum Logo !!
    var logoGeometry = new THREE.PlaneGeometry(0.05, 0.05)
    var logoMaterial = new THREE.MeshBasicMaterial({
        map: pinTexture,
        transparent: true,
        alphaMap: pinTexture,
        color: '#ff0112',
        side: THREE.DoubleSide,
    })
    var logo = new THREE.Mesh(logoGeometry, logoMaterial)

    logo.position.set(-0.2, 0.26, -0.97)
    logo.rotation.set(0, -1.1, 1.2)
    land.add(logo)
})

// Lighting
const ambientLight = new THREE.AmbientLight(0x172254, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0x495ff4, 0.5) // default 3
directionalLight.position.set(-2, 2, 1)
camera.add(directionalLight)


const pointRedLight = new THREE.PointLight(0xff0000, 10, 5) // default 3
pointRedLight.position.set(1, 2, 1)
camera.add(pointRedLight)

const pointBlueLight = new THREE.PointLight(0x4444ff, 5, 4) // default 3
pointBlueLight.position.set(-2.2, 1.8, -1)
camera.add(pointBlueLight)

// Create background
const img = document.createElement('img')
img.src = 'textures/bg/blue_bg.png'
img.style.position = 'fixed'
img.style.left = '0%'
img.style.bottom = "0%"
img.style.width = '100%'
img.style.pointerEvents = 'none'
console.log(document.getElementsByTagName('body'));
document.getElementsByTagName('body')[0]?.appendChild(img)

const img2 = document.createElement('img')
img2.src = 'textures/bg/red_bg.png'
img2.style.position = 'fixed'
img2.style.top = "0%"
img2.style.right = "0%"
img2.style.width = '100%'
img2.style.pointerEvents = 'none'
console.log(document.getElementsByTagName('body'));
document.getElementsByTagName('body')[0]?.appendChild(img2)

// Animate H1
emitter.on('load.completed.land', () => {
    handler.gsap.to(
        'h1', 
        {
            'opacity': 1,
            delay: 0.5,
            duration: 1.8,
        }
    )
    handler.gsap.from(
        'h1', 
        {
            'y': 30,
            delay: 0.5,
            duration: 0.7,
        }
    )
})


import * as THREE from 'three'
import events from 'events'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import gsap from "gsap"

export default class ThreeHandler {
    // Graphics
    canvas: HTMLCanvasElement;
    renderer: THREE.Renderer;
    camera: THREE.Camera;
    scene: THREE.Scene;
    orbitControls?: OrbitControls;
    // Common
    params: SceneObjectParams
    sizes: ScreenSize;
    // Debuging
    stats: Stats | null;
    gui: dat.GUI | null;
    // Event handler
    emitter: events.EventEmitter;
    // Animation & Tick
    private clock: THREE.Clock;
    private prevElapsedTime: number;
    private elapsedTime: number;
    private deltaTime: number;
    gsap: GSAP;
    // Post-Processing
    effectComposer: EffectComposer | null;

    constructor(params: SceneObjectParams) {
        this.emitter = new events.EventEmitter()
        this.canvas = params.canvas;
        this.scene = params.scene ?? new THREE.Scene()
        this.renderer = params.renderer ?? new THREE.WebGLRenderer({
            canvas: params.canvas,
            antialias: params.antialias
        })
        this.sizes = params.sizes ?? { width: window.innerWidth, height: window.innerHeight }
        this.camera = params.camera ?? new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.orbitControls = params.enableOrbitControls ? new OrbitControls(this.camera, this.canvas as HTMLElement) : undefined
        this.effectComposer = params.enableEffectComposer && this.renderer instanceof THREE.WebGLRenderer ? new EffectComposer(this.renderer) : null
        this.effectComposer?.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.effectComposer?.setSize(this.sizes.width, this.sizes.height)
        if(params.enableFullscreen && params.sizes == undefined)
            this.setFullScreen(params.enableResponsive)

        this.clock = new THREE.Clock()
        this.prevElapsedTime = 0
        this.elapsedTime = 0
        this.deltaTime = 0

        this.stats = params.enableStats ? new Stats() : null
        this.gui = params.enableGUI ? new dat.GUI() : null
        
        // gsap.ticker.add(this.tick)
        this.gsap = gsap

        this.params = params
        this.init()

        this.tick()
    }
    private init() {
        
        // Stats
        if (this.stats) {
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
        }

        // Update in tick
        if (this.stats) {
            this.onEndTick(() => { this.stats?.end() })
            this.onAwakeTick(() => { this.stats?.begin() })
        }

        if (this.orbitControls){
            this.onStartTick(() => { this.orbitControls?.update() })
            this.orbitControls.enableDamping = true;
        }
    }

    private setFullScreen(responsive: boolean | undefined){
        
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        if(!responsive) return

        window.addEventListener('resize', () => {
            // Update sizes
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight

            // Update camera
            if(this.camera instanceof THREE.PerspectiveCamera){
                this.camera.aspect = this.sizes.width / this.sizes.height
                this.camera.updateProjectionMatrix()
            }

            // Update renderer
            this.renderer?.setSize(this.sizes.width, this.sizes.height)
            if(this.renderer instanceof THREE.WebGLRenderer)
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }

    private tick() {
        
        if(this.emitter){
            // Awake tick
            this.emitter.emit('awakeTick')
            
            this.elapsedTime = this.clock.getElapsedTime()
            this.deltaTime = this.elapsedTime - this.prevElapsedTime
            this.prevElapsedTime = this.elapsedTime
            const elapsedTime = this.elapsedTime
            const deltaTime = this.deltaTime


            // Start tick
            this.emitter.emit('startTick', elapsedTime, deltaTime)

            this.renderer.render(this.scene, this.camera)
            
            this.effectComposer?.render()

            window.requestAnimationFrame(() => {this.tick()})
            
            // End tick
            this.emitter.emit('endTick', elapsedTime, deltaTime)
        }
    }

    onAwakeTick(action: () => void) {
        this.emitter.on('awakeTick', action)
    }
    // ...args:any[]
    onStartTick(action: (elaped: number, delta: number) => void) {
        this.emitter.on('startTick', action)
    }
    onEndTick(action: (elaped: number, delta: number) => void) {
        this.emitter.on('endTick', action)
    }
}

interface SceneObjectParams {
    canvas: HTMLCanvasElement
    sizes?: ScreenSize
    scene?: THREE.Scene
    renderer?: THREE.Renderer
    camera?: THREE.Camera
    antialias?: boolean
    enableGUI?: boolean
    enableStats?: boolean
    enableOrbitControls?: boolean
    enableEffectComposer?: boolean
    enableFullscreen?: boolean
    enableResponsive?: boolean
}

interface Size {
    x: number
    y: number
}

interface ScreenSize {
    width: number
    height: number
}
import * as THREE from 'three'
import events from 'events'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class ThreeHandler {
    // Graphics
    canvas: Element;
    scene: THREE.Scene;
    renderer: THREE.Renderer;
    camera: THREE.Camera;
    orbitControls: OrbitControls | null;
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

    constructor(params: SceneObjectParams) {
        this.emitter = new events.EventEmitter()
        this.canvas = params.canvas;
        this.scene = params.scene || new THREE.Scene()
        this.renderer = params.renderer || new THREE.WebGLRenderer({
            antialias: params.antialias
        })
        this.sizes = { width: window.innerWidth, height: window.innerHeight }
        this.camera = params.camera || new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.orbitControls = params.enableOrbitControls ? new OrbitControls(this.camera, this.canvas as HTMLElement) : null
        
        this.clock = new THREE.Clock()
        this.prevElapsedTime = 0
        this.elapsedTime = 0
        this.deltaTime = 0

        this.stats = params.enableStats ? new Stats() : null
        this.gui = params.enableGUI ? new dat.GUI() : null

        this.params = params
        this.init()
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

    tick() {
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
        window.requestAnimationFrame(() => {this.tick()})
        
        // End tick
        this.emitter.emit('endTick', elapsedTime, deltaTime)
    }

    onAwakeTick(action: (...args: any[]) => void) {
        this.emitter.on('awakeTick', action)
    }
    onStartTick(action: (...args: any[]) => void) {
        this.emitter.on('startTick', action)
    }
    onEndTick(action: (...args: any[]) => void) {
        this.emitter.on('endTick', action)
    }
}

interface SceneObjectParams {
    canvas: Element
    scene?: THREE.Scene
    renderer?: THREE.Renderer
    camera?: THREE.Camera
    antialias?: boolean
    enableGUI?: boolean
    enableStats?: boolean
    enableOrbitControls?: boolean
}

interface Size {
    x: number
    y: number
}

interface ScreenSize {
    width: number
    height: number
}
import * as THREE from "three"
import MeshLoadable from "../modules/threejs-utils/mesh/meshLoadable";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import landFragmentShader from '../shaders//land/fragment.glsl'
import landVertexShader from '../shaders/land/vertex.glsl'
import { SignalGenerator } from '../signal/signalGenerator'
import ThreeHandler from "../modules/threejs-utils/handlers/threeHandler";

interface WorldParams {
	lineWidth: number,
	rotateY: number,
	rotateYMultiplier: number,
}

export default class MainWorld extends MeshLoadable {
	land: THREE.Points
	handler: ThreeHandler
	setting: WorldParams
	constructor(camera: THREE.Camera, handler: ThreeHandler, params: WorldParams) {
		super()
		this.handler = handler
		this.setting = params

		// Model Loader
		const gltsLoader = new GLTFLoader(this.loadingManager)

		const textureLoader = new THREE.TextureLoader(this.loadingManager)
		const dotTexture = textureLoader.load('textures/lit/dot_256.jpg')
		const pinTexture = textureLoader.load('textures/common/pin.png')

		this.land = new THREE.Points()

		// Load Land mesh
		gltsLoader.load(
			'models/world/world_geometry_vertex.gltf',
			model => {
				const landMesh = model.scene.children[0] as THREE.Mesh

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
				this.land = new THREE.Points(
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

				this.land.add(ocean)

				handler.gsap.from(
					this.land.scale,
					{
						'x': 0,
						'y': 0,
						'z': 0,
						delay: 0.5,
						duration: 1.8,
						ease: 'power1.easeOut'
					}
				)

				handler.gsap.from(params, {
					"rotateYMultiplier": 20,
					duration: 6,
					ease: "cire",

				})
				
				// Add rotate event
				this.add(this.land)
				handler.onStartTick((elapsedTime, deltaTime) => {
					this.land?.rotateY(deltaTime * params.rotateY * params.rotateYMultiplier)
				})


				// Add Signal
				new SignalGenerator({
					target: this.land.geometry,
					parant: this.land,
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

				// Add pin !!
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
				this.land.add(logo)

				this.handler.emitter.emit("Loaded", this.land)
			}
		)
	}

	onLoaded(action: (land: THREE.Object3D) => void){
		this.handler.emitter.on("Loaded", action)
	}
}
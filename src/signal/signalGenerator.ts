import * as THREE from "three"
import ThreeHandler from "../modules/threejs-utils/handlers/threeHandler"
import { SingalLine } from "./signalLine"

interface SingalGeneratorParams{
	target: THREE.Mesh | THREE.BufferGeometry | THREE.Vector3[]
	parant: THREE.Object3D
	handler: ThreeHandler
	maxCount: number
	spawnRate: number
	color?: number
	idleDuration?: number
    animDuration?: number
	planeGeometry?: THREE.BufferGeometry
	planeMaterial?: THREE.Material
}
export class SignalGenerator{
	points: THREE.Vector3[]
	parant: THREE.Object3D
	signals: SingalLine[]
	maxCount: number
	spawnRate: number
	color: number
	idleDuration: number
	animDuration: number
	isPlay: boolean
	handler: ThreeHandler
	gsap: GSAP
	planeGeometry?: THREE.BufferGeometry
	planeMaterial?: THREE.Material

	private score: number
	private lastTime: number

	constructor(params: SingalGeneratorParams){
		this.parant = params.parant				
		this.maxCount = params.maxCount
		this.spawnRate = params.spawnRate
		this.color = params.color ?? 0xffffff
		this.idleDuration = params.idleDuration ?? 2
		this.animDuration = params.animDuration ?? 2
		this.isPlay = true
		this.handler = params.handler
		this.gsap = params.handler.gsap
		this.points = this.getPointsFromTarget(params.target)
		this.signals = []
		this.score = 0
		this.lastTime = 0
		this.planeGeometry = params.planeGeometry
		this.planeMaterial = params.planeMaterial
		this.gsap.to(this, {
			repeat: -1,
			onUpdate: () => {
				if(!this.isPlay) return
				var deltaTime = this.gsap.ticker.time - this.lastTime
				this.score += this.spawnRate * deltaTime
				if(this.score > 1){
					this.score--
					this.Spawn()
				}
				
				this.lastTime = this.gsap.ticker.time
			},
		})
	}
	Spawn(start?: THREE.Vector3, end?: THREE.Vector3){
		if(this.signals.length > this.maxCount) return

		// init
		start = start ?? this.points[Math.floor(Math.random() * this.points.length)]
		end = end ?? this.points[Math.floor(Math.random() * this.points.length)]

		// Respawn far points
		var distance = start.distanceTo(end)
		var distanceStart = start.distanceTo(new THREE.Vector3(0))
		var distanceEnd = start.distanceTo(new THREE.Vector3(0))

		if(
			distance > 1.5 ||
			distance < 0.2 ||
			start.x > 1.1 ||
			distanceStart > 1.1 ||
			distanceEnd > 1.1)
		{
			this.Spawn()
			return
		}
		
        var signal = new SingalLine({
            start: start,
            end: end,
			color: this.color,
			planeGeometry: this.planeGeometry,
			planeMaterial: this.planeMaterial
        })
		
		this.signals.push(signal)
		this.parant.add(signal)
		var timeline = signal.RunAnimation(this.handler)
		
		timeline.call(() => {
			this.signals = this.signals.filter((_item) => {
				return _item != signal
			})
			this.parant.remove(signal)
		})
	}
	
	getPointsFromTarget(target: THREE.Mesh | THREE.BufferGeometry | THREE.Vector3[]){
		var points: THREE.Vector3[] = []
		var array: ArrayLike<number>
		
		if(target instanceof THREE.Mesh){
    		array = target.geometry.attributes.position.array
			for (let i = 0; i < array.length / 3; i++) {
				var x = array[(i*3) + 0]
				var y = array[(i*3) + 1]
				var z = array[(i*3) + 2]
				points.push(new THREE.Vector3(x, y, z))
			}
		}
		else if(target instanceof THREE.BufferGeometry){
    		var array = target.attributes.position.array
			for (let i = 0; i < array.length / 3; i++) {
				var x = array[(i*3) + 0]
				var y = array[(i*3) + 1]
				var z = array[(i*3) + 2]
				points.push(new THREE.Vector3(x, y, z))
			}
		}
		else{
			return target
		}
		return points
	}
	start(){
		this.isPlay = true
	}
	stop(){
		this.isPlay = false
	}
}
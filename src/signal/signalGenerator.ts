import gsap from "gsap/all"
import * as THREE from "three"
import ThreeHandler from "../utils/handlers/threeHandler"
import { SingalLine } from "./signalLine"

interface SingalGeneratorParams{
	target: THREE.Mesh | THREE.BufferGeometry | THREE.Vector3[]
	handler: ThreeHandler
	maxCount: number
	spawnRate: number
	color?: string | number
	idleDuration?: number
    animDuration?: number
}
export class SignalGenerator{
	points: THREE.Vector3[]
	signals: SingalLine[]
	maxCount: number
	spawnRate: number
	color: string | number
	idleDuration: number
	animDuration: number
	isPlay: boolean
	handler: ThreeHandler
	gsap: GSAP

	constructor(params: SingalGeneratorParams){
		this.maxCount = params.maxCount
		this.spawnRate = params.spawnRate
		this.color = params.color ?? 0xffffff
		this.idleDuration = params.idleDuration ?? 2
		this.animDuration = params.animDuration ?? 2
		this.isPlay = false
		this.handler = params.handler
		this.gsap = params.handler.gsap
		this.points = this.getPointsFromTarget(params.target)
		this.signals = []
		gsap.to(this, {
			repeat: -1, 
			onUpdate: () => {
				if(false)
					this.Spawn()
			},
		})
	}
	Spawn(){
		if(this.signals.length > this.maxCount) return
        var signal = new SingalLine({
            start: this.points[Math.floor(Math.random() * this.points.length)],
            end: this.points[Math.floor(Math.random() * this.points.length)],
            color: 0xaaaaff
        })
		this.signals.push(signal)
		var timeline = signal.RunAnimation(this.handler)
		timeline.call(() => {
			this.signals.filter((_item) => {return _item != signal})
		})
	}
	
	getPointsFromTarget(target: THREE.Mesh | THREE.BufferGeometry | THREE.Vector3[]){
		var points: THREE.Vector3[] = []
		
		if(target instanceof THREE.Mesh){
			// TO DO
		}
		else if(target instanceof THREE.BufferGeometry){
			// TO DO
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
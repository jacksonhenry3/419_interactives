// Define player object
function player_object(arena){
	this.omega = 0;
	this.theta = 0;
	this.angularSize = Math.PI/64;
	this.arena = arena
	this.buffer = this.arena.buffer
	this.radius =  this.arena.radius -this.buffer


	var self = this

	this.pos = function(){
		r = this.radius
		t = this.theta
		return(new vector([r*Math.cos(t),r*Math.sin(t),0]))
	}
	

	this.render = function() {

		// this.theta = (this.theta+(this.omega*.1-arena.OMEGA.z))
		// if (! document.getElementById("refrenceRotation").checked ) {this.theta = this.theta-(this.arena.perspectiveomega)}
		// this.theta = this.theta-(this.arena.perspectiveomega)
		// for (var i = 2*Math.PI/(this.angularSize)/2; i >= 0; i--) {
		for (var i = 3; i >= 0; i--) {


			theta =this.theta+ this.angularSize*32*i
			

			// console.log(theta)
		this.arena.ctx.beginPath();
		this.arena.ctx.arc(this.arena.center.x,this.arena.center.y,this.radius, theta - this.angularSize/2,theta + this.angularSize/2, false)
		this.arena.ctx.strokeStyle = 'rgb(240,240,240)';
		if (i%2===0) {arena.ctx.strokeStyle = "rgba(0,0,0,1)"}
		this.arena.ctx.lineWidth = this.arena.buffer/10;
		this.arena.ctx.lineCap = 'round'
		this.arena.ctx.stroke();

		}
	}
	// console.log("")

	this.registerMovement = function() {
		$( "html" ).keydown(function( event ) {
			if (event.key=="ArrowLeft") {
				self.omega = -1
				
			}
			if (event.key=="ArrowRight") {
				self.omega = 1
			}
		});
		
		$( "html" ).keyup(function( event ) {
			if (event.key=="ArrowLeft" || event.key=="ArrowRight") {
				self.omega = 0
			}
		});
	}
	this.registerMovement()
}

// define arena object
function arena_object(canvas){
	this.theta = 0
	this.OMEGA = new vector([0,0,.0])
	this.perspectiveomega = 0
	this.canvas = canvas
	this.ctx = canvas.getContext('2d')
	this.w = canvas.width
	this.h = canvas.height
	this.center = new vector([this.w/2,this.h/2])
	this.buffer = Math.min(this.w/20,this.h/20)
	this.radius = Math.min(this.w/2-this.buffer,this.h/2-this.buffer)

	this.render = function(){
		this.ctx.translate(this.w/2, this.h/2);
		this.ctx.rotate(  this.perspectiveomega)
		this.theta += this.perspectiveomega
		// console.log(this.theta)
		this.ctx.translate(-this.w/2, -this.h/2);

		this.ctx.beginPath();
		this.ctx.arc(this.center.x,this.center.y, this.radius ,0,2*Math.PI, false)
		this.ctx.fillStyle = "rgb(255,255,255,.1)"
		this.ctx.lineWidth = 5;
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.arc(this.center.x,this.center.y, this.radius -this.buffer,0, Math.PI*2, false)
		this.ctx.strokeStyle = 'rgba(240,240,240,.25)';
		this.ctx.lineWidth = this.buffer/100;
		this.ctx.lineCap = 'round'
		this.ctx.stroke();
	}

	this.render()
}

function ball_object(arena,player){

	
	this.pos = new vector([player.radius*Math.cos(player.theta),player.radius*Math.sin(player.theta),0])
	this.pos = new vector([300,0,0])
	this.vel = new vector([0,2,0])
	this.hist = []
	
	this.render = function(){

		if (this.pos.magnitude()>player.radius-2.5) {
			normalizedpos = this.pos.norm()
			vr = this.vel.project(this.pos.norm()).scale(-1)
			vt = this.vel.project(this.pos.cross(new vector([0,0,1]))).scale(1)
			this.vel = vr.add(vt)
		}

		r = this.pos.magnitude()
		theta = Math.atan2(this.pos.y,this.pos.x)+Math.PI+Math.PI

		// 			console.log(r-player.radius)
			// if (Math.abs(r-player.radius)<10) {
			// 	console.log(theta)
			// 	console.log((player.theta+player.angularSize/2)% Math.PI*2+Math.PI*2)
			// 	console.log("")
			// 	if (theta>(player.theta-player.angularSize/2) % Math.PI*2+Math.PI*2 && theta<(player.theta+player.angularSize/2) % Math.PI*2+Math.PI*2) {

			// 	this.vel = this.vel.scale(-1)
			// }
			// }
		// }

		
		this.pos=this.pos.add(this.vel)
		if (document.getElementById("showpath").checked ) {

			state = [this.pos,arena.theta]
		this.hist.push([...state])
		console.log(this.hist[1])
		for (var i = this.hist.length - 1; i >= 0; i--) {
			pos = this.hist[i][0]
			theta = -this.hist[i][1]+arena.theta
			// console.log(theta)
			x = pos.dot(new vector([Math.cos(theta),-Math.sin(theta),0]))
			y = pos.dot(new vector([Math.sin(theta),Math.cos(theta),0]))
			z = pos.dot(new vector([0,0,1]))
			pos = new vector([x,y,z])

			if (this.hist.length>1000) {this.hist.shift()}

			
		
			arena.ctx.beginPath();
		arena.ctx.arc(pos.x+arena.center.x,pos.y+arena.center.y, 1 ,0,2*Math.PI, false)
		arena.ctx.fillStyle = "rgba(255,255,255,1)"
		
		
		arena.ctx.lineWidth = 5;
		arena.ctx.fill();
		// arena.ctx.translate(-arena.w/2, -arena.h/2);
		}
		}

		arena.ctx.beginPath();
		arena.ctx.arc(this.pos.x+arena.center.x,this.pos.y+arena.center.y, 5 ,0,2*Math.PI, false)
		arena.ctx.fillStyle = "rgba(255,255,255,1)"
		arena.ctx.lineWidth = 5;
		arena.ctx.fill();
		

		// arena.ctx.translate(pos.x,this.pos.y);
		// arena.ctx.rotate(-arena.OMEGA.magnitude())
		// arena.ctx.translate(-this.pos.x,-this.pos.y);

	}
}

window.addEventListener('load', function () {
var w         = $( window ).width(),
h             = $( window ).height()-$( "#input_panel" ).first().innerHeight(),
canvas        = $( "#game_world" )[0];
canvas.width  = w
canvas.height = h


arena = new arena_object(canvas)
test = new player_object(arena)
ball1 = new ball_object(arena,test)
ball2 = new ball_object(arena,test)
ball2.vel = new vector([1,0,0])
// A single step of the animation
function renderStep()
{
  // Clears the canvas for new visuals
  arena.ctx.clearRect(0, 0, arena.canvas.width, arena.canvas.height);
  
  arena.render()
  test.render()
  ball1.render()
  ball2.render()

  // z = document.getElementById("Object").value
  // arena.OMEGA = new vector([0,0,z])
  
  refrenceRotation = parseFloat(document.getElementById("Refrence").value)
  arena.perspectiveomega = refrenceRotation
  
  


  window.requestAnimationFrame(renderStep);
}
window.requestAnimationFrame(renderStep);
})
function cart_to_pol(vec){

}
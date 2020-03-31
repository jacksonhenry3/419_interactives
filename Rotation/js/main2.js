// define arena object
function arena_object(canvas){
	this.theta = 0
	this.perspective_omega = 0
	this.canvas = canvas
	this.ctx = canvas.getContext('2d')
	this.w = canvas.width
	this.h = canvas.height
	this.center = new vector([this.w/2,this.h/2])
	this.buffer = Math.min(this.w/20,this.h/20)
	this.real_radius = Math.min(this.w/2-this.buffer,this.h/2-this.buffer)
	this.radius = 1
	this.scale = this.real_radius/this.radius
	this.number_of_motion_indicators = 12
	this.motion_indicator_width = .3
	this.dt = .1
	this.indicator_radius = .95

	this.arc = function(start,stop, radius = 1, width = 1./50.,color = 'rgba(240,240,240,.4)')
	{
		this.ctx.beginPath();
		this.ctx.arc(this.center.x,this.center.y, radius*this.scale ,start, stop)
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = this.buffer*width;
		this.ctx.lineCap = 'round'
		this.ctx.stroke();
	}

	this.circle = function(pos, radius, color = "rgb(255,255,255,.1)")
	{
		this.ctx.beginPath();
		this.ctx.arc(this.center.x+pos.x*this.scale,this.center.y-pos.y*this.scale, radius*this.scale ,0, Math.PI*2)
		this.ctx.fillStyle = color
		this.ctx.fill();
	}

	this.getcoords = function(vec)
	{
		return(new vector([this.center.x+vec.x*this.scale,this.center.y-vec.y*this.scale]))
	}

	this.update = function()
	{
		this.theta+=this.perspective_omega*this.dt
	}

	this.render = function(){

		this.update()

		this.circle(zeroVector(2),this.radius)

		this.arc(0,2*Math.PI,radius = this.indicator_radius)

		for (var i = this.number_of_motion_indicators - 1; i >= 0; i--) {
			gap = Math.PI*2/(this.number_of_motion_indicators)
			width = gap*this.motion_indicator_width
			start = this.theta+i*gap-width/2
			stop = start+width
			color = "rgba(200,200,200)"
			if (i%2==1) {color = 'rgb(34,34,34)'}
			this.arc(start,stop,radius = this.indicator_radius, width = 1/5,color = color)
		}
	}

	this.render()
}

function ball_object(arena){

	this.pos = new vector([0,0])
	this.vel = new vector([0,0])
	this.hist = []
	this.render_radius = .02

	this.collision_check = function()
	{
		// check for a collision with the edge and reverse the radial component of velocity
		if (this.pos.magnitude()>arena.indicator_radius-this.render_radius) {
			normalizedpos = this.pos.norm()
			vr = this.vel.project(this.pos.norm()).scale(-1)
			vt = this.vel.project(new vector([-this.pos.y,this.pos.x])).scale(1)
			this.vel = vr.add(vt)
		}
	}

	this.update = function()
	{
		this.collision_check()
		this.pos = this.pos.rotate(-2*arena.perspective_omega*arena.dt)
		this.vel = this.vel.rotate(-2*arena.perspective_omega*arena.dt)
		this.pos = this.pos.add(this.vel.scale(arena.dt))
		this.hist.push(this.pos)
		while (this.hist.length>5000/balls.length) {this.hist.shift()}
	}
	
	this.render = function()
	{
		arena.circle(this.pos,this.render_radius,color = "rgb(255,255,255)")

		arena.ctx.beginPath();
		arena.ctx.strokeStyle = "rgba(255,255,255,.4)";
		arena.ctx.lineWidth = 2*this.render_radius*arena.scale;
		arena.ctx.lineWidth = 2*this.render_radius*arena.scale*.1;
		arena.ctx.lineJoin = "round";
		for (var i = this.hist.length - 1; i >= 0; i--) {
			pos = this.hist[i]
			arena.ctx.lineWidth = 0;
			arena.ctx.lineTo(pos.x*arena.scale+arena.center.x,arena.center.y-pos.y*arena.scale);

			// arena.circle(pos,this.render_radius/10,color = "rgba(255,255,255,.5)")
		}
		arena.ctx.stroke();
	}
}

window.addEventListener('load', function () {
var w         = $( window ).width(),
h             = $( window ).height()-$( "#input_panel" ).first().innerHeight(),
canvas        = $( "#game_world" )[0];
canvas.width  = w
canvas.height = h

arena = new arena_object(canvas)
balls = []

function renderStep()
{
  // Clears the canvas for new visuals
  arena.ctx.clearRect(0, 0, arena.canvas.width, arena.canvas.height);
  
  arena.update()

  arena.render()

  for (var i = balls.length - 1; i >= 0; i--) {
  	ball = balls[i]
  	ball.update()
  	ball.render()
  }
  
  refrenceRotation = parseFloat(document.getElementById("Refrence").value)
  arena.perspective_omega = refrenceRotation
  
  if (!document.getElementById("showpath").checked ) {
  window.requestAnimationFrame(renderStep);
	}
}
window.requestAnimationFrame(renderStep);



function registerMouseEvents() {
	var ball;
  $( "#game_world" ).mousedown(function( event ) {
    mouse = new vector([event.pageX,event.offsetY])
    mouse = mouse.subtract(arena.center)
    mouse = mouse.scale(1/arena.scale)
    mouse_down_pos = new vector([mouse.x,-mouse.y])
    // console.log(mouse_down_pos.magnitude)
    if (mouse_down_pos.magnitude()<arena.indicator_radius) 
    {
    	console.log(mouse_down_pos)
    	ball = new ball_object(arena)
    	ball.pos = mouse_down_pos
    	ball.pos = snap(ball.pos,mouse_down_pos,zeroVector(2))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([0,.5]))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([0,-.5]))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([.5,0]))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([-.5,0]))
	    
	    balls.push(ball)
	    ball.render()

	    $( "#game_world" ).mouseup(function( event ) {

			mouse = new vector([event.pageX,event.offsetY])
			mouse = mouse.subtract(arena.center)
			mouse = mouse.scale(1/arena.scale)
			mouse_up_pos = new vector([mouse.x,-mouse.y])

			vel  = mouse_down_pos.subtract(mouse_up_pos).scale(.25)
			if (vel.norm().x<.1) {vel = new vector([0,vel.y])}
			if (vel.norm().y<.1) {vel = new vector([vel.x,0])}
			ball.vel = vel

	    
	});
	}
  });
}

$("#showpath").click(function() {
	window.requestAnimationFrame(renderStep);
});

registerMouseEvents()

})

function snap(old_pos,mouse_pos,location) {

	if (mouse_pos.subtract(location).magnitude()<.15)
	{
		console.log(mouse_pos.subtract(location).magnitude()<.15)
		return(location)
	}
	else
	{
		console.log(old_pos)
		return(old_pos)
	}

}
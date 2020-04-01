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
	this.t = 0

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

	this.path = function(points,width = .01, color = "rgb(255,255,255)")
	{
		this.ctx.beginPath();
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = width*this.scale;
		this.ctx.lineJoin = "round";
		for (var i = points.length - 1; i >= 0; i--) {
			point = points[i]
			this.ctx.lineTo(point.x*this.scale+this.center.x,this.center.y-point.y*this.scale);
		}
		this.ctx.stroke();
	}

	this.getcoords = function(vec)
	{
		return(new vector([this.center.x+vec.x*this.scale,this.center.y-vec.y*this.scale]))
	}

	this.update = function()
	{
		this.theta+=this.perspective_omega*this.dt
		this.t+=this.dt
	}

	this.render = function(){


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
	this.hue = 0
	this.color = function(s,b){"hsl("+this.hue+","+s+"%,"+b+"%)"}

	this.collision_check = function()
	{
		// check for a collision with the edge and reverse the radial component of velocity
		if (this.pos.magnitude()>arena.indicator_radius-this.render_radius) {
			normalizedpos = this.pos.norm()
			vr = this.vel.project(this.pos.norm()).scale(-1)
			vt = this.vel.project(new vector([-this.pos.y,this.pos.x])).scale(1)
			this.vel = vr.add(vt)

			if (document.getElementById("pauseoncolide").checked) {document.getElementById("pause").checked = true}
			
		}
	}

	this.update = function()
	{
		this.collision_check()
		this.pos = this.pos.rotate(-arena.perspective_omega*arena.dt)
		this.vel = this.vel.rotate(-arena.perspective_omega*arena.dt)
		this.pos = this.pos.add(this.vel.scale(arena.dt))
		this.hist.push([...[this.pos,arena.theta,arena.t]])
		while (this.hist.length>2000/balls.length) {this.hist.shift()}
	}
	
	this.render = function()
	{
		
		


		if (document.getElementById("show_true_path").checked ) {
			var color = "hsl("+this.color_rgb_list[0]+",40%,40%)"
			true_tail = []
			for (var i = this.hist.length - 1; i >= 0; i--) {
				ref_theta = this.hist[i][1]
				true_tail.push(this.hist[i][0].rotate(ref_theta-arena.theta))
			}
			arena.path(true_tail,width = .0025,color = color)
		}

		if (document.getElementById("show_aparant_path").checked ) {
			var color = "hsl("+this.color_rgb_list[0]+",60%,60%)"
			aparant_tail = []
			for (var i = this.hist.length - 1; i >= 0; i--) {
				ref_theta = this.hist[i][1]
				pos = this.hist[i][0].rotate(ref_theta-arena.theta)
				pos = pos.rotate(-arena.perspective_omega*(this.hist[i][2]-arena.t))
				aparant_tail.push(pos)
			}
			arena.path(aparant_tail,width = .0025,color = color)
		}

		var color = "hsl("+this.color_rgb_list[0]+",70%,70%)"
		arena.circle(this.pos,this.render_radius,color = color)
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
  
  

  if (!document.getElementById("pause").checked ) {
  // update the arena position
  arena.update()
  }

  // render the arena
  arena.render()

  // for each ball update its position and then render
  for (var i = balls.length - 1; i >= 0; i--) {
  	ball = balls[i]

  	if (!document.getElementById("pause").checked )
  	{
  		ball.update()
    }

  	ball.render()
  }
  
  launchVector()
  //check if the user has modified the rotation speed
  refrenceRotation = parseFloat(document.getElementById("Refrence").value)
  arena.perspective_omega = refrenceRotation
  
  

  
  window.requestAnimationFrame(renderStep);

}

// start the loop
window.requestAnimationFrame(renderStep);


var mousedown = false
var mouse_down_pos;
var launchVector = function(){};

function registerMouseEvents() {
	var ball;
  
  if (! touch) {
   		$( "#game_world" ).mousemove(function( event ) {

   			 if (mousedown) 
   			{

	   			mouse = new vector([event.pageX,event.offsetY])
	    		mouse = mouse.subtract(arena.center)
	    		mouse = mouse.scale(1/arena.scale)
	    		mouse = new vector([mouse.x,-mouse.y])
	    		diff = mouse_down_pos.subtract(mouse).norm()
	    		perp = new vector([-diff.y,diff.x]).norm().scale(.03)
	    		p1 = mouse_down_pos.subtract(diff.scale(.1)).add(perp).add(diff.scale(.05))
	    		p2 = mouse_down_pos.subtract(diff.scale(.1)).add(perp.scale(-1)).add(diff.scale(.05))
	    		launchVector = function(){arena.path([p1,mouse_down_pos,p2,mouse_down_pos,mouse,mouse],width = .005,color = "rgb(255,255,255)")}
	   			
   			}
   			else
   			{
   				launchVector = function(){}
   			}
   		});}
   
  $( "#game_world" ).mousedown(function( event ) {
    mouse = new vector([event.pageX,event.offsetY])
    mouse = mouse.subtract(arena.center)
    mouse = mouse.scale(1/arena.scale)
    mouse_down_pos = new vector([mouse.x,-mouse.y])
    // console.log(mouse_down_pos.magnitude)
    if (mouse_down_pos.magnitude()<arena.indicator_radius) 
    {
    	// console.log(mouse_down_pos)
    	ball = new ball_object(arena)
    	ball.pos = mouse_down_pos
    	ball.pos = snap(ball.pos,mouse_down_pos,zeroVector(2))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([0,.5]))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([0,-.5]))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([.5,0]))
    	ball.pos = snap(ball.pos,mouse_down_pos,new vector([-.5,0]))
    	mouse_down_pos = ball.pos
	    ball.color_rgb_list = [Math.floor(Math.random()*360),Math.floor(Math.random()*255),Math.floor(Math.random()*255)]
	    balls.push(ball)
	    ball.render()
	    mousedown = true
	    

	    if (touch) {ball.vel = new vector([0,.1])}

	    if (! touch) {
	    $( "#game_world" ).on("touchend mouseup",function( event ) {
	    	mousedown = false
	    	event.preventDefault() 

			mouse = new vector([event.pageX,event.offsetY])
			mouse = mouse.subtract(arena.center)
			mouse = mouse.scale(1/arena.scale)
			mouse_up_pos = new vector([mouse.x,-mouse.y])

			vel  = mouse_down_pos.subtract(mouse_up_pos).scale(.25)
			// console.log(vel)
			if (Math.abs(vel.norm().x)<.1) {vel = new vector([0,vel.y])}
			if (Math.abs(vel.norm().y)<.1) {vel = new vector([vel.x,0])}
			console.log(vel)
			ball.vel = vel

	    
	});}


	}
  });
}

$("#showpath").click(function() {
	window.requestAnimationFrame(renderStep);
});

$("#Clear").click(function() {
	balls = []
	arena.ctx.clearRect(0, 0, arena.canvas.width, arena.canvas.height);
});

$("#stopOnColide").click(function() {
	balls = []
	arena.ctx.clearRect(0, 0, arena.canvas.width, arena.canvas.height);
});

var touch = false;
window.addEventListener('touchstart', function() {
  touch = true
});

registerMouseEvents()

})


// change this so it doesn't need mouse pos only old pos
function snap(old_pos,mouse_pos,location) {

	if (mouse_pos.subtract(location).magnitude()<.15)
	{
		// console.log(mouse_pos.subtract(location).magnitude()<.15)
		return(location)
	}
	else
	{
		// console.log(old_pos)
		return(old_pos)
	}

}
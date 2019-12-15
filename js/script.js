var RENDERER = {
	WATCH_INTERVAL : 100,
	INIT_COUNT : 10,
	
	init : function(){
		this.setParameters();
		this.setup();
		this.reconstructMethods();
		this.bindEvent();
		this.render();
	},
	setParameters : function(){
		this.$window = $(window);
		this.$container = $('#jsi-butterflies-container');
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.$canvas = $('<canvas />').appendTo(this.$container);
		this.context = this.$canvas.get(0).getContext('2d');
		this.butterflies = [];
		this.watchIds = [];
	},
	setup : function(){
		this.butterflies.length = 0;
		this.watchIds.length = 0;
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.$canvas.attr({width : this.width, height : this.height});
		this.createButterflies();
		this.count = this.getRandomValue(10, 30);
		this.x = 0;
		this.on = false;
	},
	createButterflies : function(){
		var count = this.getRandomValue(10, 30);
		
		for(var i = 0; i < this.INIT_COUNT; i++){
			var butterfly = new BUTTERFLY(this);
			this.butterflies.push(butterfly);
			butterfly.modify(count);
			count += this.getRandomValue(10, 30);
		}
	},
	reconstructMethods : function(){
		this.watchWindowSize = this.watchWindowSize.bind(this);
		this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
		this.render = this.render.bind(this);
	},
	bindEvent : function(){
		this.$window.on('resize', this.watchWindowSize);
		this.$container.on('mousemove', this.setMousePosition.bind(this, true));
		this.$container.on('mouseleave', this.setMousePosition.bind(this, false));
	},
	setMousePosition : function(on, event){
		this.on = on;
		this.x = event.clientX - this.$container.offset().left + this.$window.scrollLeft();
	},
	watchWindowSize : function(){
		this.clearTimer();
		this.tmpWidth = this.$window.width();
		this.tmpHeight = this.$window.height();
		this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
	},
	clearTimer : function(){
		while(this.watchIds.length > 0){
			clearTimeout(this.watchIds.pop());
		}
	},
	jdugeToStopResize : function(){
		var width = this.$window.width(),
			height = this.$window.height(),
			stopped = (width == this.tmpWidth && height == this.tmpHeight);
			
		this.tmpWidth = width;
		this.tmpHeight = height;
		
		if(stopped){
			this.setup();
		}
	},
	getRandomValue : function(min, max){
		return min + (max - min) * Math.random();
	},
	render : function(){
		requestAnimationFrame(this.render);
		this.context.fillStyle = 'hsla(0, 0%, 0%, 0.5)';
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.save();
		
		for(var i = this.butterflies.length - 1; i >= 0; i--){
			if(!this.butterflies[i].render(this.context)){
				this.butterflies.splice(i, 1);
			}
		}
		if(--this.count < 0){
			this.count = this.getRandomValue(10, 30);
			this.butterflies.push(new BUTTERFLY(this));
		}
		this.context.restore();
	}
};
var BUTTERFLY = function(renderer){
	this.renderer = renderer;
	this.init();
};
BUTTERFLY.prototype = {
	DELTA_THETA : Math.PI / 50,
	DELTA_PHI : Math.PI / 100,
	THRESHOLD : 100,
	FRICTION : 0.98,
	SCALE_COEFFICIENT : 0.002,
	
	init : function(){
		this.theta = 0;
		this.phi = 0;
		this.scale = 0.3;
		this.x = this.renderer.width / 2;
		this.y = this.renderer.height + this.THRESHOLD * this.scale;
		this.vx0 = this.renderer.getRandomValue(-1, 1);
		this.vx = 0;
		this.vy = -3;
		this.ax = 0;
		this.swingRate = this.renderer.getRandomValue(0.5, 1.5);
		this.hue0 = 220;
		this.hue = this.hue0;
	},
	modify : function(count){
		for(var i = 0; i < count; i++){
			this.controlPosition();
		}
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y);
		context.rotate(Math.atan2(this.vx, -this.vy) / 10);
		context.scale(this.scale, this.scale);
		
		for(var i = -1; i <= 1; i += 2){
			context.save();
			context.scale(i, 1);
			
			var gradient = context.createRadialGradient(0, 0, 0, 0, 0, 80),
				rate = Math.sin(this.theta / 4);
			gradient.addColorStop(0, 'hsl(' + this.hue + ', 80%, 40%)');
			gradient.addColorStop(0.3, 'hsl(' + this.hue + ', 80%, ' + (40 + 10 * rate) +  '%)');
			gradient.addColorStop(0.5, 'hsl(' + this.hue + ', 80%, ' + (40 + 20 * rate) +  '%)');
			gradient.addColorStop(1, 'hsl(' + this.hue + ', 80%, ' + (40 + 30 * rate) +  '%)');
			context.lineWidth = 3;
			context.strokeStyle = 'hsl(' + this.hue + ', 80%, 80%)';
			context.fillStyle = gradient;
			
			context.save();
			context.scale(0.8 + 0.2 * Math.cos(this.theta + Math.PI / 10), 1);
			context.beginPath();
			context.moveTo(-3, 0);
			context.bezierCurveTo(-40, -10, -60, 20, -30, 40);
			context.bezierCurveTo(-20, 50, -10, 50, -3, -5);
			context.closePath();
			context.fill();
			context.stroke();
			context.restore();
			
			context.save();
			context.scale(0.8 + 0.2 * Math.cos(this.theta), 1);
			context.beginPath();
			context.moveTo(-3, -5);
			context.bezierCurveTo(-25, -60, -75, -55, -65, -35);
			context.bezierCurveTo(-55, -10, -65, 5, -3, 0);
			context.closePath();
			context.fill();
			context.stroke();
			context.restore();
			
			context.lineWidth = 2;
			context.strokeStyle = 'hsl(220, 80%, 80%)';
			context.beginPath();
			context.moveTo(-2, -10);
			context.bezierCurveTo(-5, -20, -3 - Math.sin(this.theta), -30, -8 - Math.sin(this.theta), -40);
			context.stroke();
			context.restore();
		}
		context.save();
		context.scale(this.scale, this.scale);
		var gradient = context.createLinearGradient(-3, 0, 3, 0);
		gradient.addColorStop(0, 'hsl(' + this.hue + ', 80%, 40%)');
		gradient.addColorStop(0.5, 'hsl(' + this.hue + ', 80%, 60%)');
		gradient.addColorStop(1, 'hsl(' + this.hue + ', 80%, 40%)');
		context.fillStyle = gradient;
		context.beginPath();
		context.moveTo(0, -10);
		context.arc(0, -10, 3, 0, Math.PI * 2, false);
		context.fill();
		
		context.beginPath();
		context.moveTo(3, -8);
		context.arc(0, -8, 3, 0, Math.PI, false);
		context.stroke();
		context.arcTo(0, 60, 3, -8, 2);
		context.fill();
		context.restore();
		context.restore();
		this.controlPosition();
		return this.x > -this.THRESHOLD && this.x < this.renderer.width + this.THRESHOLD && this.y > -this.THRESHOLD;
	},
	controlPosition : function(){
		this.theta += this.DELTA_THETA;
		this.theta %= Math.PI * 4;
		this.phi += this.DELTA_PHI;
		this.phi %= Math.PI * 2;
		this.ax += this.renderer.on ? (this.x >= this.renderer.x ? 1 : -1) * (1 - Math.pow(Math.abs(this.x - this.renderer.x) / this.renderer.width), 2) / 30 : 0;
		this.ax *= this.FRICTION;
		this.vx = this.vx0 + Math.sin(this.phi) * this.swingRate + this.ax;
		this.x += this.vx * this.scale;
		this.y += this.vy * this.scale;
		this.scale += this.SCALE_COEFFICIENT;
		this.hue = this.hue0 - this.ax * 30;
	}
};
$(function(){
	RENDERER.init();
});
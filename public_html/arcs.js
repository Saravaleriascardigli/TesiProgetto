/* arcs */

var circle, origX, origY, isDown = false, gestures = [], gesture = [];

canvas.on('mouse:down', function(o){
	isDown = true;
	var pointer = canvas.getPointer(o.e);
	origX = pointer.x;
	origY = pointer.y;
	circle = new fabric.Circle({
		left: origX,
		top: origY,
		originX: 'left',
		originY: 'top',
		startAngle: 0,
		endAngle: Math.PI / 2,
	//	startAngle: -3.14,
	//	endAngle: -1.57,
		radius: pointer.x-origX,
		angle: 0,
		fill: '',
		stroke:'black',
		strokeWidth:2,
	});
	canvas.add(circle);
});

canvas.on('mouse:move', function(o){
	if (!isDown) return;
	var pointer = canvas.getPointer(o.e);
	var radius = Math.max(Math.abs(origY - pointer.y),Math.abs(origX - pointer.x))/2;
	if (radius > circle.strokeWidth) {
		radius -= circle.strokeWidth/2;
	}
	circle.set({ radius: radius});

	if(origX>pointer.x){
		circle.set({originX: 'right' });
	} else {
		circle.set({originX: 'left' });
	}
	if(origY>pointer.y){
		circle.set({originY: 'bottom'  });
	} else {
		circle.set({originY: 'top'  });
	}
	canvas.renderAll();
});

canvas.on('mouse:up', function(o){
	isDown = false;
	var pointer = canvas.getPointer(o.e);
	gesture.x0 = origX;
	gesture.y0 = origY;
	gesture.x1 = pointer.x;
	gesture.y1 = pointer.y;
	gestures.push(gesture);
	console.log(gesture);
});

/**
**/
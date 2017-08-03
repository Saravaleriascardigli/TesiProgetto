/* lines */

/**
**/

var line, isDown = false, gestures = [], gesture = [];

canvas.on('mouse:down', function(o){
	isDown = true;
	var pointer = canvas.getPointer(o.e);
	gesture.x0 = pointer.x;
	gesture.y0 = pointer.y;
	var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
	line = new fabric.Line(points, {
		strokeWidth: 2,
		fill: 'gray',
		stroke: 'black',
		originX: 'center',
		originY: 'center',
		selectable:false
	});
	canvas.add(line);
});

canvas.on('mouse:move', function(o){
	if (!isDown) return;
	var pointer = canvas.getPointer(o.e);
	line.set({ x2: pointer.x, y2: pointer.y });
	canvas.renderAll();
});

canvas.on('mouse:up', function(o){
	isDown = false;
	var pointer = canvas.getPointer(o.e);
	gesture.x1 = pointer.x;
	gesture.y1 = pointer.y;
	gestures.push(gesture);
	console.log(gesture);
});



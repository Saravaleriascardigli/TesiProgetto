/* globals */

//	create a wrapper around native canvas element (with id="grid")
//	var canvas = new fabric.Canvas('grid');
var canvas = new fabric.Canvas('grid', { selection: false });

//	BEGIN gridData

// create a rectangle object
var rect = new fabric.Rect({
	left: 0,
	top: 0,
//	stroke: "#ccc",
	fill: "#ffc",
	width: canvas.width+2,
	height: canvas.height+2,
	selectable:false
});

// "add" rectangle onto canvas
canvas.add(rect);

function gridData (width = 25) {
	var	rows = canvas.width / width + 0.5, 
		cols = canvas.height / width + 0.5;
	var max = width * cols + 2;
	for (var n = 0;  n <= rows;  n++) {
		canvas.add(new fabric.Line([0, width*n+1, max, width*n+1],{ 
			stroke: "#ccc",
			strokeWidth: 1, 
			strokeDashArray: [1, 0],
			selectable:false
		}));
	}
	var max = width * rows + 2;
	for (var n = 0;  n <= cols;  n++) {
		canvas.add(new fabric.Line([width*n+1, 0, width*n+1, max],{ 
			stroke: "#ccc",
			strokeWidth: 1, 
			strokeDashArray: [1, 0],
			selectable:false
		}));
	}
return canvas;
}

gridData();

//	END gridData

/**
**/

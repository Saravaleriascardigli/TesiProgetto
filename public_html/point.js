//	POINTS

var gestures = [], gesture = [],
	line = d3.line()        // create a new line generator
	.curve(d3.curveBasis);  // a cubic basis spline, repeating the end points

var svg = d3.select("svg")  // select an element and call a function on it
	.call(d3.drag()         // create a drag behavior
		.container(function() { return this; }) // "drag.container" set the coordinate system
		.subject(function() // "drag.subject" set the thing being dragged
			{ var p = [d3.event.x, d3.event.y]; return [p, p]; })
		// listen for drag events
		.on("end", dragended)
	);

function dragstarted() {
var	d = d3.event.subject, // "d3.event" the current user event, during interaction
	active = svg.append("path").datum(d), // create, append and select new elements
                                  // "datum" get or set element data (without joining)
	x0 = d3.event.x,
	y0 = d3.event.y;
	gesture.x0 = x0;
	gesture.y0 = y0;
}

function dragended() {
var	d = d3.event.subject, // "d3.event" the current user event, during interaction
	active = svg.append("path").datum(d);
	gesture.x = d3.event.x;
	gesture.y = d3.event.y;
	gestures.push(gesture);
	console.log(gesture);

//	d[d.length - 1] = [x1, y1];
	active.attr("d", line); // select the active transition for a given node
}

//	cons.push(point);
//var	cons = console.log(gestures);

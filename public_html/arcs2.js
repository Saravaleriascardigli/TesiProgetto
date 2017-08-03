//	ARCS 2

var arc = d3.arc()        // create a new arc generator
    .innerRadius(100)
    .outerRadius(200)
    .startAngle(Math.PI / 4)
    .endAngle(Math.PI / 2);
//	.curve(d3.curveBasis);  // a cubic basis spline, repeating the end points

var svg = d3.select("svg")  // select an element and call a function on it
	.call(d3.drag()         // create a drag behavior
		.container(function() { return this; }) // "drag.container" set the coordinate system
		.subject(function() // "drag.subject" set the thing being dragged
			{ var p = [d3.event.x, d3.event.y]; return [p, p]; })
		// listen for drag events
		.on("start", dragstarted)
		.on("end", dragended)
	);

function dragstarted() {
var	d = d3.event.subject, // "d3.event" the current user event, during interaction
	active = svg.append("path").datum(d), // create, append and select new elements
                                  // "datum" get or set element data (without joining)
	x0 = d3.event.x,
	y0 = d3.event.y;
//	d.push([0, 0]);
//	d.push([250, 250]);
//	d.push([x0, y0]);

	d3.event.on("drag", function() { // listen for drag events on the current gesture
		var	x1 = d3.event.x,
			y1 = d3.event.y,
			dx = x1 - x0,
			dy = y1 - y0,
			mx = x1 > x0 ? x1 : x0,
			my = y1 > y0 ? y1 : y0;
//		d[d.length - 2] = [mx, my];
		d[d.length - 1] = [x1, y1];

//			point = [[x0, y0],[x1, y1]];
//			console.log(point);

//		if (dx * dx + dy * dy > 50000) d.push([x0 = x1, y0 = y1]);
//		else 

//		d[d.length - 1] = [x1, y1];
		active.attr("d", arc); // select the active transition for a given node
	});
}

var	gestures = [];

function dragended() {
var	d = d3.event.subject, // "d3.event" the current user event, during interaction
	last = [d3.event.x, d3.event.y];
	point = [d[0], last];
	gestures.push(point);
	console.log(point);
//	console.log(gestures);
//		d[d.length - 1] = [0, 0];
//		d[d.length] = last;
//		d.attr("d", line); // select the active transition for a given node
}

//	cons.push(point);
//var	cons = console.log(gestures);

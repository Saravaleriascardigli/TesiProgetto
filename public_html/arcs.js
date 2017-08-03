var gestures = [], gesture = [],
	arc = d3.arc()
	.outerRadius(100)
	.innerRadius(100)
	.startAngle(Math.PI/2)
	.endAngle(Math.PI);

//	var path = d3.select('svg').append('path').attr('d', arc);
//	var path = d3.select('svg').append('path');

//	LINES

var line = d3.line()        // create a new line generator
	.curve(d3.curveBasis);  // a cubic basis spline, repeating the end points

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
	gesture.x0 = x0;
	gesture.y0 = y0;

	var path = d3.select('svg').append('path');
	d3.event.on("drag", function() { // listen for drag events on the current gesture
		var	x1 = d3.event.x,
			y1 = d3.event.y,
			dx = x1 - x0,
			dy = y1 - y0;


		d[d.length - 1] = [x1, y1];
//		active.attr("d", line); // select the active transition for a given node

		path.attr("transform", "translate(" + x0 + "," + y0 + ")");
		radius = Math.sqrt(dx*dx + dy*dy);
		arc.innerRadius(radius).outerRadius(radius);
		if (dx >= 0) {
			arc.startAngle(Math.PI/2)
			.endAngle(dy < 0 ? 0.0 : Math.PI);
		} else {
			arc.startAngle(-Math.PI/2)
			.endAngle(dy < 0 ? 0.0 : -Math.PI);
		}
		path.attr('d', arc);
	//	path = d3.select('svg').append('path').attr('d', arc);
	});
}

function dragended() {
//	var	d = d3.event.subject; // "d3.event" the current user event, during interaction
//	gesture.x1 = gesture.x0 + dx;
//	gesture.y1 = gesture.y0;
//	gesture.y0 = gesture.y0 + dy;
	gesture.x1 = d3.event.x;
	gesture.y1 = d3.event.y;
	gestures.push(gesture);
	console.log(gesture);
}

//	point = [[x0, y0],[x1, y1]];
//	point = [d[0], [d3.event.x, d3.event.y]];
//	gestures.push(point);
//	console.log(point);

//	cons.push(point);
//var	cons = console.log(gestures);
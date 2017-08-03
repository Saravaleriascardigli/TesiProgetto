//	SHAPES

var gestures = [], xa, ya, xb, yb, element = [],
	line = d3.line()		// create a new line generator
		.curve(d3.curveBasis),	// a cubic basis spline, repeating the end points
	arc = d3.arc()			// create a new arc generator
		.outerRadius(100)
		.innerRadius(100)
		.startAngle(Math.PI/2)
		.endAngle(Math.PI);

element.shape = "point";
element.shape = "arc";
element.shape = "line";

var svg = d3.select("svg")  // select an element and call a function on it
	.call(d3.drag()         // create a drag behavior
		.container(function() { return this; }) // "drag.container" set the coordinate system
		.subject(function() // "drag.subject" set the thing being dragged
			{ var p = [d3.event.x, d3.event.y]; return [p, p]; })
		// listen for drag events
		.on("start", dragstarted)
		.on("end", dragended)
	);

function dragended() {
	element.xa = xa;
	element.ya = ya;
	if (element.shape == "point") {
		var	d = d3.event.subject,
			active = svg.append("path").datum(d);
		active.attr("d", line);
	} else {
		element.xb = xb;
		element.yb = yb;
	}
	gestures.push(element);
	console.log(element);
}

function dragstarted() {
var	d = d3.event.subject,	// "d3.event" the current user event, during interaction
	active = svg.append("path")	// create, append and select new elements
		.datum(d);	// "datum" get or set element data (without joining)

	xa = d3.event.x;
	ya = d3.event.y;
	if (element.shape == "arc") {
		active.attr("transform", "translate(" + xa + "," + ya + ")");
	}

	if (element.shape != "point")
		d3.event.on("drag", function() {
			// listen for drag events on the current gesture
			xb = d3.event.x;
			yb = d3.event.y;
			d[d.length - 1] = [xb, yb];
			switch (element.shape) {
				case "line":
					active.attr("d", line);
					break;
				case "arc":
					var	dx = xb - xa,
						dy = yb - ya;
					radius = Math.sqrt(dx*dx + dy*dy);
					arc.innerRadius(radius).outerRadius(radius);
					if (dx >= 0) {
						arc.startAngle(Math.PI/2)
						.endAngle(dy < 0 ? 0.0 : Math.PI);
					} else {
						arc.startAngle(-Math.PI/2)
						.endAngle(dy < 0 ? 0.0 : -Math.PI);
					}
					active.attr('d', arc);
					break;
			}
		});
}

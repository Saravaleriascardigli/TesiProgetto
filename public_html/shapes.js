//	SHAPES

function delta2(a) {
var	dx = a.xb - a.xa,
	dy = a.yb - a.ya;
return dx*dx + dy*dy; }

function toLine(a) {
return ["M", a.xa, a.ya, "L", a.xb, a.yb].join(" "); }

function toArc(a) {
var radius = Math.sqrt(delta2(a)),
	dx = a.xb - a.xa,
	dy = a.yb - a.ya,
	sweep = dx*dy < 0 ? 1 : 0,
	xa = a.xa,
	ya = a.ya + (dy > 0 ? radius : -radius),
	xb = a.xa + (dx > 0 ? radius : -radius),
	yb = a.ya;
return ["M", xa, ya, "A", radius, radius, 0, 0, sweep, xb, yb].join(" "); }

function toArc90(a) {
var radius = Math.sqrt(delta2(a)/2.0);
return ["M", a.xa, a.ya, "A", radius, radius, 0, "0", 0, a.xb, a.yb].join(" "); }

function redraw(a) {
	switch (a.shape) {
	case "point":
	case "line":
		return a.attr("d", toLine(a));
	//	break;
	case "arc":
		return a.attr('d', toArc(a));
	//	break;
	}
}


/*
	gestures - vettore che contiene gli SVG generati nel DOM
	element - vettore che contiene i punti della shape usato solo per il log
	shapeType - tipo della shape (linea, punto, arco)
*/

var bgColor = '#fff', shapeColor = '#557', activeColor = '#aaf',
	gestures = [], element = [],
	active = "",
	shapeType = "",
	defaultStatus = "Click a Palette to Start",

	svg = d3.select("svg")  // seleziona l'elemento "svg" e ci richiama sopra la funzione -------------> l'svg lo crea sul momento?
		.call(d3.drag()         // crea un drag behavior
			.container(function() { return this; }) // "drag.container" imposta le coordinate del sistema
			.subject(function() // "drag.subject" imposta ciò che deve essere tracciato col drag
				{ var p = [d3.event.x, d3.event.y]; return [p, p]; })
			// ".on" è in ascolto per gli eventi di drag
			.on("start", dragstarted)
			.on("end", dragended)
		);

d3.select('#statusline').text(defaultStatus);

/*
	La funzione "dragended" viene principalmente usata per mettere da parte 
	il punto iniziale e finale della shape che è stata tracciata. Viene 
	utilizzata anche per il tracciamento vero e proprio del punto.
*/

function dragended() { switch (mode) {
case "move":
//	if (gestures.length < 1) return;
	break;
case "draw":
	// salvo il punto iniziale 
	element.xa = active.xa;
	element.ya = active.ya;
	/*
		 Disegno il punto direttamente in dragended perché in questo
		 modo lo disegno una volta sola al rilascio del mouse; il tracciamento
		 del punto avviene comunque nel primo punto del canvas cliccato.
	*/
	if (active.shape == "point") {
	//	active.attr("d", toLine(active)).style("stroke", activeColor);
		redraw(active).style("stroke", activeColor);
	} else {
		if (delta2(active) == 0) {
			active.remove();
			if (gestures.length > 0) {
				active = gestures[0];
				active.style("stroke", activeColor);
			}
			return ;
		}
		// Se non è un punto, salvo anche il punto finale
		element.xb = active.xb;
		element.yb = active.yb;
	}

// Salvo i punti nel vettore gestures ed effettuo il log nella console
	gestures.unshift(active);
	element.shape = active.shape;
	console.log(element);
	break;
}}

/*
	La funzione "dragstarted" imposta ciò che avviene durante il dragging, 
	ovvero il tracciamento delle shapes.
*/

function dragstarted() { 
var	datum = d3.event.subject;	// indica l'evento corrente durante l'interazione
switch (mode) {
case "move":
	if (gestures.length < 1) return;
	d3.event.on("drag", function() {
		active.xa += d3.event.dx;
		active.ya += d3.event.dy;
		active.xb += d3.event.dx;
		active.yb += d3.event.dy;
		redraw(active);
	});
	break;
case "edit":
	if (gestures.length < 1) return;
	d3.event.on("drag", function() {
		active.xb = d3.event.x;
		active.yb = d3.event.y;
		var s = "M"+active.xa+","+active.ya+"L"+active.xb+","+active.yb;
		active.attr("d", s);
	});
	break;
case "draw":
	active = svg.append("path")	// crea, appende all'svg e seleziona l'elemento "path"
		.datum(datum).attr("class", "shape");	// "datum" imposta il dato, "attr" aggiunge la classe "shape" all'elemento "path"

	active.shape = shapeType;	// aggiungo al vettore "element" l'attributo "shape", che indica la shape che stiamo tracciando
	// imposto il punto iniziale con il punto tracciato dal click
	active.xa = active.xb = d3.event.x;
	active.ya = active.yb = d3.event.y;

	if (gestures.length > 0)
		gestures[0].style("stroke", shapeColor);

	if (active.shape != "point")
		d3.event.on("drag", function() {	// sta in ascolto per l'evento di dragging sulla gesture corrente
			// aggiorno i punti successivi con quelli progressivamente tracciati col dragging
			active.xb = d3.event.x;
			active.yb = d3.event.y;
			datum[datum.length - 1] = [active.xb, active.yb];

		//	controlli sulla tipologia della shape per stabilire cosa e come tracciare

		//	active.style("stroke", delta2(active) == 0 ? bgColor : activeColor);
			if (delta2(active) == 0) 
				active.style("stroke", bgColor);
			else 
				active.style("stroke", activeColor);

			redraw(active);
		});
	break;
}}

/*
	Il codice seguente rende attivi i pulsanti della palette. In base all'indice del bottone, 
	viene fatto partire l'evento del tracciamento della shape corrispondente: il primo bottone 
	corrisponde al punto, il secondo alla linea, il terzo all'arco. Se viene selezionato uno dei
	primi tre bottoni, viene attivata la modalità "draw". Momentaneamente, nel caso venga 
	selezioanto un altro bottone, non viene effettuata alcuna azione.
*/

var	mode = "",
	modes = ["draw", "edit", "move"],
	palette = ["point", "line", "arc", "edit", "move", "prev", "next", "del"],
	previous = 0;

d3.selectAll('circle').on('click', function(d, i) {
var	action = palette[i];

	switch (action) {
	case "point":
	case "line":
	case "arc":
		mode = "draw";
		shapeType = action;
		break;
	case "edit":
	case "move":
		if (gestures.length > 0) 
			mode = action;
		else
			i = -1;
		break;
	case "del":
		i = -1;
		if (gestures.length > 0) {
			gestures.shift().remove();
			if (gestures.length > 0) {
				active = gestures[0];
				active.style("stroke", activeColor);
			} else {
				active = null;
				if (mode != "draw") {
					mode = "";
					previous.style("fill", "#fed");
				}
			}
		}
		break;
	case "prev":
		i = -1;
		if (gestures.length > 1) {
			active = gestures.shift();
			gestures.push(active);
			active.style("stroke", shapeColor);
			active = gestures[0];
			active.style("stroke", activeColor);
		}
		break;
	case "next":
		i = -1;
		if (gestures.length > 1) {
			active = gestures[0];
			active.style("stroke", shapeColor);
			active = gestures.pop();
			gestures.unshift(active);
			active.style("stroke", activeColor);
		}
		break;
	}

	if (i >= 0) {
		if (previous != 0)
			previous.style("fill", "#fed");
		previous = d3.select(this);
		previous.style("fill", "#def");
	}

	if (mode == "")
		d3.select('#statusline').text(defaultStatus);
	else if (mode == "draw")
		d3.select('#statusline').text("draw " + shapeType);
	else
		d3.select('#statusline').text(mode + " " + active.shape);
});

/*
function pathLine(xa, ya, xb, yb) {
return ["M", xa, ya, "L", xb, yb].join(" "); }
*/
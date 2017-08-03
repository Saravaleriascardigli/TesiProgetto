//	SHAPES
/*
	gestures - vettore che contiene gli SVG generati nel DOM
	xa, ya, xb, yb - punti iniziale e finale della shape
	element - vettore che contiene i punti della shape per il log
	shapeType - tipo della shape (linea, punto, arco)
	line - descrizone della linea da tracciare (usata anche per il punto)
	arc - descrizione dell'arco da tracciare
*/
var bgColor = '#fff', shapeColor = '#557', activeColor = '#aaf',
	gestures = [], element = [], delta2 = 0,
	active = "",
	shapeType = "",
	defaultStatus = "Click a Palette to Start",

	line = d3.line()		// crea un generatore di linee
		.curve(d3.curveBasis),	// utilizziamo la curva "curveBasis"

	arc = d3.arc()			// crea un generatore di archi
		.outerRadius(100)	// facciamo in modo di tracciare un quarto di circonferenza 
		.innerRadius(100)
		.startAngle(Math.PI/2)
		.endAngle(Math.PI),

	svg = d3.select("svg")  // seleziona l'elemento "svg" e ci richiama sopra la funzione -------------> l'svg lo crea sul momento?
		.call(d3.drag()         // crea un drag behavior
			.container(function() { return this; }) // "drag.container" imposta le coordinate del sistema
			.subject(function() // "drag.subject" imposta ciò che deve essere tracciato col drag
				{ var p = [d3.event.x, d3.event.y]; return [p, p]; })
			// ".on" è in ascolto per gli eventi di drag
			.on("start", dragstarted)
			.on("end", dragended)
		);

//var	drag = d3.drag();

d3.select('#statusline').text(defaultStatus);

/*
	La funzione "dragended" viene principalmente usata per mettere da parte il punto iniziale e finale della
	shape che è stata tracciata. Viene utilizzata anche per il tracciamento vero e proprio del punto.
*/

function dragended() { switch (mode) {
case "move":
	if (gestures.length < 1) return;
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
	if (element.shape == "point") {
		active.attr("d", line).style("stroke", activeColor);
	} else {
		if (delta2 == 0) {
			active.remove();
			if (gestures.length > 0)
				gestures[0].style("stroke", activeColor);
			return ;
		}
		// Se non è un punto, salvo anche il punto finale
		element.xb = active.xb;
		element.yb = active.yb;
	}

	active.shape = element.shape;
// Salvo i punti nel vettore gestures ed effettuo il log nella console
	gestures.unshift(active);
	console.log(element);
	break;
}}

/*
	La funzione "dragstarted" imposta ciò che avviene durante il dragging, 
	ovvero il tracciamento delle shapes.
*/

function dragstarted() { 
var	d = d3.event.subject;	// indica l'evento corrente durante l'interazione
switch (mode) {
case "move":
	if (gestures.length < 1) return;
//	xa = d3.event.x;
//	ya = d3.event.y;
//	console.log(active);
//	console.log(d[d.length - 1]);
	d3.event.on("drag", function() {
		active.xb = d3.event.x;
		active.yb = d3.event.y;
		var s = "M"+active.xa+","+active.ya+"L"+active.xb+","+active.yb;
		active.attr("d", s);
//		d[d.length - 1] = [active.xb, active.yb];
//		active.datum(d).attr("d", line);
//		d[d.length - 1][0] = active.xb;
//		d[d.length - 1][1] = active.yb;
//		d[0][0] = active.xa;
//		d[0][1] = active.ya;
//		d[d.length - 2][0] = active.xa;
//		d[d.length - 2][1] = active.ya;
//		d[d.length - 1] = [active.xb, active.yb];
//		d[d.length - 1] = [d3.event.x, d3.event.y];
//		active.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
//		active.attr("transform", "translate(" + active.cx + "," + active.cy + ")");
//		active.attr("transform", "translate(" + active.xa + "," + active.ya + ")");
//		active.attr("transform", "translate(" + 100 + "," + 100 + ")");
//		console.log(d);
	});
	break;
case "draw":
	active = svg.append("path")	// crea, appende all'svg e seleziona l'elemento "path"
		.datum(d).attr("class", "shape");	// "datum" imposta il dato, "attr" aggiunge la classe "shape" all'elemento "path"

	element.shape = shapeType;	// aggiungo al vettore "element" l'attributo "shape", che indica la shape che stiamo tracciando
	// imposto il punto iniziale con il punto tracciato dal click
	active.xa = active.xb = d3.event.x;
	active.ya = active.yb = d3.event.y;
	delta2 = 0;

	// se l'elemento è un arco, imposto la traslazione delle coordinate del primo punto dell'arco
	if (element.shape == "arc") {
		active.attr("transform", "translate(" + active.xa + "," + active.ya + ")");
	}

	if (gestures.length > 0)
		gestures[0].style("stroke", shapeColor);

	if (element.shape != "point")
		d3.event.on("drag", function() {	// sta in ascolto per l'evento di dragging sulla gesture corrente
			// aggiorno i punti successivi con quelli progressivamente tracciati col dragging
			active.xb = d3.event.x;
			active.yb = d3.event.y;
			d[d.length - 1] = [active.xb, active.yb];
		var	dx = active.xb - active.xa,	
			dy = active.yb - active.ya;
			delta2 = dx*dx + dy*dy;

		//	controlli sulla tipologia della shape per stabilire cosa e come tracciare

		//	active.style("stroke", delta2 == 0 ? bgColor : activeColor);
			if (delta2 == 0) 
				active.style("stroke", bgColor);
			else 
				active.style("stroke", activeColor);

			switch (element.shape) {
				case "line":
					active.attr("d", line);	// se si tratta di una linea, traccio la linea
					break;
				case "arc":
					/*
						Se si tratta di un arco, calcolo la distanza, in modo tale che il raggio 
						possa rimanere costante durante il dragging per il tracciamento dell'arco
					*/
					radius = Math.sqrt(delta2);
					arc.innerRadius(radius).outerRadius(radius);
					/*
						Cambio la direzione dell'arco in base al quadrante nel quale avviene il dragging 
					*/
					if (dx >= 0) {
						arc.startAngle(Math.PI/2)
						.endAngle(dy < 0 ? 0.0 : Math.PI);
					} else {
						arc.startAngle(-Math.PI/2)
						.endAngle(dy < 0 ? 0.0 : -Math.PI);
					}
					active.attr('d', arc);	// traccio l'arco
					break;
			}
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
				mode = "";
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
		console.log(d3.event.x);
		active
			.attr("cx", d3.event.x)
			.attr("cy", d3.event.y);

	//	active.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
//			.attr("cx", position[0])
//			.attr("cy", position[1]);


		dx = d3.event.x - xa;
		dy = d3.event.y - ya;
		d[d.length - 1][0] += dx;
		d[d.length - 2][0] += dx;
		d[d.length - 1][1] += dy;
		d[d.length - 2][1] += dy;
		active.attr("d", line);
		console.log(d[d.length - 1]);

	var	d = d3.event.subject;
		d[d.length - 1] = [active.xb, active.yb];
		active.attr("d", line);
*/
//	SHAPES
/*
	gestures - vettore che contiene il vettore dei punti da visualizzare nella console
	xa, ya, xb, yb - punti iniziale e finale della shape
	element - vettore che contiene i punti da salvare della shape
	shapeType - tipo della shape (linea, punto, arco)
	line - descrizone della linea da tracciare (usata anche per il punto)
	arc - descrizione dell'arco da tracciare
*/
var strokeColor = '#777', drawColor = '#ccc', bgColor = '#fff',
	gestures = [], xa, ya, xb, yb, delta2, element = [],
	active = "",
	shapeType = "",
	shapeTypes = ["point", "line", "arc"],
	line = d3.line()		// crea un generatore di linee
		.curve(d3.curveBasis),	// utilizziamo la curva "curveBasis"
	arc = d3.arc()			// crea un generatore di archi
		.outerRadius(100)	// facciamo in modo di tracciare un quarto di circonferenza 
		.innerRadius(100)
		.startAngle(Math.PI/2)
		.endAngle(Math.PI);

var svg = d3.select("svg")  // seleziona l'elemento "svg" e ci richiama sopra la funzione -------------> l'svg lo crea sul momento?
	.call(d3.drag()         // crea un drag behavior
		.container(function() { return this; }) // "drag.container" imposta le coordinate del sistema
		.subject(function() // "drag.subject" imposta ciò che deve essere tracciato col drag
			{ var p = [d3.event.x, d3.event.y]; return [p, p]; })
		// ".on" è in ascolto per gli eventi di drag
		.on("start", dragstarted)
		.on("end", dragended)
	);

/*
	La funzione "dragended" viene principalmente usata per mettere da parte il punto iniziale e finale della
	shape che è stata tracciata. Viene utilizzata anche per il tracciamento vero e proprio del punto.
*/

function dragended() { if (shapeType != "") {

	// salvo il punto iniziale 
	element.xa = xa;
	element.ya = ya;
	/*
		 Disegno il punto direttamente in dragended perché in questo
		 modo lo disegno una volta sola al rilascio del mouse; il tracciamento
		 del punto avviene comunque nel primo punto del canvas cliccato.
	*/
	if (element.shape == "point") {
		active.attr("d", line);
	} else {
		if (delta2 == 0) {
			active.remove();
			return ;
		}
		// Se non è un punto, salvo anche il punto finale
		element.xb = xb;
		element.yb = yb;
		var	d = d3.event.subject;
		d[d.length - 1] = [xb, yb];
//		active.attr("d", line);
	}
	active.style("stroke", strokeColor);
	// Salvo i punti nel vettore gestures ed effettuo il log nella console
	gestures.push(element);
	console.log(element);
}}

/*
	La funzione "dragstarted" imposta ciò che avviene durante il dragging, ovvero
	il tracciamento delle shapes.
*/

function dragstarted() { if (shapeType != "") {
var	d = d3.event.subject;	// indica l'evento corrente durante l'interazione
	active = svg.append("path")	// crea, appende all'svg e seleziona l'elemento "path"
		.datum(d).attr("class", "shape");	// "datum" imposta il dato, "attr" aggiunge la classe "shape" all'elemento "path"

	element.shape = shapeType;	// aggiungo al vettore "element" l'attributo "shape", che indica la shape che stiamo tracciando
	// imposto il punto iniziale con il punto tracciato dal click
	xa = xb = d3.event.x;
	ya = yb = d3.event.y;
	// se l'elemento è un arco, imposto la traslazione delle coordinate del primo punto dell'arco
	if (element.shape == "arc") {
		active.attr("transform", "translate(" + xa + "," + ya + ")");
	}

	if (element.shape != "point")
		d3.event.on("drag", function() {	// sta in ascolto per l'evento di dragging sulla gesture corrente
			// aggiorno i punti successivi con quelli progressivamente tracciati col dragging
			xb = d3.event.x;
			yb = d3.event.y;
			d[d.length - 1] = [xb, yb];
		var	dx = xb - xa,	
			dy = yb - ya;
			delta2 = dx*dx + dy*dy;
			// faccio un controllo sulla tipologia della shape per stabilire quale tracciare

	//		active.style("stroke", (xa == xb) && (ya == yb) ? bgColor : drawColor);
	//		active.style("stroke", delta2 == 0 ? bgColor : drawColor);
	//		if ((xa == xb) && (ya == yb)) 
			if (delta2 == 0) 
				active.style("stroke", bgColor);
			else 
				active.style("stroke", drawColor);

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
}}

/*
	Il codice seguente rende attivi i pulsanti della palette. In base all'indice del bottone, 
	viene fatto partire l'evento del tracciamento della shape corrispondente: il primo bottone 
	corrisponde al punto, il secondo alla linea, il terzo all'arco. Se viene selezionato uno dei
	primi tre bottoni, viene attivata la modalità "draw". Momentaneamente, nel caso venga 
	selezioanto un altro bottone, non viene effettuata alcuna azione.
*/

var	mode = "",
	menulist = ["point", "line", "arc", "edit", "delete"];

d3.selectAll('circle').on('click', function(d, i) {
var	selection = menulist[i];
	if ((mode == selection) || (shapeType == selection)) selection = '';
	shapeType = "";
	if (shapeTypes.indexOf(selection) > -1) {	// se il menu è una shape, attivo la modalità draw con la shape corrispondente
		mode = "draw";
		shapeType = selection;
		d3.select('#statusline').text(mode + " " + shapeType);
	} else {	// altrimenti attiviamo altre modalità (in progress)
	//	if (mode == selection) selection = '';
		mode = selection;
		switch (selection) {
		case "edit":
			break;
		case "delete":
			break;
		}
		d3.select('#statusline').text(mode);
	}
});

/*
var	d = d3.event.subject.style("fill", drawColor);
//			active.attr("d", line);
*/
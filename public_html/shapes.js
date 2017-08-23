/*
 *	SHAPES.JS
 */


//	### Routine di uso generale ###

//	calcola e restituisce il quadrato della distanza 
//	tra i due punti a e b della variabile in ingresso
function delta2(item) {
var	dx = item.b.x - item.a.x,
	dy = item.b.y - item.a.y;
return dx*dx + dy*dy; }

//	calcola e restituisce il quadrato della distanza 
//	tra la variabile point e le coordinate x e y
function dist2(point, x, y) {
var	dx = x - point.x,
	dy = y - point.y;
return dx*dx + dy*dy; }

//	calcola e restituisce il quadrato della distanza 
//	dall'estremo più lontano alle coordinate x e y
function maxDist2(item, x, y) {
return Math.max(dist2(item.a, x, y), dist2(item.b, x, y)) }

//	calcola e restituisce l'estremo più vicino alle coordinate x e y
function nearest(item, x, y) {
return (dist2(item.a, x, y) < dist2(item.b, x, y)) ? item.a : item.b }

//	calcola e restituisce il centro del quarto di circonferenza
function arcCenter(item) {
var	c = [],
	sumX = item.b.x + item.a.x,
	difX = item.b.x - item.a.x,
	sumY = item.b.y + item.a.y,
	difY = item.b.y - item.a.y,
	verso = (item.shape == "rev") ? +1 : -1;
	c.x = (sumX + verso * difY) / 2;
	c.y = (sumY - verso * difX) / 2;
return c; }

//	restituisce la descrizione testuale della linea per il path dello SVG
function toLine(item) {
return ["M", item.a.x, item.a.y, "L", item.b.x, item.b.y].join(" "); }

//	restituisce la descrizione testuale dell'arco per il path dello SVG 
//	i punti a e b di item rappresentano gli estremi del quarto d'arco di 
//	circonferenza da tracciare in senso orario o anti-orario, 
//	a seconda del tipo di shape
function toArc(item) {
return ["M", item.a.x, item.a.y, 
	"A", item.radius, item.radius, 0, 0, item.verso, item.b.x, item.b.y].join(" "); }

//	(ri)traccia le varie shape chiamando le opportune funzioni 
//	per generare le corrispondenti descrizioni testuali SVG
function redraw(item) {
	switch (item.shape) {
	case "point":
	case "line":
		return item.attr("d", toLine(item));
	//	break;	// superfluo
	case "arc":
	case "rev":
	//	precalcolo il raggio e le coordinate del centro anche per altri usi (selezione)
		item.center = arcCenter(item);
		item.radius = Math.sqrt(delta2(item)/2.0);
		//	essendo l'arco un quarto di circonferenza, il raggio è pari alla
		//	lunghezza della corda diviso radice di due, quindi per semplicità 
		//	divido direttamente per due delta2(active), che è il quadrato della 
		//	lunghezza della corda, PRIMA di estrarne la radice quadrata
		//	ossia sqrt(d*d) / strt(2) == sqrt(d*d/2)
		item.verso = (item.shape == "rev") ? 0 : 1;
		return item.attr('d', toArc(item));
	//	break;	// superfluo
	}
}


/*
	### Variabili Globali ###

	gestures - vettore che contiene gli SVG generati nel DOM
	element - vettore che contiene i punti della shape usato solo per il log
	shapeType - tipo della shape (linea, punto, arco)
	singleStroke - 0/1, forza l'operatività in singlestroke
	bgColor, shapeColor, activeColor - colori di background, shape e selezione attiva
	modes - vettore che elenca le varie modalità operative
	mode - modalità corrente
*/

var bgColor = '#fff', shapeColor = '#557', activeColor = '#aaf',
	gestures = [],
	active = "",
	shapeType = "",
	singleStroke = 0,
	modes = ["draw", "edit", "move"],
	mode = "",

//	imposto adesso il gestore degli eventi di trascinamento del mouse 
//	(localizzato sullo SVG con ID univoco #main, che contiene la griglia 
//	di fondo), generata direttamente nella dichiarazione dello stesso 
//	SVG nell'html - salvo inoltre il riferimento restituito, in quanto 
//	mi servirà per inserirvi le shape generate 
	svg = d3.select("#main")
		.call(d3.drag()	//	avvia i due gestori degli eventi di trascinamento
			.on("start", dragstarted)
			.on("end", dragended)
		);

//	*** PROVVISORIO *** Gestione della RIGA DI STATO
//	( testo descrittivo dello stato corrente del sistema )
function updateStatus() {
const defaultStatus = "Click on Palette to Start";
	//	se non è attiva nessuna modalità, mostro il testo predefinito
	if (mode == "")
		d3.select('#statusline').text(defaultStatus);
	//	altrimenti stampo la modalità e il tipo di shape correnti
	else if (mode == "draw")
		d3.select('#statusline').text("draw " + shapeType);
	else
		d3.select('#statusline').text(mode + " " + active.shape);
}

//	imposta il valore iniziale della riga di stato 
updateStatus();


/*
	La funzione "dragended" viene chiamata alla fine del tracciamento
	e si occupa di verificare se il nuovo elemento generato debba essere
	eliminato in quanto nullo, oppure accettato e in tal caso anche 
	conservato nell'apposito stack delle shapes (inoltre le informazioni 
	della shape sono inserite nel log del browser per comodità di debug)
 */
function dragended() { switch (mode) {
case "edit":
case "move":
//	attualmente nelle modalità diverse da "draw" non vi è nulla da eseguire
	break;
case "draw":
var	element = [];	// contiene le informazioni sulla shape per il log
	element.shape = active.shape;
	if (active.shape == "point") {
	//	salvo le coordinate dell'unico punto della shape
		element.x = active.a.x;
		element.y = active.a.y;
	} else {
		//	se la shape risulta essere di dimensione nulla, viene eliminata
		if (delta2(active) == 0) {
			active.remove();
			//	se nel vettore sono presenti altre shape, rimetto attiva l'ultima
			if (gestures.length > 0) {
				active = gestures[0];
				active.style("stroke", activeColor);
			}
			return ;
		}
		//	salvo le coordinate di entrambi i punti della shape
		element.xa = active.a.x;
		element.ya = active.a.y;
		element.xb = active.b.x;
		element.yb = active.b.y;
	}

//	salvo la nuova shape nell'apposito vettore
	gestures.unshift(active);
//	ed effettuo il log nella console
	console.log(element);

	break;
}}


/*
	La funzione checkSelection viene chiamata all'inizio delle 
	modalità "edit" e "move", per verificare se il punto iniziale
	del click comporta un cambiamento della shape attiva, nel qual 
	caso restituisce 1 altrimenti 0
 */
function checkSelection(x,y) { if (gestures.length > 1) {
	var item = [], selected = -1;
	for (var i = 0; i < gestures.length; i++) {
		item = gestures[i];	// shape da testare
	//	procedo adesso a testare la distanza del click dalla shape
	//	con tolleranza calcolata per tentativi ed appropriata ad ogni caso
		switch (item.shape) {
		case "point":
		//	distanza di x e y dalla shape 
		//	(si può testare indifferentemente uno dei due estremi, che coincidono)
			if (Math.abs(Math.sqrt(dist2(item.a, x, y)) < 3))
				selected = i;
			break;
		case "line":
		//	se il click è sulla linea o nelle immediate vicinanze, 
		//	allora la somma delle distanze dai due estremi sarà di 
		//	poco superiore alla distanza tra gli estremi stessi
			if (Math.abs(
					Math.sqrt(dist2(item.a, x, y)) 
					+ Math.sqrt(dist2(item.b, x, y)) 
					- Math.sqrt(delta2(item)))
				< 0.05)
				selected = i;
			break;
		case "arc":
		case "rev":
		//	se il click è sull'arco o nelle immediate vicinanze, allora 
		//	la distanza dal centro sarà di poco differente dal raggio stesso
		//	ma inoltre, verifico anche che la massima distanza dai due estremi 
		//	sia inferiore alla lunghezza della corda, per escludere che il punto 
		//	si trovi all'esterno dell'arco, anche se pur sempre sulla circonferenza
			if ((Math.abs(Math.sqrt(dist2(item.center, x, y)) - item.radius) < 3)
				&& (maxDist2(item, x, y) <= delta2(item)))
				selected = i;
			break;
		}
		//	se è stato selezionato un elemento, il ciclo viene interrotto
		if (selected > -1)
			break;
	}

	//	se è stato selezionato un elemento ed è differente da quello già attivo:
	if ((selected > -1) && (active !== gestures[selected])) {
	//	allora rimetto il colore normale al precendente attivo
		active.style("stroke", shapeColor);
	//	rendo attivo il nuovo selezionato
		active = gestures[selected];
	//	gli assegno il colore apposito
		active.style("stroke", activeColor);
	//	lo tolgo dalla vecchia posizione
		gestures.splice(selected,1);
	//	e lo reinserisco alla posizione 0
		gestures.unshift(active);
	//	quindi aggiorno la riga di stato
		updateStatus();
	//	e infine restituisco 1 al chiamante
		return 1;
	}
}	// in tutti gli altri casi restituisco 0
return 0; }


/*
	La funzione "dragstarted" imposta il gestore degli eventi per ognuna delle 
	modalità operative, che sono attualmente tre: "draw", "move" e "edit"
*/

function dragstarted() { var point, twinA, twinB, minA, minB, tmp;
switch (mode) {
case "move":
	//	se non è presente alcuna shape, oppure se è cambiata la shape selezionata
	//	allora l'eventuale spostamento del mouse viene ignorato
	if ((gestures.length < 1) || checkSelection(d3.event.x, d3.event.y)) return;

	if (singleStroke) 
		d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
		//	in singlestroke sposta tutte le shape della stessa entità
		//	del movimento del mouse e quindi le ridisegna tutte
			for (var i = 0; i < gestures.length; i++) {
				gestures[i].a.x += d3.event.dx;
				gestures[i].a.y += d3.event.dy;
				gestures[i].b.x += d3.event.dx;
				gestures[i].b.y += d3.event.dy;
				redraw(gestures[i]);
			}
		});
	else
		d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
		//	sposta entrambi i punti della shape della stessa entità
		//	del movimento del mouse e quindi la ridisegna
			active.a.x += d3.event.dx;
			active.a.y += d3.event.dy;
			active.b.x += d3.event.dx;
			active.b.y += d3.event.dy;
			redraw(active);
		});
	break;

case "edit":
	//	se non è presente alcuna shape
	//	oppure se è cambiata la shape selezionata
	//	oppure se la shape è un punto
	//	allora l'eventuale spostamento del mouse viene ignorato
	if ( (gestures.length < 1)
		 || checkSelection(d3.event.x, d3.event.y)
		 || (active.shape == "point") )
		return;

	if (! singleStroke) { // multistroke
		//	se sono in multistroke, devo spostare soltanto un estremo della 
		// 	shape attiva, quello più vivino al click, che salvo in point
		point = nearest(active, d3.event.x, d3.event.y);
		d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
			//	aggiorno le coordinate del punto da trascinare
			point.x = d3.event.x;
			point.y = d3.event.y;
			//	quindi ridisegno la shape
			redraw(active);
		});
	} else { // singlestroke
		//	altrimenti, se sono in singlestroke, devo individuare e salvare 
		//	i due estremi "gemelli" delle shape consecutive da spostare insieme
		minA = dist2(gestures[0].a, d3.event.x, d3.event.y);
		minB = dist2(gestures[0].b, d3.event.x, d3.event.y);
		twinA = twinB = gestures[0];
		for (var i = 0; i < gestures.length; i++) {
			tmp = dist2(gestures[i].a, d3.event.x, d3.event.y);
			if (tmp < minA) { 
				minA = tmp; 
				twinA = gestures[i];
			}
			tmp = dist2(gestures[i].b, d3.event.x, d3.event.y);
			if (tmp < minB) { 
				minB = tmp; 
				twinB = gestures[i];
			}
		}

		if (Math.abs(minA - minB) > 10) 
			if (minA < minB) twinB = 0;
			else twinA = 0;

		d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
			if (twinA != 0) {
				twinA.a.x = d3.event.x;
				twinA.a.y = d3.event.y;
				redraw(twinA);
			}
			if (twinB != 0) {
				twinB.b.x = d3.event.x;
				twinB.b.y = d3.event.y;
				redraw(twinB);
			}
		});
	}
	break;
	
case "draw":
	//	creo un elemento path con classe "shape", inserendolo all'interno 
	//	dello SVG, e ne salvo il riferimento restituito in active
	active = svg.append("path").attr("class", "shape");
	//	definisco nell'elemento stesso i vari attributi:
	active.shape = shapeType;	//	il tipo di shape da tracciare
	if (active.shape != "point") {
		active.attr("marker-end", "url(#arrow)");
		if (! singleStroke || (gestures.length == 0) || (gestures[0].shape == "point"))
			active.attr("marker-start", "url(#dot)");
	}
	active.a = [];	//	il primo punto
	active.b = [];	//	il secondo punto
	if (singleStroke && (active.shape != "point") 
		&& (gestures.length > 0) && (gestures[0].shape != "point")) {
		// se in modalità singlestroke e se non è un punto, 
		// il primo punto parte dal secondo dello stroke precedente, 
		// se questo esiste e se non è un punto a sua volta
		active.a.x = gestures[0].b.x;
		active.a.y = gestures[0].b.y;
		active.b.x = d3.event.x;
		active.b.y = d3.event.y;
	} else {
		// in tutti gli altri casi, inizialmente i due punti sono uguali
		active.a.x = active.b.x = d3.event.x;
		active.a.y = active.b.y = d3.event.y;
	}
	//	quindi gli imposto il colore attivo e lo traccio per la prima volta
	redraw(active).style("stroke", activeColor);
	//	e nel contempo imposto con colore non attivo 
	//	l'elemento attivo in precedenza, se presente
	if (gestures.length > 0)
		gestures[0].style("stroke", shapeColor);

	d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
		//	aggiorno il secondo punto della shape
		active.b.x = d3.event.x;
		active.b.y = d3.event.y;
		//	nel solo caso in cui si tratti di un punto, allora 
		//	anche il primo punto deve coincidere col secondo
		if (active.shape == "point") {
			active.a.x = d3.event.x;
			active.a.y = d3.event.y;
		}

		//	se la shape ha dimensione nulla e non è un punto allora 
		//	la rendo non visibile attribuendole il colore di fondo
		if ((delta2(active) == 0) && (active.shape != "point"))
			active.style("stroke", bgColor);
		else 
			active.style("stroke", activeColor);

		//	infine ritraccio la shape aggiornata
		redraw(active);
	});
	break;
}}


/*
	Il codice seguente rende attivi e gestisce i pulsanti della palette.

	In base all'indice del bottone, vengono definiti i parametri che saranno letti
	dal gestore dell'evento per stabilire come interpretare il movimento del mouse 
	e conseguentemente tradurlo nell'azione voluta.
	
	Il primo bottone attiva e disattiva l'operatività singlestroke.

	I successivi quattro bottoni attivano la modalità "draw" e selezionano il 
	tracciamento della shape corrispondente: 
		punto, linea, arco orario e arco anti-orario.

	I successivi due, selezionano rispettivamente le modalità "move" e "edit".

	Infine, l'ultimo bottone svolge la funzione di eliminare l'elemento attivo e 
	contemporaneamente portando attivo l'elemento sottostante quello eliminato.



	### Variabili Globali ###

	palette - vettore delle voci di menu
	action - voce del menu correntemente attiva
*/

var	palette = ["single", "point", "line", "arc", "rev", "move", "edit", "del"],
	action = 0;

//	attivo il gestore dell'evento click su tutti gli elementi ".button" di SVG
d3.selectAll('.button').on('click', function(d, i) {
//	i è l'indice del cerchio cliccato
//	(nel codice lo imposto a -1 quando non si deve cambiare l'action corrente)
var	newAction = palette[i];	//	stringa corrispondente al cerchio cliccato

	switch (newAction) {
	case "single": 
		singleStroke = ! singleStroke;  // inverto lo stato (on/off)
		// imposto il colore in funzione dello stato attivo 
		d3.select(this).style("fill", singleStroke ? "#def": "#fed");
		break;
	case "point":
	case "line":
	case "arc":
	case "rev":
	//	in caso di nuova shape da tracciare
		mode = "draw";	//	imposto la modalità a "draw"
		shapeType = newAction;	//	e salvo il tipo di shape richiesta
		break;
	case "edit":
	case "move":
	//	in caso di modalità diversa da "draw"
		if (gestures.length > 0) //	se esiste almeno una shape
			mode = newAction;	// allora imposto la nuova modalità
		else	// altrimenti la ignoro e rimane la precedente
			i = -1;	// e anche l'action non deve essere cambiata
		break;
	case "del":
		i = -1;	//	l'action corrente rimane inalterata
		if (gestures.length > 0) {	//	se esiste almeno una shape
			gestures.shift().remove();	//	la elimino
			if (gestures.length > 0) {	//	se è rimasta almeno un'altra shape
			//	la rendo attiva
				active = gestures[0];
				active.style("stroke", activeColor);
			} else {
			//	altrimenti resetto tutto alla condizione iniziale
				active = null;
				//	ma preservo la sola modalità di tracciamento, se attiva
				if (mode != "draw") {
					mode = "";
					action.style("fill", "#fed");
				}
			}
		}
		break;
	case "prev":
		i = -1;	//	l'action corrente rimane inalterata
		//	rendo attiva la shape precedente
		if (gestures.length > 1) {	// se ci sono meno di due shape, ignoro il tutto
			active = gestures.shift();	// estraggo la shape correntemente attiva
			gestures.push(active);	// e la reinserisco all'altro estremo dello stack
			active.style("stroke", shapeColor);	// le assegno il colore normale
			active = gestures[0];	// rendo attiva quella rimasta in testa
			active.style("stroke", activeColor);	// e le assegno il colore attivo
		}
		break;
	case "next":
		i = -1;	//	l'action corrente rimane inalterata
		//	rendo attiva la shape successiva
		if (gestures.length > 1) {	// se ci sono meno di due shape, ignoro il tutto
			active = gestures[0];	// riprendo la shape correntmente attiva
			active.style("stroke", shapeColor);	// e le assegno il colore normale
			active = gestures.pop();	// estraggo quella che era ultima
			gestures.unshift(active);	// e la reinserisco in testa
			active.style("stroke", activeColor);	// assegnandole il colore attivo
		}
		break;
	}

	if (i > 0) {	//	se l'action corrente deve essere cambiata
		if (action != 0)	// se ne esiste una precedente
			action.style("fill", "#fed");	// le riassegno il colore di fondo
		action = d3.select(this);	// salvo il riferimento al cerchio corrente
		action.style("fill", "#def");	// e gli assegno il colore attivo
	}

	updateStatus();
});

/*
		//	precalcolo il raggio e le coordinate del centro per altri usi (selezione)
		if ((active.shape == "arc") || (active.shape == "rev")) {
			active.center = arcCenter(active);
			active.radius = Math.sqrt(delta2(active)/2.0);
		//	essendo l'arco un quarto di circonferenza, il raggio è pari alla
		//	lunghezza della corda diviso radice di due, quindi per semplicità 
		//	divido direttamente per due delta2(active), che è il quadrato della 
		//	lunghezza della corda, PRIMA di estrarne la radice quadrata

//	d3.select('#statusline').text(defaultStatus);
*/

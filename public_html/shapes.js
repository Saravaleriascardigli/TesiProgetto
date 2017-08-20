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

//	calcola e restituisce 1 o 2 in base al fatto che le coordinate x e y
//	siano più vicine rispettivamente al primo o al secondo punto di item
function nearest(item, x, y) {
return (dist2(item.a, x, y) < dist2(item.b, x, y)) ? 1 : 2 }

//	restituisce la descrizione testuale della linea per il path dello SVG
function toLine(item) {
return ["M", item.a.x, item.a.y, "L", item.b.x, item.b.y].join(" "); }

//	restituisce la descrizione testuale dell'arco per il path dello SVG
//	il punto a di item rappresenta il centro dell'arco da tracciare
//	il punto b di item rappresenta un punto sul quarto d'arco di circonferenza
//	l'arco è sempre di 90 gradi e con gli assi paralleli ai cartesiani
function toArc(item) {
//	il raggio è pari alla distanza tra i due punti
var radius = Math.sqrt(delta2(item)),
//	dx e dy sono le differenze delle coordinate dei due punti
	dx = item.b.x - item.a.x,
	dy = item.b.y - item.a.y,
//	calcolo adesso le coordinate dei due estremi dell'arco
	ax = item.a.x,
	ay = item.a.y + (dy > 0 ? radius : -radius),
	bx = item.a.x + (dx > 0 ? radius : -radius),
	by = item.a.y,
//	se l'arco è nel secondo o nel quarto quadrante 
//	allora inverto il verso di tracciamento
	sweep = dx*dy < 0 ? 1 : 0;
return ["M", ax, ay, "A", radius, radius, 0, 0, sweep, bx, by].join(" "); }

//	restituisce la descrizione testuale dell'arco per il path dello SVG 
//	ma, a differenza della funzione precedente, i punti a e b di item 
//	già rappresentano gli estremi del quarto d'arco di circonferenza da 
//	tracciare in senso orario, e inoltre non è applicabile il vincolo 
//	del parallelismo degli assi dell'arco
function toArc90(item) {
//	in questo caso, l'unico calcolo necessario è quello del raggio,
//	che è pari alla radice quadrata della metà della corda
var radius = Math.sqrt(delta2(item)/2.0);
const versoOrario = 1;
return ["M", item.a.x, item.a.y, "A", radius, radius, 0, 0, versoOrario, item.b.x, item.b.y].join(" "); }

//	(ri)traccia le varie shape chiamando le opportune funzioni 
//	per generare le corrispondenti descrizioni testuali
function redraw(item) {
	switch (item.shape) {
	case "point":
	case "line":
		return item.attr("d", toLine(item));
	//	break;	// superfluo
	case "arc":
		return item.attr('d', toArc(item));
	//	break;	// superfluo
	case "arc90":
		return item.attr('d', toArc90(item));
	//	break;	// superfluo
	}
}


/*
	### Variabili Globali ###

	gestures - vettore che contiene gli SVG generati nel DOM
	element - vettore che contiene i punti della shape usato solo per il log
	shapeType - tipo della shape (linea, punto, arco)
	bgColor, shapeColor, activeColor - colori di background, shape e selezione attiva
	modes - vettore che elenca le varie modalità operative
	mode - modalità corrente
*/

var bgColor = '#fff', shapeColor = '#557', activeColor = '#aaf',
	gestures = [],
	active = "",
	shapeType = "",
	modes = ["draw", "edit", "move"],
	mode = "",

//	*** PROVVISORIO *** testo descrittivo dello stato corrente del sistema 
	defaultStatus = "Click on Palette to Start",

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

//	*** PROVVISORIO *** 
//	imposta il valore iniziale della riga di stato 
//	( testo descrittivo dello stato corrente del sistema )
d3.select('#statusline').text(defaultStatus);


/*
	La funzione "dragended" viene chiamata alla fine del tracciamento
	e si occupa di verificare se il nuovo elemento generato debba essere
	eliminato in quanto nullo, oppure accettato e in tal caso anche 
	conservato nell'apposito stack delle shapes (inoltre le informazioni 
	della shape sono inserite nel log del broser per comodità di debug)
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
		// salvo le coordinate di entrambi i punti della shape
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
	var item = [], selected = -1, len, distA, distB;
	for (var i = 0; i < gestures.length; i++) {
		item = gestures[i];	// shape da testare
		len =  Math.sqrt(delta2(item));	// distanza tra i due punti della shape
	//	distanza di x e y rispettivamente dal primo e dal secondo punto della shape
		distA = Math.sqrt(dist2(item.a, x, y));
		distB = Math.sqrt(dist2(item.b, x, y));
	//	procedo adesso a testare la distanza del click dalla shape
	//	con tolleranza calcolata per tentativi ed appropriata ad ogni caso
		switch (item.shape) {
		case "point":
			if (Math.abs(distA) < 3)
				selected = i;
			break;
		case "line":
		//	se il click è sulla linea o nelle immediate vicinanze, 
		//	allora la somma delle distanze dai due estremi sarà di 
		//	poco superiore alla distanza tra gli estremi stessi
			if (Math.abs(distA + distB - len) < 0.05)
				selected = i;
			break;
		case "arc":
		//	se il click è sull'arco o nelle immediate vicinanze, allora 
		//	la distanza dal centro sarà di poco superiore al raggio stesso
			if (Math.abs(len - distA) < 2)
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
	//	infine restituisco 1 al chiamante
		return 1;
	}
}	// in tutti gli altri casi restituisco 0
return 0; }


/*
	La funzione "dragstarted" imposta il gestore degli eventi per ognuna delle 
	modalità operative, che sono attualmente tre: "draw", "move" e "edit"
*/

function dragstarted() { 
switch (mode) {
case "move":
	//	se non è presente alcuna shape, oppure se è cambiata la shape selezionata
	//	allora l'eventuale spostamento del mouse viene ignorato
	if ((gestures.length < 1) || checkSelection(d3.event.x, d3.event.y)) return;

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

	//	se la shape è di tipo "arc"
	//	oppure se l'evento è più vicino al secondo punto della shape
	//	allora viene spostato solo il secondo punto
	//	NOTA nel caso del tipo "arc", il primo punto è il centro della 
	//		circonferenza, mentre il secondo è un punto sull'arco stesso
	if ((active.shape == "arc") || (nearest(active, d3.event.x, d3.event.y) == 2))
		d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
			active.b.x = d3.event.x;
			active.b.y = d3.event.y;
			redraw(active);
		});
	//	altrimenti, in tutti gli altri casi, viene spostato solo il primo punto
	else
		d3.event.on("drag", function() {	// gestore dell'evento di trascinamento
			active.a.x = d3.event.x;
			active.a.y = d3.event.y;
			redraw(active);
		});
	break;

case "draw":
	//	creo un elemento path con classe "shape", inserendolo all'interno 
	//	dello SVG, e ne salvo il riferimento restituito in active
	active = svg.append("path").attr("class", "shape");
	//	definisco nell'elemento stesso i vari attributi:
	active.shape = shapeType;	//	il tipo di shape da tracciare
	if (active.shape != "point") active.attr("marker-end", "url(#arrow)");
	active.a = [];	//	il primo punto
	active.b = [];	//	il secondo punto
	active.a.x = active.b.x = d3.event.x;	//	inizialmente i due 
	active.a.y = active.b.y = d3.event.y;	//	punti sono uguali
	//	quindi gli imposto il colore attivo...
	redraw(active).style("stroke", activeColor);
	//	... e nel contempo imposto con colore non attivo 
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
	Il codice seguente rende attivi i pulsanti della palette.

	In base all'indice del bottone, vengono definiti i parametri che saranno letti
	dal gestore dell'evento per stabilire come interpretare il movimento del mouse 
	e conseguentemente tradurlo nell'azione voluta.

	I primi tre bottoni attivano la modalità "draw" e selezionano il tracciamento 
	della shape corrispondente:	punto, linea e arco.

	I successivi due, selezionano rispettivamente le modalità "edit" e "move".

	I due bottoni ancora successivi non alterano la modalità corrente, ma cambiano 
	ciclicamente l'elemento correntemente attivo, rispettivamente "next" e "previous".

	Il penultimo bottone svolge la funzione di eliminare l'elemento attivo e 
	contemporaneamente portando attivo l'elemento sottostante quello eliminato.

	Infine, l'ultimo bottone (aggiunto provvisoriamente) traccia una seconda
	tipologia di arco, denominata "arc90", nella quale i due punti del trascinamento
	rappresentano gli estremi di un arco pari ad un quarto di circonferenza,
	tracciato in senso orario. Tuttavia, questo sistema non consente di imporre 
	gli assi dell'arco paralleli ai cartesiani (a differenza del tipo "arc"). 


	### Variabili Globali ###

	palette - vettore delle voci di menu
	action - voce del menu correntemente attiva
*/

var	palette = ["point", "line", "arc", "arc90", "move", "edit", "del"],
//	palette = ["point", "line", "arc", "arc90", "move", "edit", "del", "prev", "next"],
	action = 0;

//	attivo il gestore dell'evento click su tutti gli elementi "circle" di SVG
d3.selectAll('circle').on('click', function(d, i) {

//	i = indice del cerchio cliccato
//		se impostato a -1, non si deve cambiare l'action corrente
var	newAction = palette[i];	//	stringa corrispondente al cerchio cliccato

	switch (newAction) {
	case "point":
	case "line":
	case "arc":
	case "arc90":
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
			i = -1;	// e anche action non deve essere cambiata
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

	if (i >= 0) {	//	se l'action corrente deve essere cambiata
		if (action != 0)	// se ne esiste una precedente
			action.style("fill", "#fed");	// le riassegno il colore di fondo
		action = d3.select(this);	// salvo il riferimento al cerchio corrente
		action.style("fill", "#def");	// e gli assegno il colore attivo
	}

//	*** PROVVISORIO *** Gestione della RIGA DI STATO
//	( testo descrittivo dello stato corrente del sistema )

	//	se non è attiva nessuna modalità, mostro il testo predefinito
	if (mode == "")
		d3.select('#statusline').text(defaultStatus);
	//	altrimenti stampo la modalità e il tipo di shape correnti
	else if (mode == "draw")
		d3.select('#statusline').text("draw " + shapeType);
	else
		d3.select('#statusline').text(mode + " " + active.shape);
});

/*
d3.selectAll('circle')
    .append('text')
    .attr('class', 'glyphicon')
    .text('\ue059');
*/

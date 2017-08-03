/* global d3 */

//	BEGIN gridData

function gridData() {
	var data = new Array();
	// starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var xpos = 1;
	var ypos = 1;
	var width = 25;
	var height = 25;

	// iterate for rows	
	for (var row = 0; row < 20; row++) {
		data.push( new Array() );
		// iterate for cells/columns inside rows
		for (var column = 0; column < 20; column++) {
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height
			});
			// increment the x position. I.e. move it over by 50 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
	}
	return data;
}

var gridData = gridData();	
//	I like to log the data to the console for quick debugging
//	console.log(gridData);

var grid = d3.select("#grid")
	.append("svg")
	.attr("width","502px") 
	.attr("height","502px");

var row = grid.selectAll(".row")
	.data(gridData)
	.enter().append("g")
	.attr("class", "row");

var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter().append("rect")
	.attr("class","square")
	.attr("x", function(d) { return d.x; })
	.attr("y", function(d) { return d.y; })
	.attr("width", function(d) { return d.width; })
	.attr("height", function(d) { return d.height; })
	.style("fill", "#ffd")
	.style("stroke", "#ccc");

//	END gridData

//	BEGIN gridPalette

function gridPalette() {
	var data = new Array();
	// starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var xpos = 1;
	var ypos = 1;
	var width = 50;
	var height = 50;

	// iterate for rows	
	for (var row = 0; row < 5; row++) {
		data.push( new Array() );
		// iterate for cells/columns inside rows
		for (var column = 0; column < 1; column++) {
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height
			});
			// increment the x position. I.e. move it over by 50 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
	}
	return data;
}

var gridPalette = gridPalette();	

var grid2 = d3.select("#palette")
	.append("svg")
	.attr("width","102px") 
	.attr("height","502px");

var row = grid2.selectAll(".row")
	.data(gridPalette)
	.enter().append("g")
	.attr("class", "row");

var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter().append("rect")
	.attr("class","square")
	.attr("x", function(d) { return d.x; })
	.attr("y", function(d) { return d.y; })
	.attr("width", function(d) { return d.width; })
	.attr("height", function(d) { return d.height; })
	.style("fill", "#fed")
	.style("stroke", "#ccc");

//	END gridPalette


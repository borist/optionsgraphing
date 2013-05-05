/*
* Author: Boris Treskunov
*/

var chart = null;
// Set defaults
var graphType = "callOption";
var positionType = "long";
var strikePrice = 30;

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);

function drawChart() {
	drawAssetChart();
}

function drawAssetChart(graphTypeInput, positionTypeInput, strikePriceInput) {
	// Set defaults
	graphType = (typeof graphTypeInput === "undefined") ? graphType : graphTypeInput;
	positionType = (typeof positionTypeInput === "undefined") ? positionType : positionTypeInput;
	strikePrice = (typeof strikePriceInput === "undefined") ? strikePrice : strikePriceInput;

	var data = new google.visualization.DataTable();

	// Declare Columns
	data.addColumn('number', 'Spot Price');
	data.addColumn('number', 'Payoff');

	// Add rows and generate options data
	switch(graphType) {
		case "callOption":
			data.addRows(drawCall(positionType, strikePrice));
			break;
		case "putOption":
			data.addRows(drawPut(positionType, strikePrice));
			break;
		case "underlyingAsset":
			data.addRows(drawUnderlying(positionType, strikePrice));
			break;
	}

	var options = {
	  title: getName(graphType),
	  legend: 'none',
	  hAxis: {title: 'Spot Price at Maturity'},
	  vAxis: {
	  	title: 'Payoff',
	  	viewWindowMode: 'explicit',
	  	// change this to alter dynamically
	  	viewWindow: {min: -65, max: 65}
	  }
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}

function drawCall(positionType, strikePrice) {
	dataRows = new Array();
	var j = 0;
	switch(positionType) {
		case "long":
			for (var i = 0; i < 100; i+=10) {
			  dataRows[j] = [i, Math.max(0, i - strikePrice)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i < 100; i+=10) {
			  dataRows[j] = [i, Math.min(0, strikePrice - i)];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawPut(positionType, strikePrice) {
	dataRows = new Array();
	var j = 0;
	switch(positionType) {
		case "long":
			for (var i = 0; i < 100; i+=10) {
			  dataRows[j] = [i, Math.max(0, strikePrice - i)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i < 100; i+=10) {
			  dataRows[j] = [i, Math.min(0, i - strikePrice)];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawUnderlying(positionType, strikePrice) {
	dataRows = new Array();
	var j = 0;
	switch(positionType) {
		case "long":
			for (var i = 0; i < 100; i+=10) {
			  dataRows[j] = [i, i];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i < 100; i+=10) {
			  dataRows[j] = [i, -1*i];
			  j++;
			};
			break;
	}
	return dataRows;
}

function getName(graphType) {
	switch(graphType) {
		case "callOption":
			return "Call Option";
		case "putOption":
			return "Put Option";
		case "underlyingAsset":
			return "Underlying Asset";
	}
}

$("#positionSelect").change(function() {
	drawAssetChart(graphType, $("#positionSelect").val().toLowerCase());
});

$("#graphTypeSelect").change(function() {
	drawAssetChart($("#graphTypeSelect").val());
});
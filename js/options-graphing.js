/*
* Author: Boris Treskunov
*/

var chart = null;
var j = 1;
var INCREMENT = 10;
var SCALE = 2;
var assets = new Array();

function Asset() {
	this.graphType = "callOption";
	this.positionType = "long";
	this.strikePrice = 30;
}

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);

function drawChart() {
	assets.push(new Asset());
	drawAssetChart();
}

function drawAssetChart() {

	var data = new google.visualization.DataTable();
	var windowSize = getMaxStrike(assets);

	// Declare Columns
	data.addColumn('number', 'Spot Price');
	for (var i = 0; i < assets.length; i++) {
		data.addColumn('number', 'Payoff');
	};

	data.addRows(INCREMENT*windowSize*SCALE);

	// Add rows and generate options data
	for (var i = 0; i < assets.length; i++) {
		var assetData = getDataForAsset(assets[i]);
		for (var j = 0; j < assetData.length; j++) {
			if (i == 0) {
				data.setCell(j, 0, assetData[j][0]);
			}
			data.setCell(j, i + 1, assetData[j][1]);
		};
	};

	var options = {
	  title: 'Temp',
	  legend: 'none',
	  hAxis: {title: 'Spot Price at Maturity'},
	  vAxis: {
	  	title: 'Payoff',
	  	viewWindowMode: 'explicit',
	  	// change this to alter dynamically
	  	viewWindow: {min: -1*windowSize, max: windowSize}
	  }
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}

function getDataForAsset(asset) {
	switch(asset.graphType) {
		case "callOption":
			return drawCall(asset.positionType, asset.strikePrice);
			break;
		case "putOption":
			return drawPut(asset.positionType, asset.strikePrice);
			break;
		case "underlyingAsset":
			return drawUnderlying(asset.positionType, asset.strikePrice);
			break;
	}
}

function drawCall(positionType, strikePrice) {
	dataRows = new Array();
	var j = 0;
	var range = strikePrice * SCALE;
	switch(positionType) {
		case "long":
			for (var i = 0; i <= range; i+=INCREMENT) {
			  dataRows[j] = [i, Math.max(0, i - strikePrice)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= range; i+=INCREMENT) {
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
	var range = strikePrice * SCALE;
	switch(positionType) {
		case "long":
			for (var i = 0; i <= range; i+=INCREMENT) {
			  dataRows[j] = [i, Math.max(0, strikePrice - i)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= range; i+=INCREMENT) {
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
	var range = strikePrice * SCALE;
	switch(positionType) {
		case "long":
			for (var i = 0; i <= range; i+=INCREMENT) {
			  dataRows[j] = [i, i];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= range; i+=INCREMENT) {
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

function getMaxStrike(assets) {
	var maxStrike = 0;
	for (var i = 0; i < assets.length; i++) {
		maxStrike = (assets[i].strikePrice > maxStrike) ? assets[i].strikePrice : maxStrike;
	};
	return maxStrike;
}

$("#positionSelect").change(function() {
	drawAssetChart(graphType, $("#positionSelect").val().toLowerCase());
});

$("#graphTypeSelect").change(function() {
	drawAssetChart($("#graphTypeSelect").val());
});

$("#inputStrike").blur(function() {
	drawAssetChart(graphType, positionType, $("#inputStrike").val());
});

$("#inputStrike").keypress(function(e) {
	if (e.keyCode == 13) {
		drawAssetChart(graphType, positionType, $("#inputStrike").val());
	}
});

function addGraph() {
	graphOptionsHTML = '<hr><div class="asset-option">' +
              '<form class="form-horizontal">' +

                '<div class="control-group">' +
                ' <label class="control-label">Type of Asset:</label>' +
                ' <div class="controls">' +
                '    <select class="span7" id="graphTypeSelect' + j + '">' +
                '      <option value="callOption">Call Option</option>' +
                '      <option value="putOption">Put Option</option>' +
                '      <option value="underlyingAsset">Underlying Asset</option>' +
                '    </select>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label class="control-label">Position in Asset:</label>' + 
                '  <div class="controls">' + 
                '    <select class="span7" id="positionSelect' + j + '">' + 
                '      <option value="long">Long</option>' + 
                '      <option value="short">Short</option>' + 
                '    </select>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label class="control-label" for="inputStrike">Strike Price:</label>' + 
                '  <div class="controls">' + 
                '   <input class="input-small" type="text" id="inputStrike' + j + '" value=30>' + 
                '  </div>' + 
                '</div>' + 

                '<button onclick="addGraph()" class="btn btn-small btn-primary pull-right" type="button">Add Asset</button>' + 
              '</form>' + 
            '</div>'; 
	$("#asset-options").append(graphOptionsHTML);

	$("#positionSelect" + j).change(function() {
		drawAssetChart(graphType, $("#positionSelect" + j).val().toLowerCase());
	});

	$("#graphTypeSelect" + j).change(function() {
		drawAssetChart($("#graphTypeSelect" + j).val());
	});

	j++;
}
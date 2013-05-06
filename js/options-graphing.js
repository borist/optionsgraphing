/*
* Author: Boris Treskunov
*/

var chart = null;
var INCREMENT = 10;
var SCALE = 2;
var assets = new Array();
var graphCanvas;
var priceAsOne = false;

function Asset() {
	this.graphType = "callOption";
	this.positionType = "long";
	this.strikePrice = 30;
}

$("#combinedPayoffButton").click(function() {
	priceAsOne = !priceAsOne;
	drawAssetChart();
});

function drawAssetChart(graphCanvas) {
	if (graphCanvas !== undefined) { this.graphCanvas = graphCanvas;}
	var windowSize = getMaxStrike(assets);
	var numPoints = windowSize*SCALE;

	var dataTable = (priceAsOne) ? drawDataAsOne(numPoints) : drawDataSeparately(numPoints);

	var options = {
	  title: 'Payoff from Asset(s) at Maturity',
	  legend: 'none',
	  hAxis: {title: 'Spot Price at Maturity'},
	  vAxis: {
	  	title: 'Payoff',
	  	viewWindowMode: 'explicit',
	  	// change this to alter dynamically
	  	viewWindow: {min: -1*windowSize, max: windowSize}
	  }
	};

	chart = new google.visualization.LineChart(this.graphCanvas);
	chart.draw(dataTable, options);
}

function drawDataSeparately(numPoints) {
	var data = new google.visualization.DataTable();
	// Declare Columns
	data.addColumn('number', 'Spot Price');
	for (var i = 0; i < assets.length; i++) {
		data.addColumn('number', 'Payoff');
	};

	data.addRows(INCREMENT*numPoints);

	// Add rows and generate options data
	for (var i = 0; i < assets.length; i++) {
		var assetData = getDataForAsset(assets[i], numPoints);
		for (var j = 0; j < assetData.length; j++) {
			if (i == 0) {
				data.setCell(j, 0, assetData[j][0]);
			}
			data.setCell(j, i + 1, assetData[j][1]);
		};
	};
	return data;
}

function drawDataAsOne(numPoints) {
	var data = new google.visualization.DataTable();
	// Declare Columns
	data.addColumn('number', 'Spot Price');
	data.addColumn('number', 'Payoff');

	var j = 0;
	var dataArray = new Array();
	for (var i = 0; i <= numPoints; i+=INCREMENT) {
		var payoff = 0;
		for (var k = 0; k < assets.length; k++) {
			payoff += getDataPointValue(assets[k], i);
		};
		dataArray[j] = [i, payoff];
		j++;
	};
	data.addRows(dataArray);

	return data;
}

function getDataPointValue(asset, base) {
	var strikePrice = asset.strikePrice;
	switch(asset.graphType) {
		case "callOption":
			if (asset.positionType === "long") {
				return Math.max(0, base - strikePrice);
			} else {
				return Math.min(0, strikePrice - base);
			}
		case "putOption":
			if (asset.positionType === "long") {
				return Math.max(0, strikePrice - base);
			} else {
				return Math.min(0, base - strikePrice);
			}
		case "underlyingAsset":
			if (asset.positionType === "long") {
				return base;
			} else {
				return -1*base;
			}
	}
}

function getDataForAsset(asset, numPoints) {
	switch(asset.graphType) {
		case "callOption":
			return drawCall(asset.positionType, asset.strikePrice, numPoints);
		case "putOption":
			return drawPut(asset.positionType, asset.strikePrice, numPoints);
		case "underlyingAsset":
			return drawUnderlying(asset.positionType, asset.strikePrice, numPoints);
	}
}

function drawCall(positionType, strikePrice, numPoints) {
	dataRows = new Array();
	var j = 0;
	switch(positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, Math.max(0, i - strikePrice)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, Math.min(0, strikePrice - i)];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawPut(positionType, strikePrice, numPoints) {
	dataRows = new Array();
	var j = 0;
	switch(positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, Math.max(0, strikePrice - i)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, Math.min(0, i - strikePrice)];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawUnderlying(positionType, strikePrice, numPoints) {
	dataRows = new Array();
	var j = 0;
	switch(positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, i];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
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
	assets[0].positionType = $("#positionSelect").val().toLowerCase();
	drawAssetChart();
});

$("#graphTypeSelect").change(function() {
	assets[0].graphType = $("#graphTypeSelect").val();
	drawAssetChart();
});

$("#inputStrike").blur(function() {
	assets[0].strikePrice = $("#inputStrike").val();
	drawAssetChart();
});

$("#inputStrike").keypress(function(e) {
	if (e.keyCode == 13) {
		assets[0].strikePrice = $("#inputStrike").val();
		drawAssetChart();
	}
});

function addGraph() {
	assetCount = assets.length;
	graphOptionsHTML = '<div id="asset-option' + assetCount + '"class="asset-option"><hr>' +
              '<form class="form-horizontal" id="form">' +

                '<div class="control-group">' +
                ' <label class="control-label">Type of Asset:</label>' +
                ' <div class="controls">' +
                '    <select class="span7" id="graphTypeSelect' + assetCount + '">' +
                '      <option value="callOption">Call Option</option>' +
                '      <option value="putOption">Put Option</option>' +
                '      <option value="underlyingAsset">Underlying Asset</option>' +
                '    </select>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label class="control-label">Position in Asset:</label>' + 
                '  <div class="controls">' + 
                '    <select class="span7" id="positionSelect' + assetCount + '">' + 
                '      <option value="long">Long</option>' + 
                '      <option value="short">Short</option>' + 
                '    </select>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label class="control-label" for="inputStrike">Strike Price:</label>' + 
                '  <div class="controls">' + 
                '   <input class="input-small" type="text" id="inputStrike' + assetCount + '" value=30>' + 
                '  </div>' + 
                '</div>' + 

                '<button onclick="addGraph()" class="btn btn-small btn-primary pull-right" style="margin-left: 15px;" type="button">Add Asset</button>' + 
                '<button id="removeGraph' + assetCount + '" class="btn btn-small btn-danger pull-right" type="button">Remove Asset</button>' + 
                
              '</form>' + 
            '</div>'; 

    // add the new HTML to the page
	$("#asset-options").append(graphOptionsHTML);

	$("#removeGraph" + assetCount).data('assetIndex', assetCount);
	$("#removeGraph" + assetCount).click(function() {
		index = $(this).data('assetIndex');
		console.log(index);
		$("#asset-options").children()[index].remove();
		assets.splice(index, 1);
		drawAssetChart();
		for (var i = index; i < assetCount; i++) {
			$("#removeGraph" + assetCount).data('assetIndex', i);
		};
	});

	$("#positionSelect" + assetCount).data('assetIndex', assetCount);
	$("#positionSelect" + assetCount).change(function() {
		index = $(this).data('assetIndex');
		assets[index].positionType = $("#positionSelect" + index).val().toLowerCase();
		drawAssetChart();
	});

	$("#graphTypeSelect" + assetCount).data('assetIndex', assetCount);
	$("#graphTypeSelect" + assetCount).change(function() {
		index = $(this).data('assetIndex');
		assets[index].graphType = $("#graphTypeSelect" + index).val();
		drawAssetChart();
	});

	$("#inputStrike" + assetCount).data('assetIndex', assetCount);
	$("#inputStrike" + assetCount).blur(function() {
		index = $(this).data('assetIndex');
		assets[index].strikePrice = $("#inputStrike" + assetCount).val();
		drawAssetChart();
	});

	$("#inputStrike"  + assetCount).keypress(function(e) {
		if (e.keyCode == 13) {
			index = $(this).data('assetIndex');
			assets[index].strikePrice = $("#inputStrike" + assetCount).val();
			drawAssetChart();
		}
	});

	$('#form').submit(function () {
	 return false;
	});

	// Push the new asset onto the array
	assets.push(new Asset());
	drawAssetChart();
}
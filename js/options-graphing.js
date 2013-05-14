/*
* Author: Boris Treskunov
*/

var chart = null;
var INCREMENT = 10;
var SCALE = 2;
var assets = new Array();
var graphCanvas;
var priceAsOne = false;
var showProfit = true;

function Asset() {
	this.graphType = "callOption";
	this.positionType = "long";
	this.strikePrice = 30;
	this.price = 2.5;
}

$("#combinedPayoffButton").click(function() {
	priceAsOne = !priceAsOne;
	drawAssetChart();
});

$("#payoffToggle").click(function() {
	showProfit = false;
	drawAssetChart();
});

$("#profitToggle").click(function() {
	showProfit = true;
	drawAssetChart();
});

function drawAssetChart(graphCanvas) {
	if (graphCanvas !== undefined) { this.graphCanvas = graphCanvas; }
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
	var price = showProfit ? asset.price: 0;
	switch(asset.graphType) {
		case "callOption":
			if (asset.positionType === "long") {
				return parseFloat(Math.max(0, base - strikePrice) - price);
			} else {
				return parseFloat(Math.min(0, strikePrice - base) + price);
			}
		case "putOption":
			if (asset.positionType === "long") {
				return parseFloat(Math.max(0, strikePrice - base) - price);
			} else {
				return parseFloat(Math.min(0, base - strikePrice) + price);
			}
		case "underlyingAsset":
			if (asset.positionType === "long") {
				return base - price;
			} else {
				return -1*base + price;
			}
		case "cash":
			if (asset.positionType === "long") {
				return showProfit ? 0 : asset.price;
			} else {
				return showProfit ? 0 : -asset.price;
			}
	}
}

function getDataForAsset(asset, numPoints) {
	switch(asset.graphType) {
		case "callOption":
			return drawCall(asset, numPoints);
		case "putOption":
			return drawPut(asset, numPoints);
		case "underlyingAsset":
			return drawUnderlying(asset, numPoints);
		case "cash":
			return drawCash(asset, numPoints);
	}
}

function drawCall(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? asset.price: 0;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, parseFloat(Math.max(0, i - asset.strikePrice) - price)];
			  j++;
			};
			break;
		case "short":
			console.log(price);
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, parseFloat(Math.min(0, asset.strikePrice - i) + price)];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawPut(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? asset.price: 0;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, parseFloat(Math.max(0, asset.strikePrice - i) - price)];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, parseFloat(Math.min(0, i - asset.strikePrice) + price)];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawUnderlying(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? asset.price: 0;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, i - price];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, -1*i + price];
			  j++;
			};
			break;
	}
	return dataRows;
}

function drawCash(asset, numPoints) {
	var dataRows = new Array();
	var price = showProfit ? 0 : asset.price;
	var j = 0;
	switch(asset.positionType) {
		case "long":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, price];
			  j++;
			};
			break;
		case "short":
			for (var i = 0; i <= numPoints; i+=INCREMENT) {
			  dataRows[j] = [i, -price];
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

// Handle changes to asset parameters
$("#positionSelect").change(function() {
	assets[0].positionType = $("#positionSelect").val().toLowerCase();
	drawAssetChart();
});

$("#graphTypeSelect").change(function() {
	var graphType = $("#graphTypeSelect").val();
	assets[0].graphType = graphType;

	switch (graphType) {
		case "callOption": 
			$("#price-label").html("Option Price:");
			$("#strike-label").removeClass("hidden");
			$("#inputStrike").removeClass("hidden");
			$("#inputPrice").val(2.50);
			assets[0].price = 2.50;
			break;
		case "putOption": 
			$("#price-label").html("Option Price:");
			$("#strike-label").removeClass("hidden");
			$("#inputStrike").removeClass("hidden");
			$("#inputPrice").val(2.50);
			assets[0].price = 2.50;
			break;
		case "underlyingAsset": 
			$("#price-label").html("Spot Price:");
			$("#strike-label").addClass("hidden");
			$("#inputStrike").addClass("hidden");
			$("#inputPrice").val(25);
			assets[0].price = 25;			
			break;
		case "cash":
			$("#price-label").html("Present Value of:");
			$("#strike-label").addClass("hidden");
			$("#inputStrike").addClass("hidden");
			$("#inputPrice").val(30);
			assets[0].price = 30;	
			break;
	}
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

$("#inputPrice").blur(function() {
	assets[0].price = parseFloat($("#inputPrice").val());
	drawAssetChart();
});

$("#inputPrice").keypress(function(e) {
	if (e.keyCode == 13) {
		assets[0].price = parseFloat($("#inputPrice").val());
		drawAssetChart();
	}
});

function addGraph() {
	assetCount = assets.length;
	graphOptionsHTML = '<div id="asset-option' + assetCount + '"class="asset-option"><hr>' +
              '<form class="form-horizontal" id="form' + assetCount + '">' +

                '<div class="control-group">' +
                ' <label class="control-label">Type of Asset:</label>' +
                ' <div class="controls">' +
                '    <select class="span7" id="graphTypeSelect' + assetCount + '">' +
                '      <option value="callOption">Call Option</option>' +
                '      <option value="putOption">Put Option</option>' +
                '      <option value="underlyingAsset">Underlying Asset</option>' +
                '	   <option value="cash">Cash</option>' +
                '    </select>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label class="control-label">Position in Asset:</label>' + 
                '  <div class="controls">' + 
                '    <select class="span7" id="positionSelect' + assetCount + '">' + 
                '      <option value="long">Long (Invest)</option>' + 
                '      <option value="short">Short (Borrow)</option>' + 
                '    </select>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label id="price-label' + assetCount + '" class="control-label" for="inputPrice">Option/Spot Price:</label>' + 
                '  <div class="controls">' + 
                '    <input class="input-mini" type="text" id="inputPrice' + assetCount + '" value=2.50>' + 
                '  </div>' + 
                '</div>' + 

                '<div class="control-group">' + 
                '  <label id="strike-label' + assetCount + '" class="control-label" for="inputStrike">Strike Price:</label>' + 
                '  <div class="controls">' + 
                '   <input class="input-mini" type="text" id="inputStrike' + assetCount + '" value=30>' + 
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
		$("#asset-options").children()[index].remove();
		assets.splice(index, 1);
		drawAssetChart();
		for (var i = index + 1; i < assetCount + index; i++) {
			$("#removeGraph" + i).data('assetIndex', $("#removeGraph" + i).data('assetIndex') - 1);
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
		var graphType = $("#graphTypeSelect" + index).val();
		assets[index].graphType = graphType;

		switch (graphType) {
		case "callOption": 
			$("#price-label" + index).html("Option Price:");
			$("#strike-label" + index).removeClass("hidden");
			$("#inputStrike" + index).removeClass("hidden");
			$("#inputPrice" + index).val(2.50);
			assets[index].price = 2.50;
			break;
		case "putOption": 
			$("#price-label" + index).html("Option Price:");
			$("#strike-label" + index).removeClass("hidden");
			$("#inputStrike" + index).removeClass("hidden");
			$("#inputPrice" + index).val(2.50);
			assets[index].price = 2.50;
			break;
		case "underlyingAsset": 
			$("#price-label" + index).html("Spot Price:");
			$("#strike-label" + index).addClass("hidden");
			$("#inputStrike" + index).addClass("hidden");
			$("#inputPrice" + index).val(25);
			assets[index].price = 25;			
			break;
		case "cash":
			$("#price-label" + index).html("Present Value of:");
			$("#strike-label" + index).addClass("hidden");
			$("#inputStrike" + index).addClass("hidden");
			$("#inputPrice" + index).val(30);
			assets[index].price = 30;	
			break;
	}
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

	$("#inputPrice" + assetCount).data('assetIndex', assetCount);
	$("#inputPrice" + assetCount).blur(function() {
		index = $(this).data('assetIndex');
		assets[index].price = parseFloat($("#inputPrice" + assetCount).val());
		drawAssetChart();
	});

	$("#inputPrice"  + assetCount).keypress(function(e) {
		if (e.keyCode == 13) {
			index = $(this).data('assetIndex');
			assets[index].price = parseFloat($("#inputPrice" + assetCount).val());
			drawAssetChart();
		}
	});

	$("#form" + assetCount).submit(function () {
	 return false;
	});

	// Add the new asset onto the array
	assets.push(new Asset());
	drawAssetChart();
}
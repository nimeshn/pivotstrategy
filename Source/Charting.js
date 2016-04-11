var iTradePos = 0;
var iPos = 0;
var iSize = 80;
var refreshInterval = 50;
var bLoaded = false;
var bRunning = false;
var bPlaybacking = false;
var iInterval = 0;
var myChart = null;
var runHistVar = -1;
var playbackVar = -1;
var playbackAllVar = -1;
var curLoadedData = null;
var plotLineWidth = 0.5;
var ppColor = "blue"
var ppSupportColor = "red"
var ppResistanceColor = "green"
//Setting to use Local TimeZone
Highcharts.setOptions({
	global: {
		useUTC: false
	}
});

function updaterefreshInterval(){
	refreshInterval = $('#refreshInterval').val();
	$("#spInterval").text("Showing data by :" + iInterval + " Min, Refresh Speed:" + refreshInterval + " ms");
	if (bLoaded){
		if (bRunning){
			clearInterval(runHistVar);
			RunHistData(iInterval);
		}
		// if (bPlaybacking) {
			// clearInterval(playbackAllVar);
			// PlaybackAllTrades(iInterval);
		// }
	}
}

function UnloadChart(){
	bLoaded = false;
	bRunning = false;
	bPlaybacking = false;
	if (myChart){
		while(myChart.series.length > 0)
			myChart.series[0].remove(true);
		myChart.destroy;
		myChart = null;
	}
}

function DisableButtons(bVal){
	$('#btnLoad').prop('disabled', bVal);
	$('#btnUnload').prop('disabled', bVal);
	$('#btnPause').prop('disabled', bVal);
	$('#btnResume').prop('disabled', bVal);
	$('input[name=interval]').prop('disabled', bVal);
}

function EnableLoadedState(bVal){
	$('#btnLoad').prop('disabled', !bVal);
	$('input[name=interval]').prop('disabled', !bVal);
	$('#btnUnload').prop('disabled', bVal);
	$('#btnPause').prop('disabled', bVal);
	$('#btnResume').prop('disabled', bVal);
	$('#dvImportSegments').hide();
}

// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
	var isCompatible = false;
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	isCompatible = true;
	}
	return isCompatible;
}

// Method that reads and processes the selected file
function upload(evt) {
	if (!browserSupportFileUpload()) {
		alert('The File APIs are not fully supported in this browser!');
		} else {
			var csvArrData = null;
			var file = evt.target.files[0];						
			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function(event) {
				var csvData = event.target.result;
				csvArrData = $.csv.toArrays(csvData);						
				if (csvArrData && csvArrData.length > 0) {
					//alert('Imported -' + csvArrData.length + '- rows successfully!');
					PrepareHistData(csvArrData);
					getDataByInterval(120);
					getDataByInterval(240);
					getDataByInterval(480);
					displayTradeAnalytics();
					EnableLoadedState(true);
				} else {
					alert('No data to import!');
				}
			};
			reader.onerror = function() {
				alert('Unable to read ' + file.fileName);
			};
	}
};

function LoadChartData(chartData){
	curLoadedData = chartData.slice(iPos,iSize);				
	// create the chart
	myChart = new Highcharts.StockChart({
		chart: {
			renderTo: "container"
		},
		title: {
			text: 'NIFTY Futures by min'
		},
		rangeSelector:{
			enabled: false,
			inputEnabled: false
		},
		scrollbar:{
			enabled: false
		},
		navigator:{
			enabled: false
		},
		yAxis: {
            lineWidth: 1,
            offset: 10,
            labels: {
                align: 'left',
                x: 3,
                y: 6
            },
            showLastLabel: true,
			gridLineDashStyle: 'Dot'
        },
		series : [{
				name : 'Nifty Future',
				type: 'candlestick',
				data : curLoadedData,
				tooltip: {
					valueDecimals: 2
				}
			}
/* 			, {
				name : 'Nifty EMA' + majorEMA,
				type: 'line',
				color: 'rgba(255, 0, 0, 0.6)',
				data : getEMAValues(curLoadedData, majorEMA),
				tooltip: {
					valueDecimals: 2
				}
			}, {
				name : 'Nifty EMA' + minorEMA,
				type: 'line',
				color: 'rgba(0, 0, 255, 0.6)',
				data : getEMAValues(curLoadedData, minorEMA),
				tooltip: {
					valueDecimals: 2
				}
			}
 */			],
		plotOptions: {
					candlestick: {
						color: 'red',
						upColor: 'green',
					},
					line:{
						lineWidth : 1
					}					
				},			
		tooltip: {
				enabled : true
		}
	});				
	//RunHistData(iInterval);
	PlotPivotPoints(curLoadedData.length-2);
}

function getEMAValues(data, ticks){
	var retVal = [];
	$.each(data, function() {
		if (this["EMA" + ticks]) {
			retVal.push([this.time, this["EMA" + ticks]]);
		}
	});
	return retVal;
}

function UpdateChartDisplay(){
	myChart.series[0].setData(curLoadedData, true, true, false);
	//myChart.series[1].setData(getEMAValues(curLoadedData, majorEMA), true, true, false);
	//myChart.series[2].setData(getEMAValues(curLoadedData, minorEMA), true, true, false);
}

function PlotPivotPoints(candleId){
	if (!showPivotsLines){
		return;
	}
	var secondLastCandle = curLoadedData[candleId];
	CalculatePivotPoints(secondLastCandle);
	myChart.yAxis[0].removePlotLine("ppLine");
	myChart.yAxis[0].removePlotLine("s1Line");
	myChart.yAxis[0].removePlotLine("s2Line");
	myChart.yAxis[0].removePlotLine("s3Line");
	myChart.yAxis[0].removePlotLine("r1Line");
	myChart.yAxis[0].removePlotLine("r2Line");
	myChart.yAxis[0].removePlotLine("r3Line");
	myChart.yAxis[0].addPlotLine({	id: "ppLine", color : ppColor, dashStyle : 'solid', width : plotLineWidth, 
									value : pp, label : { style: {"color":ppColor}, text : 'PP: ' + pp.toFixed(2) }
								});
	myChart.yAxis[0].addPlotLine({	id: "s1Line", color : ppSupportColor, dashStyle : 'solid', width : plotLineWidth, 
									value : s1, label : { style: {"color":ppSupportColor}, text : 'S1: ' + s1.toFixed(2) }
								});
	myChart.yAxis[0].addPlotLine({	id: "s2Line", color : ppSupportColor, dashStyle : 'solid', width : plotLineWidth, 
									value : s2, label : { style: {"color":ppSupportColor}, text : 'S2: ' + s2.toFixed(2) }
								});
	myChart.yAxis[0].addPlotLine({	id: "r1Line", color : ppResistanceColor, dashStyle : 'solid', width : plotLineWidth, 
									value : r1, label : { style: {"color":ppResistanceColor}, text : 'R1: ' + r1.toFixed(2) }
								});
	myChart.yAxis[0].addPlotLine({	id: "r2Line", color : ppResistanceColor, dashStyle : 'solid', width : plotLineWidth, 
									value : r2, label : { style: {"color":ppResistanceColor}, text : 'R2: ' + r2.toFixed(2) }
								});
}

function PlotTradeRange(fromTime, toTime, entry, exit){
	//Add Band
	myChart.xAxis[0].removePlotBand("tradeBand");
	myChart.xAxis[0].addPlotLine({	id: "tradeBand", color : 'rgba(68, 170, 213, 0.2)', 
								from: fromTime, to: toTime,
								label : { style: {"color":ppColor} }
								});
	//Add Price Range
	myChart.yAxis[0].removePlotBand("tradePrices");
	myChart.yAxis[0].addPlotLine({	id: "tradePrices", color : 'rgba(170, 68, 213, 0.2)', 
								from: entry, to: exit,
								label : { style: {"color":ppColor} }
								});
	//
	myChart.setTitle({text:'Trade Band=Entry:' + entry.toFixed(2) + ", Exit:" + exit.toFixed(2)}, null, false);
}

$(document).ready(function(){
	// The event listener for the file upload
	document.getElementById('txtFileUpload').addEventListener('change', upload, false);
	$("#btnUnload").hide();
	DisableButtons(true);
	$('#refreshInterval').val(refreshInterval);
		
	$("#btnLoad").click(
		function() {
				iInterval = $('input[name=interval]:checked').val();
				UnloadChart();
				bLoaded = true;
				//bRunning = true;
				LoadChartData(getDataByInterval(iInterval));
				DisplayTradeResult(getTradesByInterval(iInterval));
				$("#spInterval").text("Showing data by :" + iInterval + " Min, Refresh Speed:" + refreshInterval + " ms");
				//
				EnableLoadedState(false);
		});	

	$("#btnUnload").click(function() {
		UnloadChart();
		EnableLoadedState(true);
	});	

	$("#btnPause").click(function() {
		bRunning = false;
		bPlaybacking = false;
	});	

	$("#btnResume").click(function() {
		bRunning = true;
		bPlaybacking = true;
		RunHistData(iInterval);
	});		

	$("#btnPlaybackAll").click(function() {
		bPlaybacking = true;
		iTradePos = 0;
		PlaybackAllTrades(iInterval);
	});		

	$(document).on("click", ".playback", function() {
		bRunning = false;
		PlaybackTrade($(this).attr("tradeId"));
	});
	
	$(document).on("click", ".playback", function() {
		bRunning = false;
		PlaybackTrade($(this).attr("tradeId"));
	});
	
	$(document).on("click", ".colHeader", function() {
		if ($(this).attr("fieldId")){
			if (sortColumn == $(this).attr("fieldId")){
				sortDesc = !sortDesc;
			}
			else {
				sortDesc = false;
			}
			sortColumn = $(this).attr("fieldId");
			DisplayTradeResult(getTradesByInterval(iInterval));
		}		
	});
});
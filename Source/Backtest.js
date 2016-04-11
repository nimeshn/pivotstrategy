var min1Data = null;
var min5Data = null;
var min10Data = null;
var min15Data = null;
var min30Data = null;
var hrData = null;
var hr2Data = null;
var hr4Data = null;
var hr8Data = null;

var trades5Data = null;
var trades10Data = null;
var trades15Data = null;
var trades30Data = null;
var tradeshrData = null;
var trades2hrData = null;
var trades4hrData = null;
var trades8hrData = null;
var analyticsData = [];

//
var sortColumn = 'profit';
var sortDesc = false;
//pivot price points
var pp=0, pps1mid = 0, s1=0, s2=0, s3=0, ppr1mid = 0, r1=0, r2=0, r3=0;
//swing pivot high low
var useSwingHighLow = true;
var ppSwingHigh = 0, ppSwingLow = 0;
var pivotVerifyCandle = 2;

var tradeQty = 500;
var initialCapital = 500000;
var timeZoneOffInSecs = (new Date()).getTimezoneOffset() * 60000;
var minTimeForNewPos = 9 * 60 + 15;//Time to Open position is only after 09:30 am
var maxTimeForNewPos = 15 * 60 + 30;//Time to Open position is only uptil 03:15 pm
//
var maxRiskPoints = 100;
var usePrevCandleInSL = false;
var usePPDMidsInSL = true;
//
var majorEMA = 55;
var minorEMA = 15;
var EMALimit = 0;
var useEMADiff = true;
var tradeEMACross = false;
var minEMACross = 0;
//
var showPivotsLines = false;
//
var tradePivot = false;

//returns proper array based on the interval data being viewed
function getDataByInterval(interval){
	var retData = null;
	if (interval == 1){
		retData = min1Data;
	} else if (interval == 5){
		if (min5Data == null){
			//5 Min Data
			min5Data = convertData(5, min1Data);
			trades5Data = tradeEMACross ? BackTestEMACrossStrategy(min5Data): (tradePivot?BackTestPivotPointStrategy(min5Data):BackTestSimpleTrade(min5Data));
			AnalyzeTradeResults(5, trades5Data);
		}
		retData = min5Data;
	} else if (interval == 10){
		if (min10Data == null){
			//10 Min Data
			min10Data = convertData(10, min1Data);
			trades10Data = tradeEMACross ? BackTestEMACrossStrategy(min10Data): (tradePivot?BackTestPivotPointStrategy(min10Data):BackTestSimpleTrade(min10Data));
			AnalyzeTradeResults(10, trades10Data);
		}
		retData = min10Data;
	} else if (interval == 15){
		if (min15Data == null){
			//15 Min Data
			min15Data = convertData(15, min1Data);
			trades15Data = tradeEMACross ? BackTestEMACrossStrategy(min15Data): (tradePivot?BackTestPivotPointStrategy(min15Data):BackTestSimpleTrade(min15Data));
			AnalyzeTradeResults(15, trades15Data);
		}
		retData = min15Data;
	} else if (interval == 30){
		if (min30Data == null){
			//30 Min Data
			min30Data = convertData(30, min1Data);
			trades30Data = tradeEMACross ? BackTestEMACrossStrategy(min30Data): (tradePivot?BackTestPivotPointStrategy(min30Data):BackTestSimpleTrade(min30Data));
			AnalyzeTradeResults(30, trades30Data);
		}
		retData = min30Data;
	} else if (interval == 60){
		if (hrData == null){
			//60 Min Data
			hrData = convertData(60, min1Data);
			tradeshrData = tradeEMACross ? BackTestEMACrossStrategy(hrData): (tradePivot?BackTestPivotPointStrategy(hrData):BackTestSimpleTrade(hrData));
			AnalyzeTradeResults(60, tradeshrData);
		}
		retData = hrData;
	} else if (interval == 120){
		if (hr2Data == null){
			//120 Min Data
			hr2Data = convertData(120, min1Data);
			trades2hrData = tradeEMACross ? BackTestEMACrossStrategy(hr2Data): (tradePivot?BackTestPivotPointStrategy(hr2Data):BackTestSimpleTrade(hr2Data));
			AnalyzeTradeResults(120, trades2hrData);
		}
		retData = hr2Data;
	} else if (interval == 240){
		if (hr4Data == null){
			//240 Min Data
			hr4Data = convertData(240, min1Data);
			trades4hrData = tradeEMACross ? BackTestEMACrossStrategy(hr4Data): (tradePivot?BackTestPivotPointStrategy(hr4Data):BackTestSimpleTrade(hr4Data));
			AnalyzeTradeResults(240, trades4hrData);
		}
		retData = hr4Data;
	} else if (interval == 480){
		if (hr8Data == null){
			//240 Min Data
			hr8Data = convertData(480, min1Data);
			trades8hrData = tradeEMACross ? BackTestEMACrossStrategy(hr8Data): (tradePivot?BackTestPivotPointStrategy(hr8Data):BackTestSimpleTrade(hr8Data));
			AnalyzeTradeResults(480, trades8hrData);
		}
		retData = hr4Data;
	}
	return retData;
}


//returns proper array based on the interval data being viewed
function getTradesByInterval(interval){
	var retData = null;
	if (interval == 1){
		//retData = min1Data;
	} else if (interval == 5){
		retData = trades5Data;
	} else if (interval == 10){
		retData = trades10Data;
	} else if (interval == 15){
		retData = trades15Data;
	} else if (interval == 30){
		retData = trades30Data;
	} else if (interval == 60){
		retData = tradeshrData;
	} else if (interval == 120){
		retData = trades2hrData;
	} else if (interval == 240){
		retData = trades4hrData;
	}
	return retData;
}

//prepares different timeInterval data from the 1 min data we have.
function PrepareHistData(csvData){
	var curData = [];
	$.each(csvData, function() {
		curData.push({
				x : parseInt(this[0]) + timeZoneOffInSecs,
				open : parseFloat(this[1]),
				high : parseFloat(this[2]),
				low : parseFloat(this[3]),
				close : parseFloat(this[4]),
				time : parseInt(this[0]) + timeZoneOffInSecs
			});
	});
	//1 Min Data
	min1Data = curData;
	//
	//$("#spDebug").text(JSON.stringify(curData));
}

//Converts the 1 min data to of an higher time interval.
function convertData(timeInterval, largeData){
	var open=-1, high=-1, low=-1, close=-1, lastEntry=-1;
	var retData = [];
	var divMin = 60000, modHour = Math.max(60, timeInterval), divDay = divMin * 60 * 24;

	$.each(largeData, function() {
		//if the day changes then add to the records
		if (lastEntry > -1){
			if (parseInt( (lastEntry-timeZoneOffInSecs) / divDay) <  parseInt((this.time - timeZoneOffInSecs) / divDay)){
				retData.push({x:lastEntry, open:open, high:high, low:low, close:close, time:lastEntry});
				open=-1;high=-1;low=-1;close=-1;lastEntry=-1;			
			}
		}
		lastEntry = this.time;
		mod = ((lastEntry - timeZoneOffInSecs) / divMin) % modHour;
		mod = mod % timeInterval;
		if (open == -1){
			open = this.open;
			high = this.high;
			low = this.low;
			close = this.close;
		}
		high = Math.max(high, this.high);
		low = Math.min(low, this.low);
		close = this.close;
		//Add to the Array
		if (mod == 0){
			retData.push({x:lastEntry, open:open, high:high, low:low, close:close, time:lastEntry});
			open=-1;high=-1;low=-1;close=-1;lastEntry=-1;
		}
	});
		
	if (open > -1){
		retData.push({x:lastEntry, open:open, high:high, low:low, close:close, time:lastEntry});
	}
	//
	GenerateEMA(retData, majorEMA);
	GenerateEMA(retData, minorEMA);
	return retData;
}


//function to calculate pivot points.
function CalculatePivotPoints(candle){	
	var open = parseFloat(candle.open),
		high = parseFloat(candle.high),
		low = parseFloat(candle.low),
		close = parseFloat(candle.close);
	
	var range = Math.round((high - low)/.05) * .05;
	pp = Math.round(((high + low + close)/3)/.05) * .05;
	s1 = (2 * pp) - high;
	s2 = pp - range;
	r1 = (2 * pp) - low;
	r2 = pp + range;
	pps1mid = (pp + s1) / 2;
	ppr1mid = (pp + r1) / 2;
	//$("#spDebug").text("Range:" + range +", R2:" + r2 + ", R1:"+ r1 + ", PP:"+ pp + ", S1:"+ s1 + ", S2:"+ s2);
}

//Backtesting the pivot strategy
function BackTestEMACrossStrategy(histData){
	var histCtr = 1, minCtr = 0, position = 0;
	var trades = [];
	//get the position for the 1 Min Data for evaluation
	while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[majorEMA].time){
		minCtr++;
	}
	//
	var emaDiff = 0, propMajorEMA = "EMA" + majorEMA, propMinorEMA = "EMA" + minorEMA, emaMajor, emaMinor;
	for(histCtr = majorEMA;histCtr < histData.length; histCtr++)
	{
		emaDiff = histData[histCtr-1][propMinorEMA] - histData[histCtr-1][propMajorEMA];
		while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[histCtr].time){
			var open = min1Data[minCtr].open, high = min1Data[minCtr].high, 
				low = min1Data[minCtr].low, close = min1Data[minCtr].close;			
			ctr = trades.length - 1;
			//If in a long position then close it, if bear crossover has happened or the price has fallen below the Major EMA
			if (position == 1 && 
					(	emaDiff <= -minEMACross || 
						open < histData[histCtr-1][propMajorEMA] || 
						(ctr>0 && (trades[ctr].entry - open) > maxRiskPoints) 
						//|| open < histData[histCtr-1].low
					)
				){
				trades[ctr].exit = open;
				ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, tradeQty);
				trades[ctr].endTime = min1Data[minCtr].time;
				trades[ctr].endCandle = histCtr;
				trades[ctr].brokerage = ret[0];
				trades[ctr].profit = ret[1];
				position = 0;				
			}			
			else if (position == -1 && 
						(	emaDiff >= minEMACross || 
							open > histData[histCtr-1][propMajorEMA] || 
							(ctr>0 && (open - trades[ctr].entry) > maxRiskPoints) 
							//|| open > histData[histCtr-1].high
						)
					){
				//If in a short position then close it, if bull crossover has happened or the price has risen below the Major EMA
				trades[ctr].exit = open;
				ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, tradeQty);
				trades[ctr].endTime = min1Data[minCtr].time;
				trades[ctr].endCandle = histCtr;
				trades[ctr].brokerage = ret[0];
				trades[ctr].profit = ret[1];
				position = 0;				
			}
			if (emaDiff <= -minEMACross && position == 0 && open < histData[histCtr-1][propMinorEMA] && open < histData[histCtr-1].low){ //if its going down but not shorting, then go short				
				position = -1;
				trades.push({type:"S", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
					brokerage:0, profit:0, entryRisk: maxRiskPoints, EMADiff: emaDiff});
			} 
			if (emaDiff >= minEMACross && position == 0 && open > histData[histCtr-1][propMinorEMA] && open > histData[histCtr-1].high){ // then go Long
				position = 1;
				trades.push({type:"L", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
					brokerage:0, profit:0, entryRisk: maxRiskPoints, EMADiff: emaDiff});
			}
			minCtr++;
		}
	}
	//remove the last trade if it wasn't completed.
	if (position != 0){
		trades.pop();
	}	
	return trades;
}

//Backtesting the pivot strategy
function BackTestPivotPointStrategy(histData){
	var histCtr = 1, minCtr = 0, position = 0;// position 0=none, 1= long, -1 = short
	var trades = [], SL = -1;
	//get the position for the 1 Min Data for evaluation
	while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[0].time){
		minCtr++;
	}
	//
	var emaDiff = 0, propMajorEMA = "EMA" + majorEMA, propMinorEMA = "EMA" + minorEMA;
	for(histCtr=1;histCtr < histData.length; histCtr++)
	{
		//get pivot points for the first candle.
		CalculatePivotPoints(histData[histCtr-1]);
		emaDiff = ((histCtr - 1) >= majorEMA ? histData[histCtr-1][propMajorEMA] - histData[histCtr-1][propMinorEMA] : 0);
		//
		while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[histCtr].time){			
			var open = min1Data[minCtr].open, 
				high = min1Data[minCtr].high, 
				low = min1Data[minCtr].low, 
				close = min1Data[minCtr].close;
			if (position == 0){ // not In Trade
				var d = new Date(min1Data[minCtr].time);
				d = d.getHours() * 60 + d.getMinutes();
				//new positions to be opened only between 09:30 AM to 3:00 PM
				if (minTimeForNewPos < d && d < maxTimeForNewPos) {
					//lets check for the open first for gap opening 
					if ((open - s1)<=0 && (useEMADiff ? (emaDiff <= -EMALimit) : true)){//if price hits S1, then go Short
						SL = Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2;
						if (Math.abs(SL-open) <= maxRiskPoints){
							position = -1;
							trades.push({type:"S", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
							brokerage:0, profit:0, entryRisk: Math.abs(SL-open), EMADiff: emaDiff});
						}
					}else if ((open - r1) >= 0 && (useEMADiff ? (emaDiff >= EMALimit) : true)){//if price hits R1, then go Long
						SL = Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2;
						if (Math.abs(SL-open) <= maxRiskPoints){
							position = 1;
							trades.push({type:"L", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
								brokerage:0, profit:0, entryRisk: Math.abs(SL-open), EMADiff: emaDiff});
						}
					}
					//based on red or green candle decide how to compare with pivot points				
					else if ((open - close) < 0){ //red Candle
						if ((high - r1) >= 0 && (useEMADiff ? (emaDiff >= EMALimit) : true)){//if price hits R1, then go Long
							SL = Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2;
							if (Math.abs(SL-r1) <= maxRiskPoints){
								position = 1;
								trades.push({type:"L", startTime:min1Data[minCtr].time, entry:r1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									brokerage:0, profit:0, entryRisk: Math.abs(SL-r1), EMADiff: emaDiff});
							}
						}else if ((low - s1)<=0 && (useEMADiff ? (emaDiff <= -EMALimit) : true)){ //if price hits S1, then go Short
							SL = Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2;
							if (Math.abs(SL-s1) <= maxRiskPoints){
								position = -1;
								trades.push({type:"S", startTime:min1Data[minCtr].time, entry: s1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									brokerage:0, profit:0, entryRisk: Math.abs(SL-s1), EMADiff: emaDiff});
							}
						} 
					} else { //Green Candle
						if ((low - s1)<=0 && (useEMADiff ? (emaDiff <= -EMALimit) : true)){//if price hits S1, then go Short
							SL = Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2;
							if (Math.abs(SL-s1) <= maxRiskPoints){
								position = -1;
								trades.push({type:"S", startTime:min1Data[minCtr].time, entry: s1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									brokerage:0, profit:0, entryRisk: Math.abs(SL-s1), EMADiff: emaDiff});
							}
						}else if ((high - r1) >= 0 && (useEMADiff ? (emaDiff >= EMALimit) : true)){//if price hits R1, then go Long
							SL = Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2;
							if (Math.abs(SL-r1) <= maxRiskPoints){
								position = 1;
								trades.push({type:"L", startTime:min1Data[minCtr].time, entry: r1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									brokerage:0, profit:0, entryRisk: Math.abs(SL-r1), EMADiff: emaDiff});
							}
						} 
					}
				}
			}
			else {//already in a Trade
				ctr = trades.length - 1;
				var ret = null;
				if (position < 0){ //In short trade, lets check for StopLoss
					SL = Math.min(SL, Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2); // SL should be the high of previous candle or the Pivot Point
					if (open - SL >= 0){// in case of gap up opening, compare the open of this minute candle with the SL
						trades[ctr].exit = open;
						ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, tradeQty);
						position = 0;
					}
					else if ((high - SL) >= 0){// compare the high of this minute candle with the SL
						trades[ctr].exit = SL;
						ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, tradeQty);
						position = 0;
					}
				} else if (position > 0){ //In long trade, lets check for StopLoss
					SL = Math.max(SL, Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2); // SL should be the low of previous candle or the Pivot Point
					if ((open - SL) <= 0){ // compare the low of this minute candle with the SL
						trades[ctr].exit = open;
						ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, tradeQty);
						position = 0;
					}else if ((low - SL) <= 0){ // compare the low of this minute candle with the SL
						trades[ctr].exit = SL;
						ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, tradeQty);
						position = 0;
					}
				}
				if (position == 0){//StopLoss has been hit
					trades[ctr].endTime = min1Data[minCtr].time;
					trades[ctr].endCandle = histCtr;
					//					
					trades[ctr].brokerage = ret[0];
					trades[ctr].profit = ret[1];
					SL = -1;
				}
			}
			minCtr++;
		}
	}
	//remove the last trade if it wasn't completed.
	if (position != 0){
		trades.pop();
	}	
	return trades;
}


//Backtesting the pivot strategy
function BackTestPivotSwingStrategy(histData){
	var histCtr = 1, minCtr = 0, position = 0;// position 0=none, 1= long, -1 = short
	var trades = [], SL = -1;
	//get the position for the 1 Min Data for evaluation
	while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[0].time){
		minCtr++;
	}
	//
	var emaDiff = 0, propMajorEMA = "EMA" + majorEMA, propMinorEMA = "EMA" + minorEMA;
	var pivots = [];
	for(histCtr=1;histCtr < histData.length; histCtr++)
	{
		//get pivot points for the first candle.
		CalculatePivotPoints(histData[histCtr-1]);
		emaDiff = ((histCtr - 1) >= majorEMA ? histData[histCtr-1][propMajorEMA] - histData[histCtr-1][propMinorEMA] : 0);
		FindPivotPoints(histData, pivots, histCtr-1, pivotVerifyCandle);
		//
		while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[histCtr].time){			
			var open = min1Data[minCtr].open, 
				high = min1Data[minCtr].high, 
				low = min1Data[minCtr].low, 
				close = min1Data[minCtr].close;
			if (position == 0){ // not In Trade
				var d = new Date(min1Data[minCtr].time);
				d = d.getHours() * 60 + d.getMinutes();
				//new positions to be opened only between 09:30 AM to 3:00 PM
				if (minTimeForNewPos < d && d < maxTimeForNewPos) {
					//lets check for the open first for gap opening 
					if ((open - s1)<=0 && (useEMADiff ? (emaDiff <= -EMALimit) : true)){//if price hits S1, then go Short
						SL = Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2;
						if (Math.abs(SL-open) <= maxRiskPoints){
							position = -1;
							trades.push({type:"S", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
							swingLow: ppSwingLow, swingHigh: ppSwingHigh,
							brokerage:0, profit:0, entryRisk: Math.abs(SL-open), EMADiff: emaDiff});
						}
					}else if ((open - r1) >= 0 && (useEMADiff ? (emaDiff >= EMALimit) : true)){//if price hits R1, then go Long
						SL = Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2;
						if (Math.abs(SL-open) <= maxRiskPoints){
							position = 1;
							trades.push({type:"L", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
							swingLow: ppSwingLow, swingHigh: ppSwingHigh,
								brokerage:0, profit:0, entryRisk: Math.abs(SL-open), EMADiff: emaDiff});
						}
					}
					//based on red or green candle decide how to compare with pivot points				
					else if ((open - close) < 0){ //red Candle
						if ((high - r1) >= 0 && (useEMADiff ? (emaDiff >= EMALimit) : true)){//if price hits R1, then go Long
							SL = Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2;
							if (Math.abs(SL-r1) <= maxRiskPoints){
								position = 1;
								trades.push({type:"L", startTime:min1Data[minCtr].time, entry:r1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									swingLow: ppSwingLow, swingHigh: ppSwingHigh,
									brokerage:0, profit:0, entryRisk: Math.abs(SL-r1), EMADiff: emaDiff});
							}
						}else if ((low - s1)<=0 && (useEMADiff ? (emaDiff <= -EMALimit) : true)){ //if price hits S1, then go Short
							SL = Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2;
							if (Math.abs(SL-s1) <= maxRiskPoints){
								position = -1;
								trades.push({type:"S", startTime:min1Data[minCtr].time, entry: s1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									swingLow: ppSwingLow, swingHigh: ppSwingHigh,
									brokerage:0, profit:0, entryRisk: Math.abs(SL-s1), EMADiff: emaDiff});
							}
						} 
					} else { //Green Candle
						if ((low - s1)<=0 && (useEMADiff ? (emaDiff <= -EMALimit) : true)){//if price hits S1, then go Short
							SL = Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2;
							if (Math.abs(SL-s1) <= maxRiskPoints){
								position = -1;
								trades.push({type:"S", startTime:min1Data[minCtr].time, entry: s1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									swingLow: ppSwingLow, swingHigh: ppSwingHigh,
									brokerage:0, profit:0, entryRisk: Math.abs(SL-s1), EMADiff: emaDiff});
							}
						}else if ((high - r1) >= 0 && (useEMADiff ? (emaDiff >= EMALimit) : true)){//if price hits R1, then go Long
							SL = Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2;
							if (Math.abs(SL-r1) <= maxRiskPoints){
								position = 1;
								trades.push({type:"L", startTime:min1Data[minCtr].time, entry: r1, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
									swingLow: ppSwingLow, swingHigh: ppSwingHigh,
									brokerage:0, profit:0, entryRisk: Math.abs(SL-r1), EMADiff: emaDiff});
							}
						} 
					}
				}
			}
			else {//already in a Trade
				ctr = trades.length - 1;
				var ret = null;
				if (position < 0){ //In short trade, lets check for StopLoss
					SL = Math.min(SL, Math.max((usePPDMidsInSL? ppr1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].high : pp)) + 2); // SL should be the high of previous candle or the Pivot Point
					if (open - SL >= 0){// in case of gap up opening, compare the open of this minute candle with the SL
						trades[ctr].exit = open;
						ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, tradeQty);
						position = 0;
					}
					else if ((high - SL) >= 0){// compare the high of this minute candle with the SL
						trades[ctr].exit = SL;
						ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, tradeQty);
						position = 0;
					}
				} else if (position > 0){ //In long trade, lets check for StopLoss
					SL = Math.max(SL, Math.min((usePPDMidsInSL? pps1mid : pp), (usePrevCandleInSL ? histData[histCtr-1].low : pp)) - 2); // SL should be the low of previous candle or the Pivot Point
					if ((open - SL) <= 0){ // compare the low of this minute candle with the SL
						trades[ctr].exit = open;
						ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, tradeQty);
						position = 0;
					}else if ((low - SL) <= 0){ // compare the low of this minute candle with the SL
						trades[ctr].exit = SL;
						ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, tradeQty);
						position = 0;
					}
				}
				if (position == 0){//StopLoss has been hit
					trades[ctr].endTime = min1Data[minCtr].time;
					trades[ctr].endCandle = histCtr;
					//					
					trades[ctr].brokerage = ret[0];
					trades[ctr].profit = ret[1];
					SL = -1;
				}
			}
			minCtr++;
		}
	}
	//remove the last trade if it wasn't completed.
	if (position != 0){
		trades.pop();
	}	
	return trades;
}

//Backtesting the Simple Trading
function BackTestSimpleTrade(histData){
	var histCtr = 1, minCtr = 0, position = 0;// position 0=none, 1= long, -1 = short
	var trades = [], SL = -1;
	//get the position for the 1 Min Data for evaluation
	while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[0].time){
		minCtr++;
	}
	//
	var prevLow = 0, prevHigh = 0, SLDiff = 5, SLBuff = .5, AmountRisked = 200000, qty=0;
	for(histCtr=1;histCtr < histData.length; histCtr++)
	{		
		prevLow = (Math.abs(prevLow-(histData[histCtr-1].low - SLBuff))<=SLDiff) ? Math.min(prevLow, (histData[histCtr-1].low - SLBuff)):
						(histData[histCtr-1].low - SLBuff);
		prevHigh = (Math.abs(prevHigh-(histData[histCtr-1].high + SLBuff))<=SLDiff) ? Math.max(prevHigh, (histData[histCtr-1].high + SLBuff)):
						(histData[histCtr-1].high + SLBuff);
		while(minCtr < min1Data.length && min1Data[minCtr].time <= histData[histCtr].time){			
			var open = min1Data[minCtr].open, 
				high = min1Data[minCtr].high, 
				low = min1Data[minCtr].low, 
				close = min1Data[minCtr].close;
			if (position != 0) {//already in a Trade
				ctr = trades.length - 1;
				var ret = null;
				if (position < 0){ //In short trade, lets check for StopLoss
					SL = prevHigh; // SL should be the high of previous candle
					if (open - SL >= 0){// in case of gap up opening, compare the open of this minute candle with the SL
						trades[ctr].exit = open;
						qty = Math.round(AmountRisked / (25 * trades[ctr].entryRisk)) * 25;
						ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, qty);
						position = 0;
					}
					else if ((high - SL) >= 0){// compare the high of this minute candle with the SL
						trades[ctr].exit = SL;
						qty = Math.round(AmountRisked / (25 * trades[ctr].entryRisk)) * 25;
						ret = CalculateReturns(trades[ctr].exit, trades[ctr].entry, qty);
						position = 0;
					}
				} else if (position > 0){ //In long trade, lets check for StopLoss
					SL = prevLow; // SL should be the low of previous candle
					if ((open - SL) <= 0){ // compare the low of this minute candle with the SL
						trades[ctr].exit = open;
						qty = Math.round(AmountRisked / (25 * trades[ctr].entryRisk)) * 25;
						ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, qty);
						position = 0;
					}else if ((low - SL) <= 0){ // compare the low of this minute candle with the SL
						trades[ctr].exit = SL;
						qty = Math.round(AmountRisked / (25 * trades[ctr].entryRisk)) * 25;
						ret = CalculateReturns(trades[ctr].entry, trades[ctr].exit, qty);
						position = 0;
					}
				}
				if (position == 0){//StopLoss has been hit
					trades[ctr].endTime = min1Data[minCtr].time;
					trades[ctr].endCandle = histCtr;
					//					
					trades[ctr].brokerage = ret[0];
					trades[ctr].profit = ret[1];
					SL = -1;
				}
			}
			//
			if (position == 0){ // not In Trade
				//lets check for the open first for gap opening 
				if ((open - prevLow)<=0 ){//if price hits prevLow, then go Short
					SL = prevHigh;
					if (Math.abs(SL-open) <= maxRiskPoints){
						position = -1;
						trades.push({type:"S", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
						brokerage:0, profit:0, entryRisk: Math.abs(SL-open), EMADiff: -1});
					}
				}else if ((open - prevHigh) >= 0){//if price hits prevHigh, then go Long
					SL = prevLow;
					if (Math.abs(SL-open) <= maxRiskPoints){
						position = 1;
						trades.push({type:"L", startTime:min1Data[minCtr].time, entry: open, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
							brokerage:0, profit:0, entryRisk: Math.abs(SL-open), EMADiff: -1});
					}
				}
				else if ((high - prevHigh) >= 0){//if price hits prevHigh, then go Long
					SL = prevLow;
					if (Math.abs(SL-prevHigh) <= maxRiskPoints){
						position = 1;
						trades.push({type:"L", startTime:min1Data[minCtr].time, entry:prevHigh, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
							brokerage:0, profit:0, entryRisk: Math.abs(SL-prevHigh), EMADiff: -1});
					}
				}else if ((low - prevLow)<=0){ //if price hits prevLow, then go Short
					SL = prevHigh;
					if (Math.abs(SL-prevLow) <= maxRiskPoints){
						position = -1;
						trades.push({type:"S", startTime:min1Data[minCtr].time, entry: prevLow, endTime:0, exit:0, startCandle:histCtr, endCandle:0, 
							brokerage:0, profit:0, entryRisk: Math.abs(SL-prevLow), EMADiff: -1});
					}
				}				
			}
			minCtr++;
		}
	}
	//remove the last trade if it wasn't completed.
	if (position != 0){
		trades.pop();
	}	
	return trades;
}

function DisplayTradeResult(trades){
	//Start formatting the results.
	var htmlDebug="", pos = 0;
	//
	trades.sort(sort_by(sortColumn, sortDesc, null));
	//
	$.each(trades, function() {
		this.barsHeld = this.endCandle - this.startCandle + 1;
		var color = "style='color:white;";
		if (this.profit > 0){
			color += "background-color:rgb(4, 180, 95)'";
		} else if (this.profit < 0){
			color += "background-color:rgb(254, 46, 46)'";
		}

		htmlDebug += "<tr class='" + this.type + "'><td>" + this.type + "</td><td>" + (new Date(this.startTime)).toLocaleString() 
					+ "</td><td>" + (new Date(this.endTime)).toLocaleString()
					+ "</td><td>" + formatCurrency(this.entry)
					+ "</td><td>" + formatCurrency(this.exit)
					+ "</td><td>" + formatCurrency(this.entryRisk)
					//+ "</td><td>" + this.barsHeld
					//+ "</td><td>" + this.EMADiff.toFixed(2)
					//+ "</td><td>" + this.swingHigh.toFixed(2) + ", " + this.swingLow.toFixed(2)
					+ "</td><td " + color + " >" + formatCurrency(this.profit)
					+ "</td><td><input type='button' value='>' class='playback' tradeId='" + pos + "'/>"
					+ "</td></tr>";					
		pos++;
	});
	htmlDebug = "<table class='trades'><thead><th></th>" 
			+ "<th class='colHeader' fieldId='startTime'>Entry Time</th>" 
			+ "<th class='colHeader' fieldId='endTime'>Exit Time</th>" 
			+ "<th class='colHeader' fieldId='entry'>Entry</th>" 
			+ "<th class='colHeader' fieldId='exit'>Exit</th>" 
			+ "<th class='colHeader' fieldId='entryRisk'>SL</th>" 
			//+ "<th class='colHeader' fieldId='barsHeld'>Bars</th>" 
			//+ "<th class='colHeader' fieldId='EMADiff'>EMADiff</th>" 
			//+ "<th>ppSwings</th>" 
			+ "<th class='colHeader' fieldId='profit'>Profit</th>" 
			+ "<th></th></thead><tbody>" + htmlDebug + "</tbody></table>";
	//remove old tables from the Div container	
	$("#divTrades").empty();
	$("#divTrades").append(htmlDebug);
	$("#spDebug").text(JSON.stringify(hr4Data));
}

function AnalyzeTradeResults(interval, trades){
	var singleTrade=0, 
		shortProfit = 0, longProfit = 0, shortLoss = 0, longLoss = 0, 
		shortProfitPer = 0, longProfitPer = 0, shortLossPer = 0, longLossPer = 0, 
		totalSProCount = 0, totalSLosCount = 0, totalLProCount = 0, totalLLosCount = 0, barsHeld = 0;
	
	$.each(trades, function() {
		barsHeld += this.endCandle - this.startCandle + 1;
		if (this.type == "S"){
			singleTrade = this.profit;
			if (singleTrade > 0){
				shortProfit += singleTrade;
				shortProfitPer += (singleTrade * 100 /(tradeQty * this.entry));
				totalSProCount++;
			}
			else{
				shortLoss += singleTrade;
				shortLossPer += (singleTrade * 100 /(tradeQty * this.entry));
				totalSLosCount++;
			}
		}else{
			singleTrade = this.profit;
			if (singleTrade > 0){
				longProfit += singleTrade;
				longProfitPer += (singleTrade * 100 /(tradeQty * this.exit));
				totalLProCount++;
			}
			else{
				longLoss += singleTrade;
				longLossPer += (singleTrade * 100 /(tradeQty * this.exit));
				totalLLosCount++;
			}
		}
	});
	// Avg. Profit/Loss, also known as Expectancy ($) - (Profit of winners + Loss of losers)/(number of trades), represents expected dollar gain/loss per trade
	var AvgReturns = (shortProfit + longProfit + shortLoss + longLoss) / trades.length;
	// Avg. Profit/Loss %, also known as Expectancy (%) - '(% Profit of winners + % Loss of losers)/(number of trades), represents expected percent gain/loss per trade
	var AvgReturnsPer = (shortProfitPer + longProfitPer + shortLossPer + longLossPer) / trades.length;
	// Avg. Bars Held - sum of bars in trades / number of trades
	var AvgBarsHeld = barsHeld / trades.length;
	// Profit Factor - Profit of winners divided by loss of losers
	var ProfitFactor = (shortProfit + longProfit) / (shortLoss + longLoss);
	// Payoff Ratio - Ratio average win / average loss
	var AvgLoss = (shortLoss + longLoss)/(totalSLosCount + totalLLosCount);
	var AvgProfit = (shortProfit + longProfit)/(totalSProCount + totalLProCount);
	var PayoffRatio = (AvgProfit / AvgLoss);
	var WinRatio = (totalSProCount + totalLProCount) * 100/(totalSProCount + totalLProCount + totalSLosCount + totalLLosCount);
	//
	var drawDowns = CalculateDrawdowns(trades);
	
	analyticsData.push({
		dataInterval : interval,
		totalReturns : formatCurrency(shortProfit + longProfit + shortLoss + longLoss),
		totalTradesCount : (totalSProCount + totalSLosCount + totalLProCount + totalLLosCount),
		totalProfit : formatCurrency(shortProfit + longProfit),
		totalProfitCount : (totalSProCount + totalLProCount),
		totalLosses : formatCurrency(shortLoss + longLoss),
		totalLossTrades : (totalSLosCount + totalLLosCount),
		avgReturns : formatCurrency(AvgReturns),
		avgReturnsPer : AvgReturnsPer.toFixed(2),
		avgBarsHeld : AvgBarsHeld.toFixed(2),
		profitFactor : Math.abs(ProfitFactor.toFixed(2)),
		avgLoss : formatCurrency(Math.abs(AvgLoss)),
		avgProfit : formatCurrency(AvgProfit),
		payoffRatio : Math.abs(PayoffRatio.toFixed(2)),
		winRatio : WinRatio.toFixed(2),
		lddBars : drawDowns.lddBars,
		lddStartPos : (new Date(trades[drawDowns.lddStartPos].startTime)).toLocaleString(),
		lddEndPos : (new Date(trades[drawDowns.lddEndPos].endTime)).toLocaleString(),
		mddPer : drawDowns.mddPer.toFixed(2),
		mddValue : formatCurrency(drawDowns.mddValue),
		mddStartPos : (new Date(trades[drawDowns.mddStartPos].startTime)).toLocaleString(),
		mddEndPos : (new Date(trades[drawDowns.mddEndPos].endTime)).toLocaleString()
	});
}

function displayTradeAnalytics(){
	var htmlDebug = "", strDataInterval = "", strTotalReturns = "", strTotalTradesCount = "", strTotalProfit = "", strTotalProfitCount = "", 
		strTotalLosses = "", strTotalLossTrades = "", strAvgReturns = "", strAvgReturnsPer = "", strAvgBarsHeld = "", strProfitFactor = "", strAvgLoss = "",
		strAvgProfit = "", strPayoffRatio = "", strWinRatio = "", strlddBars = "", strlddStartPos = "", strlddEndPos = "", strmddPer = "", strmddValue = "", 
		strmddStartPos = "", strmddEndPos = "";

	$.each(analyticsData, function() {
		strDataInterval += "<th>" + this.dataInterval+ "</th>";
		strTotalReturns += "<td>" + this.totalReturns+ "</td>";
		strTotalTradesCount += "<td>" + this.totalTradesCount+ "</td>";
		strTotalProfit += "<td>" + this.totalProfit+ "</td>";
		strTotalProfitCount += "<td>" + this.totalProfitCount+ "</td>";
		strTotalLosses += "<td>" + this.totalLosses+ "</td>";
		strTotalLossTrades += "<td>" + this.totalLossTrades+ "</td>";
		strAvgReturns += "<td>" + this.avgReturns+ "</td>";
		strAvgReturnsPer += "<td>" + this.avgReturnsPer + "</td>";
		strAvgBarsHeld += "<td>" + this.avgBarsHeld+ "</td>";
		strProfitFactor += "<td>" + this.profitFactor+ "</td>";
		strAvgLoss += "<td>" + this.avgLoss+ "</td>";
		strAvgProfit += "<td>" + this.avgProfit+ "</td>";
		strPayoffRatio += "<td>" + this.payoffRatio+ " : 1</td>";
		strWinRatio += "<td>" + this.winRatio+ "%</td>";
		strlddBars += "<td>" + this.lddBars+ "</td>";
		strlddStartPos += "<td>" + this.lddStartPos+ "</td>";
		strlddEndPos += "<td>" + this.lddEndPos+ "</td>";
		strmddPer += "<td>" + this.mddPer+ "%</td>";
		strmddValue += "<td>" + this.mddValue+ "</td>";
		strmddStartPos += "<td>" + this.mddStartPos+ "</td>";
		strmddEndPos += "<td>" + this.mddEndPos+ "</td>";
	});
	
	htmlDebug = htmlDebug + "<table id='analytics' class='analytics' cellspacing='0' width='100%'><tr><th>EMA(" +
		majorEMA + ", " + minorEMA
		+ ")</th>" + strDataInterval + "</tr>"
		+ "<tr><td class='header'>Win Ratio (Profit Trades Count/Total Trades Count):</td>" + strWinRatio + "</tr>"
		+ "<tr><td class='header'>Payoff Ratio (Average Profit per trade/Average Loss per Trade):</td>" + strPayoffRatio + "</tr>" 
		+ "<tr><td class='header'>Profit Factor (Total Profit/Total Losses):</td>" + strProfitFactor + "</tr>" 

		+ "<tr><td class='header'>Total Trades Count:</td>" + strTotalTradesCount + "</tr>" 
		+ "<tr><td class='header'>Total Returns:</td>" + strTotalReturns + "</tr>" 
		+ "<tr><td class='header'>Average Rs/Trade:</td>" + strAvgReturns + "</tr>" 
		+ "<tr><td class='header'>Average %/Trade:</td>" + strAvgReturnsPer + "</tr>" 
		+ "<tr><td class='header'>Average Bars Held Per Trade:</td>" + strAvgBarsHeld + "</tr>" 

		+ "<tr><td class='header'>Total Profit Trades:</td>" + strTotalProfitCount + "</tr>" 
		+ "<tr><td class='header'>Total Profit:</td>" + strTotalProfit + "</tr>" 
		+ "<tr><td class='header'>Avg. Profit/Trade:</td>" + strAvgProfit + "</tr>" 

		+ "<tr><td class='header'>Total Losses Trades:</td>" + strTotalLossTrades + "</tr>" 
		+ "<tr><td class='header'>Total Losses:</td>" + strTotalLosses + "</tr>" 
		+ "<tr><td class='header'>Avg. Loss/Trade:</td>" + strAvgLoss + "</tr>" 

		+ "<tr><td class='header'>System Longest Drawdown bars:</td>" + strlddBars + "</tr>"
		+ "<tr><td class='header'>System Longest Drawdown Start:</td>" + strlddStartPos + "</tr>"
		+ "<tr><td class='header'>System Longest Drawdown End:</td>" + strlddEndPos + "</tr>"
		+ "<tr><td class='header'>System Maximum Drawdown %:</td>" + strmddPer + "</tr>"
		+ "<tr><td class='header'>System Maximum Drawdown Value:</td>" + strmddValue + "</tr>"
		+ "<tr><td class='header'>System Maximum Drawdown Start:</td>" + strmddStartPos + "</tr>"
		+ "<tr><td class='header'>System Maximum Drawdown End:</td>" + strmddEndPos + "</tr></table>";

	$("#divAnalytics").append(htmlDebug);
}

function CalculateDrawdowns(trades){
	var MDD = 0, MDDPos = 0; peak = [{high:-99999, pos:-1}], DD = 0, NAV = initialCapital, pos = 0, MDDValue = 0;
	$.each(trades, function() {
		NAV += this.profit;
		if (NAV > peak[peak.length - 1].high){ // peak will be the maximum value seen so far (0 to i)
			if ((pos - peak[peak.length - 1].pos) == 1){//if its previous trade pos was also a peak, then just update
				peak[peak.length - 1].pos = pos;
				peak[peak.length - 1].high = NAV;
			}
			else
				peak.push({high: NAV, pos: pos});
		}
		DD = 100.0 * (peak[peak.length - 1].high - NAV) / initialCapital; //peak[peak.length - 1].high;
		if (DD > MDD) {// Same idea as peak variable, MDD keeps track of the maximum drawdown so far.
			MDD = DD;
			MDDPos = pos;
			MDDValue = peak[peak.length - 1].high - NAV;
		}
		pos++;
	});
	//Calculate Maximum DrawDown duration.
	var lddStart=1, lddEnd=1, ldd=0, pos = 0, mddStart=-1, mddEnd=-1;
	for (pos = 0; pos < peak.length - 1; pos++){
		//Checking for Longest Drawdown by comparing max bars between DD
		if ((peak[pos+1].pos - peak[pos].pos) > ldd){
			ldd = (peak[pos+1].pos - peak[pos].pos);
			lddStart = peak[pos].pos; 
			lddEnd = peak[pos+1].pos;
		}
		//Checking for Maximum Drawdown by comparing max bars between DD
		if (peak[pos].pos <= MDDPos && MDDPos <=peak[pos+1].pos){
			mddStart = peak[pos].pos; 
			mddEnd = peak[pos+1].pos;
		}
	}
	if (mddStart == -1){
		mddStart = peak[peak.length - 1].pos;
		mddEnd = trades.length - 1;
	}
	return {
			lddStartPos: lddStart, 
			lddEndPos: lddEnd, 
			lddBars: ldd, 
			mddStartPos: mddStart, 
			mddEndPos: mddEnd,  
			mddPer:MDD, 
			mddValue:MDDValue
		};
}

function RunHistData(){
	chartData = getDataByInterval(iInterval);
	runHistVar = setInterval(function(){
			if (!bLoaded || !bRunning)
			{
				clearInterval(runHistVar);
			}
			iPos = iPos+1;
			if ((iPos + iSize) < chartData.length)
			{								
				curLoadedData = chartData.slice(iPos, iPos + iSize);
				UpdateChartDisplay();
				PlotPivotPoints(curLoadedData.length-2);
			}
			else
			{
				clearInterval(runHistVar);
			}
		}, refreshInterval);
}

function PlaybackTrade(TradeId){
	var chartData = getDataByInterval(iInterval);
	var tradeData = getTradesByInterval(iInterval);
	var minData = getDataByInterval(1);
	//
	var fromId = tradeData[TradeId].startCandle, ToId = tradeData[TradeId].endCandle;
	var boughtMinTime = tradeData[TradeId].startTime, soldMinTime = tradeData[TradeId].endTime;
	var buyMinId = 0, sellMinId = 0;
	//
	while (minData[buyMinId].time <= chartData[fromId-1].time){
		buyMinId++;
	}
	sellMinId = buyMinId;
	var minCtr = buyMinId;
	//
	while (minData[sellMinId].time < chartData[ToId+1].time/*soldMinTime*/){
		sellMinId++;
	}
	//
	iPos = Math.max(fromId + 1, iSize) - iSize;	
	curLoadedData = chartData.slice(iPos, iPos + iSize);
	var ctrLoaded = fromId - iPos;//offset for curLoadedData;
	
	curLoadedData[ctrLoaded].open = minData[minCtr].open;//open
	curLoadedData[ctrLoaded].high = minData[minCtr].high;//high
	curLoadedData[ctrLoaded].low = minData[minCtr].low;//low
	curLoadedData[ctrLoaded].close = minData[minCtr].close;//close
	playbackVar = setInterval(function(){
		if (minCtr <= sellMinId){
			curLoadedData[ctrLoaded].high = Math.max(curLoadedData[ctrLoaded].high, minData[minCtr].high);
			curLoadedData[ctrLoaded].low = Math.min(curLoadedData[ctrLoaded].low, minData[minCtr].low);
			curLoadedData[ctrLoaded].close = minData[minCtr].close;		
			UpdateChartDisplay();
			PlotPivotPoints(ctrLoaded-1);
			PlotTradeRange(chartData[fromId].time, chartData[ToId].time, tradeData[TradeId].entry, tradeData[TradeId].exit);
			//
			minCtr++;
			if (minCtr <= sellMinId && minData[minCtr].time > curLoadedData[ctrLoaded].time) {
				ctrLoaded++;
				//if the ctrLoaded is within the sliced data then fine else slice it again with new offset.
				if (ctrLoaded >= iSize) {
					iPos++;
					curLoadedData = chartData.slice(iPos, iPos + iSize);
					ctrLoaded--;
				}
				curLoadedData[ctrLoaded].open = minData[minCtr].open;//open
				curLoadedData[ctrLoaded].high = minData[minCtr].high;//high
				curLoadedData[ctrLoaded].low = minData[minCtr].low;//low
				curLoadedData[ctrLoaded].close = minData[minCtr].close;//close
			}
		}
		else{
			clearInterval(playbackVar);
		}
	}, refreshInterval);
}

function PlaybackAllTrades(){
	var tradeData = getTradesByInterval(iInterval);
	playbackAllVar = setInterval(function(){
			if (!bLoaded || !bPlaybacking){
				clearInterval(playbackAllVar);
			}			
			if (iTradePos < tradeData.length){								
				PlaybackTrade(iTradePos);
			} else{
				clearInterval(playbackAllVar);
			}
			iTradePos++;
		}, refreshInterval);
}

function CalculateEMA(todaysPrice, numberOfCandles, EMAYesterday){
	k = 2 / (numberOfCandles + 1);
	return todaysPrice * k + EMAYesterday * (1 - k);
}

function GenerateEMA(trades, numberOfCandles){
	if (trades.length < numberOfCandles)
		return;
	var EMAval = 0;
	for(iCtr = 0; iCtr<numberOfCandles; iCtr++){
		EMAval += trades[iCtr].close;
	}
	EMAval = EMAval/numberOfCandles;
	var prop = "EMA" + numberOfCandles;
	for(iCtr=numberOfCandles; iCtr<trades.length; iCtr++){
		EMAval = CalculateEMA(trades[iCtr].close, numberOfCandles, EMAval);
		trades[iCtr][prop] = EMAval;
	}
}

function FindPivotPoints(histData, pivots, histCtr, verifyBy){
	var fromTradeId =0;
	if (pivots.length > 0){
		fromTradeId = pivots[pivots.length - 1].histCtr;
	}
	if ((fromTradeId + 2 * verifyBy) <= histCtr){
		var midCtr = histCtr - verifyBy;
		var isPivotLow = true, isPivotHigh = true;
		for(iCtr = 0; iCtr < verifyBy; iCtr++){
			//checking for pivot high
			if (isPivotHigh && 
				!((histData[midCtr - iCtr].high >= histData[midCtr - iCtr - 1].high) &&
					(histData[midCtr + iCtr].high >= histData[midCtr + iCtr + 1].high))){
				isPivotHigh = false;
			}
			//checking for pivot low
			if (isPivotLow && 
				!((histData[midCtr - iCtr].low <= histData[midCtr - iCtr - 1].low) &&
					(histData[midCtr + iCtr].low <= histData[midCtr + iCtr + 1].low))){
				isPivotLow = false;
			}
			//if both are false, then no need to check further
			if (!isPivotHigh && !isPivotLow){
				return;
			}
		}
		if (isPivotHigh){
			ppSwingHigh = histData[midCtr].high;
			pivots.push({type: "H", price: histData[midCtr].high, histCtr: midCtr});
		}else if (isPivotLow){
			ppSwingLow = histData[midCtr].low;
			pivots.push({type: "L", price: histData[midCtr].low, histCtr: midCtr});
		}
	}
}
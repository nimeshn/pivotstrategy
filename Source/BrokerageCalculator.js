
function CalculateReturns(buyprice, sellprice, sellquantity)
{
	var stockmarket=0.000021;
	var turn = buyprice * sellquantity;   
	var sellpriceturnover = sellprice * sellquantity;   
	var mtmmtm = sellpriceturnover - turn;;
	var totalturnover=turn+sellpriceturnover;	
	var sellbroker= ((0.01/100)*sellpriceturnover);//.toFixed(parseInt(2));
	var buybroker= ((0.01/100)*turn);//.toFixed(parseInt(2));

	if(sellbroker>20){
		sellbroker=20;
	}
	if(buybroker>20){
		buybroker=20;
	}

	var broker= sellbroker + buybroker; 
	var stt= (0.0001 * sellpriceturnover).toFixed(parseInt(0));
	var ttc=(totalturnover * stockmarket ).toFixed(parseInt(2));
	var totalst=(parseFloat(ttc) + parseFloat(broker)).toFixed(parseInt(2));
	var service=(totalst*0.12).toFixed(parseInt(2));
	var education=(0.02 * service).toFixed(parseInt(2));
	var higheducation=(0.01 * service).toFixed(parseInt(2));
	var sebi=(20*totalturnover/10000000).toFixed(parseFloat(2));


	var totaltax = parseFloat(higheducation) + parseFloat(education) + parseFloat(service) +  parseFloat(ttc) + 
		parseFloat(stt) + parseFloat(broker)+parseFloat(sebi);
	var pob = parseFloat(totaltax)/parseFloat(sellquantity);
	var nmtm = parseFloat(sellpriceturnover - turn) - parseFloat(totaltax);

	return [totaltax, nmtm];
}

function formatCurrency(total) {
    var neg = false;
    if(total < 0) {
        neg = true;
        total = Math.abs(total);
    }
    return (neg ? "-Rs." : 'Rs.') + parseFloat(total, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
}

var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = [-1, 1][+!reverse];

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}
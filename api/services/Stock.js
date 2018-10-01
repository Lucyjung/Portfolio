module.exports = {

  getPrice: function(symbols, callback) {

    if (symbols instanceof Array){
      var async = require('async')
      async.map(symbols , YahooStock.getPrice, function(err, result){

        callback(err, result);

      })
    }
    else{
      YahooStock.getPrice(symbols , function (err, price){

          callback(err, price);

      })
    }
  },
  getHistoricalPrice : function (symbols, callback){
    if (symbols instanceof Array){
      var async = require('async')
      async.map(symbols , BloombergStock.getHistoricalPrice, function(err, result){
        callback(err, result);
      })
    }
    else{
      BloombergStock.getPrice(symbols , function (err, price){
        callback(err,price)
      })
    }
  }
};

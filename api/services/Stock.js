module.exports = {

  getPrice: function(symbols, callback) {

    if (symbols instanceof Array){
      var async = require('async')
      async.map(symbols , BloombergStock.getPrice, function(err, result){
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

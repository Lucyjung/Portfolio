module.exports = {

  getPrice: function(symbols, callback) {

    if (symbols instanceof Array){
      var async = require('async')
      async.map(symbols , BloombergStock.getPrice, function(err, result){
        if (err){
          GoogleStock.getPrice(symbols,function (err, response){
            var returnObj = [];
            symbols.forEach(function(item, key){
              returnObj[key] = 0;
            });
            response.forEach(function(item, key){
              var index = symbols.indexOf(item.t);
              if (index > -1){
                returnObj[index] = item.l
              }
            })
            callback(err, returnObj);
          })
        }else{
          callback(err, result);
        }

      })
    }
    else{
      BloombergStock.getPrice(symbols , function (err, price){
        if (err){
          GoogleStock.getPrice(symbols,function (err, response){
            if (response != undefined){
              callback(err, response[0].l);
            }
            else{
              callback('stock not found', 0)
            }
          })
        }else{
          callback(err, price);
        }
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

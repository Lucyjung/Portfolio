// Stock Service by Yahoo Finance Api
module.exports = {

  getPrice: function(symbols, callback) {

    // working
    var yahooFinance = require('yahoo-finance');

    param = symbols+'.BK';
    try {
      yahooFinance.quote({
        symbol: param,
        modules: [ 'price'] // see the docs for the full list
      }, function(error, data) {
        if (data){
          callback(error,data.price.regularMarketPrice);
        }else{
          callback(null,0);
        }
        
      });
    }catch(err){
      callback(err,0);
    }
    

  }
};

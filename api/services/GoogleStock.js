// Stock Service by Google Finance Api
module.exports = {

  getPrice: function(symbols, callback) {

    // working
    var googleStocks = require('google-stocks');
    var param = [];
    if (symbols instanceof Array){
      for (var i in symbols){
        param.push('THB:'+symbols[i])
      }
    }
    else{
      param.push('THB:'+symbols)
    }
    googleStocks(param, function(error, data) {
      callback(null,data);
    });

  }
};

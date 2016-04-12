/**
 * Created by Z510 on 11/4/2559.
 */
module.exports = {

  getPrice: function(symbol, callback) {

    var request = require('request');
    var url = 'http://www.bloomberg.com/markets/api/bulk-time-series/price/'+symbol+'%3ATB?timeFrame=1_YEAR';
    request(url, function (error, response, body) {
      try {
        var data = JSON.parse(body);
        callback(error, data[0].lastPrice || null)
      }catch (e){
        callback('data error')
      }


    })
  },
  getHistoricalPrice : function (symbol, callback){
    var request = require('request');
    var url = 'http://www.bloomberg.com/markets/api/bulk-time-series/price/'+symbol+'%3ATB?timeFrame=YTD';
    request(url, function (error, response, body) {
      try {
        var data = JSON.parse(body);
        callback(error, data[0].price || null)
      }catch (e){
        callback('data error')
      }


    })
  }
};

// Fund Service
var file_name = "fund.csv"
module.exports = {

  getPrice: function(symbols, subtract_day ,callback) {

    if (symbols.length <= 0){
      callback(null,null)
    }
    else{
      var http = require('http');
      var fs = require('fs');

      var csv = require('fast-csv')
      var file = fs.createWriteStream(file_name);

      if (!subtract_day) subtract_day = 0;
      var moment = require('moment');
      var d= moment().subtract(subtract_day, 'days').add(543,'year').format('DD/MM/YYYY');

      var request = http.get("http://www.thaimutualfund.com/AIMC/aimc_navCenterDownloadRepRep.jsp?date="+d, function(response) {
        var test= response.pipe(file);
      });

      var result = {};
      file.on('close', function (){
        var stream = fs.createReadStream(file_name);
        var csvStream = csv()
          .on("data", function(data){
            if (data.length > 0){
              if (symbols.indexOf(data[6]) > -1){
                result[data[6]] = data[8];
              }
            }

          })
          .on('error', function (err){
            callback(err)
          })
          .on("end", function(){
            callback(null,result)
          });
        stream.pipe(csvStream);
      })
    }
  },
  getPriceWithRetries: function(symbols,callback){
    var async = require('async');
    var count = 0;
    var limit_retries = 5;
    async.whilst(
      function () { return count < limit_retries; },
      function (callback) {

        Fund.getPrice(symbols, count , function (err, price_list){
          count++;
          if (price_list != undefined && (Object.keys(price_list).length == symbols.length)){
            count = limit_retries;
          }
          callback(null, price_list);
        })
      },
      function (err, price_list) {
        callback(err, price_list)
      }
    );
  }
};

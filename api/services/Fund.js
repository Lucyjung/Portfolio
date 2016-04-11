// Fund Service
var file_name = "fund.csv"
module.exports = {

  getPrice: function(symbols, callback) {

    if (symbols.length <= 0){
      callback(null,null)
    }
    else{
      var http = require('http');
      var fs = require('fs');

      var csv = require('fast-csv')
      var file = fs.createWriteStream(file_name);


      var moment = require('moment');
      var d;
      if (moment().format('HH') < 20 ){
        if (moment().format('dddd') == 'Monday'){
          d = moment().subtract(3, 'days').add(543,'year').format('DD/MM/YYYY');
        }
        else if (moment().format('dddd') == 'Sunday'){
          d = moment().subtract(2, 'days').add(543,'year').format('DD/MM/YYYY');
        }else{
          d = moment().subtract(1, 'days').add(543,'year').format('DD/MM/YYYY');
        }
      }
      else {
        if (moment().format('dddd') == 'Sunday'){
          d = moment().subtract(2, 'days').add(543,'year').format('DD/MM/YYYY');
        }else if (moment().format('dddd') == 'Saturday' || moment().format('dddd') == 'Friday'){
          d = moment().subtract(1, 'days').add(543,'year').format('DD/MM/YYYY');
        }else{
          d = moment().add(543,'year').format('DD/MM/YYYY');
        }
      }
      console.log(d);
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
            //callback(null,null)
          })
          .on("end", function(){
            callback(null,result)
          });
        stream.pipe(csvStream);
      })
    }
  }
};

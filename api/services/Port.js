// Port Service
module.exports = {

  getPort: function(query, cb) {

    var async = require('async');
    var stockArrayNames = [];
    var fundArrayName = [];
    var cashArrayName = [];
    async.waterfall([
      // First
      function (callback){
        Asset.find(query).exec(function (err, assetList){
          for (var i in assetList){
            if (assetList[i].type == "Stock"){
              stockArrayNames.push(assetList[i].name)
            }
            else if (assetList[i].type == "Fund"){
              fundArrayName.push(assetList[i].name)
            }
            else{
              cashArrayName.push(assetList[i].name);
            }
          }
          callback (null, assetList)
        })
      },
      // Second
      function (assetList, callback){
        Stock.getPrice(stockArrayNames,function (err, data){
          var stockPriceList = {};
          for (var i in stockArrayNames){
            stockPriceList[stockArrayNames[i]] = data[i];
          }
          callback (null, assetList, stockPriceList)
        })

      },
      // Third
      function (assetList, stockPriceList, callback){
        Fund.getPriceWithRetries(fundArrayName, function (err, fundPriceList){
          callback(null, assetList, stockPriceList, fundPriceList)
        })
      },
      // Forth
      function (assetList, stockPriceList, fundPriceList , callback){
        for(var i in assetList){
          if (assetList[i].type == "Stock"){
            assetList[i].lastPrice = stockPriceList[assetList[i].name];
          }else if(assetList[i].type == "Fund") {
            if (fundPriceList != undefined){
              assetList[i].lastPrice = fundPriceList[assetList[i].name];
            }
            else if (assetList[i].marketPrice != undefined){
              assetList[i].lastPrice = assetList[i].marketPrice;
            }
            else{
              callback ('Fund data error')
            }

          }else{
            assetList[i].lastPrice = assetList[i].averagedPrice;
          }
          assetList[i].lastPrice = parseFloat(assetList[i].lastPrice);
          assetList[i].cost = assetList[i].costValue;
          assetList[i].marketValue = assetList[i].volume * assetList[i].lastPrice;
        }
        callback (null, assetList)
      }
    ],function (err, result){
      return cb(null, result);
    });

  },
  getSummary : function (callback){
    var summary = {
      'Total Cost' : 0,
      'Total Market' : 0,
      'Total Margin' : 0,
      Stock : 0,
      Fund : 0,
      Cash :0,
      Total : 0,
    }
    Port.getPort(null,function (err, result){
      for(var i in result){
        if (result[i].type == "Stock"){
          summary.Stock += result[i].marketValue
        }else if (result[i].type == "Fund"){
          summary.Fund += result[i].marketValue
        }else{
          summary.Cash += result[i].marketValue
        }
        summary['Total Cost'] += result[i].cost
        summary['Total Market'] += result[i].marketValue
      }
      summary['Total Margin'] = summary['Total Market'] - summary['Total Cost'];
      summary['Total'] = summary.Stock + summary.Fund + summary.Cash;
      callback(null, summary);
    })

  },
  getRatio : function (callback){
    var summary = {
      Stock : 0,
      Fund : 0,
      Cash :0,
    }
    Port.getPort(null,function (err, result){
      for(var i in result){
        if (result[i].type == "Stock"){
          summary.Stock += result[i].marketValue
        }else if (result[i].type == "Fund"){
          summary.Fund += result[i].marketValue
        }else{
          summary.Cash += result[i].marketValue
        }
      }
      var total = summary.Stock + summary.Fund + summary.Cash;
      var ratio = {
        stock : summary.Stock / total,
        fund : summary.Fund / total,
        cash : summary.Cash / total,
      }
      callback(null, ratio);
    })

  }
};

/**
 * StockController
 *
 * @description :: Server-side logic for managing Assets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  getStock : function (req, res){
    Asset.findOne({name : req.param('name')}).exec(function(err, record){

      var prev_vol = 0;
      var total_vol = 0;
      var cost = 0;

      for (var i in record.history){
        var action = record.history[i].action.toUpperCase()
        var vol = record.history[i].volume;
        var amount = record.history[i].amount
        if (action == "BUY"){
          total_vol += vol
          cost += amount;
        }else if (action == "SELL"){
          total_vol -= vol
          cost -= amount;
        }else {
          cost -= amount;
        }
        record.history[i].date = record.history[i].date.toDateString();
        record.history[i].action = action;
        record.history[i].price = parseFloat(amount/vol);
        record.history[i].cost = parseFloat(cost);
        record.history[i].total_vol = parseFloat(total_vol);
        record.history[i].avgPrice = parseFloat(cost/total_vol);
      }
      return res.json(record)
    })
  },
  getPort : function (req, res){

    var query = {};
    switch (req.query.filter){
      case 'gained':
      case 'loss':
      case 'inport':
        query = {volume : {'>' : 0}};
        break;
      case 'sold':
        query = {volume : {'<=' : 0}};
        break;
      case 'name':
        query = {name : req.query.name || null};
        break;
      case 'type':
        query = {type : req.query.type || null,volume : {'>' : 0} };
        break;
      default:
        break;
    }
    Port.getPort(query, function(err, result){
      if (req.query.filter == 'gained' || req.query.filter == 'loss'){
        var gainedIndexes = [];
        var lossIndexes = [];
        result.forEach(function(item, index){
          if (item.cost <= item.marketValue){
            gainedIndexes.push(index)
          }
          else{
            lossIndexes.push(index);
          }

        })
        if (req.query.filter == 'gained' ){
          for (var i in lossIndexes){
            result.splice(lossIndexes[i] - i ,1)
          }
        }else{
          for (var i in gainedIndexes){
            result.splice(gainedIndexes[i] - i,1)
          }
        }
      }
      return res.json(result);
    })
  },
  action: function(req, res){
    self = this;

    var async = require('async');

    async.waterfall([
      function (callback){
        Asset.findOne({name: req.body.asset_name}).exec(function (err, record) {
          callback(err, record);
        });
      },
      function (asset_info, callback){
        var asset_type = req.body.asset_type;
        switch (asset_type.toLowerCase()){
          case 'stock':
            Stock.getPrice(req.body.asset_name, function (err, price){
              var current_price = price;
              req.body.current_price = current_price;
              callback (err, asset_info)
            });
            break;
          case 'fund':
            Fund.getPriceWithRetries([req.body.asset_name], function (err, current_price){
              req.body.current_price = current_price[req.body.asset_name];
              callback (err, asset_info)
            })
            break;
          default:
            callback(null,asset_info)
                break;
        }
      }

      ],function (err, result) {var action_type = req.body.action_type;

        switch (action_type.toLowerCase()){
          case "buy":
            self.buy(result, req.body, function (){
              res.json({status : 'done'})
            });
            break;
          case "sell":
            self.sell(result, req.body, function (){
              res.json({status : 'done'})
            });
            break;
          case "dividend":
            self.dividend(result, req.body, function (){
              res.json({status : 'done'})
            });
            break;
          default:
            res.json({status : 'done'})
            break;
        }
    });
  },
  history: function(req, res){
    if(req.method == 'POST'){
      self = this;
      Asset.findOne({name: req.body.asset_name}).exec(function (err, record) {
        if (req.body.amount > record.costValue ){
          if (req.body.volume == record.volume) req.body.volume = 0
          req.body.amount -= record.costValue;
          self.buy(record, req.body, function (){
            res.json({status : 'done'})
          });
        }
        else if (req.body.amount < record.costValue ){
          if (req.body.volume == record.volume) req.body.volume = 0;
            req.body.amount = record.costValue - req.body.amount;
            self.sell(record, req.body, function (){
            res.json({status : 'done'})
          });
        }
        else if (req.body.volume > record.volume){
          req.body.amount = 0;
          self.dividend(record, req.body, function (){
            res.json({status : 'done'})
          });
        }
      });
    }

  },
  buy : function (query_data , update_data, callback){
    var date = update_data.date ? new Date(update_data.date) : new Date();
    if (query_data != undefined ){
      data = {};
      data.volume = parseFloat(update_data.volume) + parseFloat(query_data.volume);
      data.costValue =  query_data.costValue + parseFloat(update_data.amount);
      data.averagedPrice = ( data.costValue / data.volume);
      data.updatedAt = date;
      data.history = query_data.history;
      data.history.push({
        action : update_data.action_type || 'Buy',
        volume : parseFloat(update_data.volume),
        amount : parseFloat(update_data.amount),
        date : date
      })
      data.marketPrice = update_data.current_price || null;
      Asset.update({ name : query_data.name}, data).exec(function afterwards(err, updated){
        callback();
      });
    }
    else{
      data = {
        name : update_data.asset_name,
        volume : parseFloat(update_data.volume),
        costValue : parseFloat(update_data.amount),
        averagedPrice  : parseFloat(update_data.amount) / parseFloat(update_data.volume),
        type : update_data.asset_type,
        createdAt : date,
        updatedAt : date
      }
      data.history = [{
        action : update_data.action_type || 'Buy',
        volume : parseFloat(update_data.volume),
        amount : parseFloat(update_data.amount),
        date : date
      }];
      data.marketPrice = update_data.current_price || null;
      Asset.create(data).exec(function createCB(err, created){
        console.log('Created asset with name ' + created.name);
        callback();
      });
    }
  },
  sell : function (query_data , update_data, callback){
    var date = update_data.date ? new Date(update_data.date) : new Date();
    if (query_data != undefined){
      data = {};
      data.volume =  parseFloat(query_data.volume) - parseFloat(update_data.volume) ;
      data.costValue =  query_data.costValue - parseFloat(update_data.amount);
      if (data.volume  > 0){
        data.averagedPrice = data.costValue / data.volume;
      }else{
        var profit_data = {
          name : query_data.name,
          profit : ((parseFloat(update_data.amount)) - query_data.costValue),
          createdAt : date,
          updatedAt : date
        }
        Profit.create(profit_data).exec(function createCB(err, created){
          Profit.publishCreate( created );
          console.log('Created profit with name ' + created.name);
        });
        data.costValue = 0;
      }

      data.updatedAt = new Date(update_data.date);
      data.history = query_data.history;
      data.history.push({
        action : update_data.action_type || 'Sell',
        volume : parseFloat(update_data.volume),
        amount : parseFloat(update_data.amount),
        date : date
      })

      data.marketPrice = update_data.current_price || null;
      //console.log(data)
      Asset.update({ name : query_data.name}, data).exec(function afterUpdate(err, updated){
        callback();
      });
    }
    else{
      callback('error');
    }
  },
  dividend : function (query_data , update_data, callback){
    var date = update_data.date ? new Date(update_data.date) : new Date();
    if (query_data != undefined){
      data = {};
      data.costValue =  query_data.costValue - parseFloat(update_data.amount);
      data.averagedPrice = data.costValue / update_data.volume;

      data.volume = update_data.volume;
      data.updatedAt = date;
      data.history = query_data.history;
      data.history.push({
        action : update_data.action_type || 'Dividend',
        volume : parseFloat(update_data.volume),
        amount : parseFloat(update_data.amount),
        date : date
      })
      data.marketPrice = update_data.current_price || null;
      Asset.update({ name : query_data.name}, data).exec(function afterUpdate(err, updated){
        callback();
      });
    }
    else{
      callback('error');
    }
  },

  getCurrentSummary : function (req, res){
    Port.getSummary(function(err, summary){
      return res.json(summary);
    })
  },
  getHistoricalAsset : function (req, res){
    Stock.getHistoricalPrice(['PTT'], function (err, price_list){
      return res.json(price_list);
    })
  },
  getPortRatio : function (req, res){
    Port.getRatio(function (err, ratio){
      return res.json(ratio);
    })
  },

  // required
  // TODO : Back button

  // optional
  // TODO : historical graph for port growth (use bloomberg api ? http://www.bloomberg.com/markets/api/bulk-time-series/price/KTB%3ATB?timeFrame=1_YEAR) + http://codepen.io/stefanjudis/pen/gkHwJ
  // TODO : Page cash flow (need to refactor old one)
  // TODO : Autocomplete ? with Suggested volume for dividend

};


/**
 * ProfitController
 *
 * @description :: Server-side logic for managing Profits
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getCurrentSummary : function (req, res){
    Port.getSummary(function(err, summary){
      return res.json(summary);
    })
  }
};


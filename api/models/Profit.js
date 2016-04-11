/**
 * Profit.js
 *
 * @description :: keep tracking of profit for stock selling
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName : 'profit',
  attributes: {
    name : {
      type : 'string'
    },
    profit : {
      type : 'float'
    }
  },
  beforeCreate: function (values, cb) {

    values.owner = 'Lucy'
    cb();
  }
};


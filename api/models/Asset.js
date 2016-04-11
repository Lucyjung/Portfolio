/**
 * Asset.js
 *
 * @description :: Model Schema for asset
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName : 'asset',
  attributes: {
    name : {
      type : 'string'
    },
    type :{
      type : 'string',
    },
    volume : {
      type : 'float'
    },
    averagedPrice : {
      type : 'float'
    },
    history : {
      type : 'array'
    }
  },
  beforeCreate: function (values, cb) {

    values.owner = 'Lucy'
    cb();
  }
};


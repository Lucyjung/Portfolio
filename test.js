// var yahooFinance = require('yahoo-finance');

 
// // This replaces the deprecated snapshot() API
// yahooFinance.quote({
//   symbol: 'AAV.BK',
//   modules: [ 'price'] // see the docs for the full list
// }, function (err, quotes) {
//   console.log(quotes)
// });

// var request = require('request');
// var url = 'http://www.bloomberg.com/markets/api/bulk-time-series/price/'+'DCC'+'%3ATB?timeFrame=1_YEAR';
// request(url, function (error, response, body) {
//     console.log(body)


// })
var googleFinance = require('google-finance');
 
googleFinance.historical({
  symbol: 'NASDAQ:AAPL',
  from: '2014-01-01',
  to: '2014-12-31'
}, function (err, quotes) {
  console.log(quotes)
});
// const axios = require('axios');

// axios.get(url)
//   .then(response => {
//     console.log(response);
//   })
//   .catch(error => {
//     console.log(error);
//   });
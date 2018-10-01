// my Own javascript


// init

pageControl('summary');

// port button
$("#port,#main,#side-header").click(function(){
  pageControl('port');
  updatePortTable(null);
  updateSummaryTable();

});

// cashFlow button
$("#cashFlow").click(function(){
  pagePortVisible(false);
});

// default load and show table
$('#table-port').ready(function(){
  updatePortTable(null);
})
$('#table-summary').ready(function(){
  updateSummaryTable();
})

$('#side-nav-list').ready(function(){
  updateSideNavList(this)
});

// button group action type
$('.btn-group #button_action_type').on("click",function(){
  $('.btn-group #button_action_type').each(function(){
    $(this).removeClass('active');
  })
  $(this).addClass('active');
  $('#action_type').val($(this).text());
})

// button group asset type
$('.btn-group #button_asset_type').on("click",function(){
  $('.btn-group #button_asset_type').each(function(){
    $(this).removeClass('active');
  })
  $(this).addClass('active');
  $('#asset_type').val($(this).text());
})

// modal handler
$('#modal-container-801726').ready(function(){
  $(this).find('#model-submit').click(function(){
    var postData = {}
    getFormData('form-group', postData);
    ajaxPost('action',postData, function(){
      updatePortTable(null);
      updateSummaryTable();
      updateSideNavList();
    });
  })
})

$('#model-edit-button').on("click",function(){
  var postData = {};
  getFormData('form-edit-group', postData);
  ajaxPost('history',postData, function(){
    updatePortTable(null);
    updateSummaryTable();
    updateSideNavList();
  });
})

$('#side-nav-in-port').on("click",function(){
  pageControl('port');
  updatePortTable('filter=inport');
})
$('#side-nav-gained').on("click",function(){
  pageControl('port');
  updatePortTable('filter=gained');
})
$('#side-nav-loss').on("click",function(){
  pageControl('port');
  updatePortTable('filter=loss');
})
$('#side-nav-sold').on("click",function(){
  pageControl('port');
  updatePortTable('filter=sold');
})
$('#side-nav-stock').on("click",function(){
  pageControl('port');
  updatePortTable('filter=type&type=stock');
})
$('#side-nav-fund').on("click",function(){
  pageControl('port');
  updatePortTable('filter=type&type=fund');
})
$('#side-nav-cash').on("click",function(){
  pageControl('port');
  updatePortTable('filter=type&type=cash');
})

$('#navbar-search').find('.btn').on("click",function(){
  pageControl('port');
  var name = $('#navbar-search').find('.form-control').val();
  updatePortTable('filter=name&name='+ name.toUpperCase());
})

$('#main ,#summary').on("click",function(){
  pageControl('summary');
})

// socket IO

io.socket.on('profit', function gotNewProfit (data) {
  console.log(data);
  appendProfitTable(data.data)
});
// Using .get('/profit') will retrieve a list of current Profit models,
io.socket.get('/profit', function gotResponse(body, response) {
  createProfitTable(body);
})

// jquery UI
$(function() {
  // date picker
  $( "#datepicker" ).datepicker();

});


// Sorting

var table = $('#table-port');

$('#table-port-index, #table-port-symbol, #table-port-type, #table-port-volume, #table-port-avg-price, #table-port-last-price, #table-port-cost, #table-port-market, #table-port-pl')
  .wrapInner('<span title="sort this column"/>')
  .each(function(){

    var th = $(this),
      thIndex = th.index(),
      inverse = false;

    th.click(function(){

      table.find('td').filter(function(){

        return $(this).index() === thIndex;

      }).sortElements(function(a, b){

        return $.text([a]) > $.text([b]) ?
          inverse ? -1 : 1
          : inverse ? 1 : -1;

      }, function(){

        // parentNode is the element we want to move
        return this.parentNode;

      });

      inverse = !inverse;

    });

  });


// Loading
var $loading = $('#loadingDiv').hide();
$(document)
  .ajaxStart(function () {
    $loading.show();
  })
  .ajaxStop(function () {
    $loading.hide();
  });

// General function

function ajaxGet(url, callback){
  $.ajax({
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
          var percentComplete = evt.loaded / evt.total * 100;
          //$('.progress').css({
          //  width: percentComplete * 100 + '%'
          //});
          $('.progress-bar').css('width', percentComplete+'%').attr('aria-valuenow', percentComplete);
        }
      }, false);
      return xhr;
    },
    type : "GET",
    url: url
  }).done(function(data){
    callback(data);
  })
}

function ajaxPost(url, data, callback){
  $.ajax({
    type : "POST",
    url: url,
    data : data
  }).done(function(data){
    callback(data);
  })
}

// Table-Port
function updatePortTable(option){
  $('#table-port > tbody').children().each(function(){
    this.remove();
  });
  var endPoint = 'port'
  if (option != null){
    endPoint += '/?' + option;
  }

  ajaxGet(endPoint, function (data){
    for ( var i in data){
      var tr = '<tr>'
      var order = parseInt(i)+1;
      order = order < 10 ? "0"+order : order;
      if (data[i].cost < data[i].marketValue){
        tr = '<tr class="success">'
      } else if (data[i].cost > data[i].marketValue) {
        tr = '<tr class="danger">'
      }
      if (!data[i].lastPrice){
        data[i].lastPrice = 0;
      }

      var percentage = data[i].volume > 0 ? (data[i].lastPrice - data[i].averagedPrice)/data[i].averagedPrice*100:0;
      percentage = percentage.toFixed(2);
      $('#table-port > tbody:last-child').append('' +
        tr +
        '<td>' + order + '</td>' +
        '<td  class="stocklink"><a href="#">' + data[i].name + '</a></td>' +
        '<td>' + data[i].type + '</td>' +
        '<td>' + data[i].volume + '</td>' +
        '<td>' + data[i].averagedPrice.formatMoney() + '</td>' +
        '<td>' + data[i].lastPrice.formatMoney() + '</td>' +
        '<td>' + data[i].cost.formatMoney() + '</td>' +
        '<td>' + data[i].marketValue.formatMoney() + '</td>' +
        '<td>' + percentage + '</td>' +
        '<td>' + '<span class="glyphicon glyphicon-edit" aria-hidden="true" name=' + data[i].name + '></span>'+ '</td>' +
        '</tr>');
    }
    initStockEditLink('glyphicon');
    initStockLink('stocklink');

  })
}

// Table-summary
function updateSummaryTable(){
  $('#table-summary > tbody').children().each(function(){
    this.remove();
  });
  ajaxGet('curSummary', function (data){
    var index = 1;
    for ( var i in data){
      var tr = '<tr>'
      if (data[i] > 0){
        tr = '<tr class="success">'
      } else if (data[i] < 0 ) {
        tr = '<tr class="danger">'
      }else{
        tr = '<tr class="active">'
      }
      $('#table-summary > tbody:last-child').append('' +
        tr +
        '<td>' + (index++)+ '</td>' +
        '<td>' + i + '</td>' +
        '<td>' + data[i].formatMoney() + '</td>' +
        '</tr>');
    }
  })
}

// Table-stock
function createStockTable(data){
  $('#table-stock > tbody').children().each(function(){
    this.remove();
  });

  $('#panel-stock-title').text(data.name + ' => Volume : ' + data.volume + ' Cost : ' + data.costValue)
  for (var i in data.history) {

    $('#table-stock > tbody:last-child').append('' +
      '<tr>' +
      '<td>' + data.history[i].date + '</td>' +
      '<td>' + data.history[i].action + '</td>' +
      '<td>' + data.history[i].volume + '</td>' +
      '<td>' + data.history[i].price + '</td>' +
      '<td>' + data.history[i].amount.formatMoney() + '</td>' +
      '<td>' + data.history[i].cost.formatMoney() + '</td>' +
      '<td>' + data.history[i].total_vol + '</td>' +
      '<td>' + data.history[i].avgPrice + '</td>' +
      '</tr>'
    )
  }
}

// Table-profit
function createProfitTable(data){
  $('#table-profit > tbody').children().each(function(){
    this.remove();
  });
  for ( var i in data){
    appendProfitTable(data[i])
  }
}
function appendProfitTable(data){

    var tr = '<tr>'
    //var order = parseInt(i)+1;
    if (data.profit >= 0){
      tr = '<tr class="success">'
    } else{
      tr = '<tr class="danger">'
    }
    var order = $('#table-profit > tbody').children().size() + 1;
    $('#table-profit > tbody:last-child').append('' +
      tr +
      '<td>' + order + '</td>' +
      '<td>' + data.name + '</td>' +
      '<td>' + data.profit.formatMoney() + '</td>' +
      '</tr>');
}

// Entire page-port
function pagePortVisible(visible){
  if (visible == true){
    $('#page-port').show();
  }else{
    $('#page-port').hide();
  }
}

// Entire page-stock
function pageStockVisible(visible){
  if (visible == true){
    $('#page-stock').show();
  }else{
    $('#page-stock').hide();
  }
}

// Entire page-summary
function pageSummaryVisible(visible){
  if (visible == true){
    $('#page-summary').show();
  }else{
    $('#page-summary').hide();
  }
}

// Page control
function pageControl(mode){
  switch (mode){
    case 'port':
      pagePortVisible(true);
      pageStockVisible(false);
      pageSummaryVisible(false);
        break;
    case 'stock':
      pagePortVisible(false);
      pageStockVisible(true);
      pageSummaryVisible(false);
          break;
    case 'summary':
      pagePortVisible(false);
      pageStockVisible(false);
      pageSummaryVisible(true);
    default:
          break;
  }
}
function initStockLink(classname){
  $('.'+classname).click(function(){
    //pageControl('stock')
    //

    var assetName = $(this).text();
    ajaxGet('stock/' + assetName, function (data){
      pageControl('stock');
      createStockTable(data);
    })
  })
}
function initStockEditLink(classname){
  $('.'+classname).click(function(){
    //pageControl('stock')
    //
    //var assetName = $(this).text();
    var assetName = $(this).attr('name');
    //
    ajaxGet('Asset/?name=' + assetName, function (data){
      $("#modal-container-detail1").modal('show');
      $("#edit-asset-name").val(assetName);
      $("#edit-asset-volume").val(data[0].volume);
      $("#edit-asset-amount").val(data[0].costValue);
    })
  })
}

// Side-nav-list
function updateSideNavList(){

  ajaxGet('port', function (data){

    var portInfo = {
      inPort : 0,
      gained : 0,
      loss : 0,
      sold : 0,
      stock : 0,
      fund : 0,
      cash : 0
    }
    data.forEach(function(item){
      if (item.volume <= 0){
        portInfo.sold++;
      }else{
        portInfo.inPort++;
        if (item.cost <= item.marketValue){
          portInfo.gained++;
        }
        else{
          portInfo.loss++;
        }
        switch (item.type.toLowerCase()){
          case 'stock':
            portInfo.stock++;
            break;
          case 'fund':
            portInfo.fund++;
            break;
          case 'cash' :
            portInfo.cash++;
            break;
          default:
            break;
        }
      }

    })

    $('#side-nav-sold').find('.badge').text(portInfo.sold);
    $('#side-nav-in-port').find('.badge').text(portInfo.inPort);
    $('#side-nav-gained').find('.badge').text(portInfo.gained);
    $('#side-nav-loss').find('.badge').text(portInfo.loss);
    $('#side-nav-stock').find('.badge').text(portInfo.stock);
    $('#side-nav-fund').find('.badge').text(portInfo.fund);
    $('#side-nav-cash').find('.badge').text(portInfo.cash);
  })
}
function getFormData(className, formData){
  $('.'+className).find("input[type='text']").each(function () {
    var name = $(this).attr('name');
    if (name != undefined){
      formData[name] = $(this).val();
    }
  });

  $('.'+className).find("input[type='hidden']").each(function () {
    var name = $(this).attr('name');
    if (name != undefined){
      formData[name] = $(this).val();
    }
  });

  $('.'+className).find("input[type='radio']:checked").each(function () {
    var name = $(this).attr('name');
    formData[name] = $(this).val();
  });
}

// Prototype

Number.prototype.formatMoney = function(c, d, t){
  var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


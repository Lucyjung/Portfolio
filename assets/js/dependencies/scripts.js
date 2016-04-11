// my Own javascript


// init

pageControl('port');

// port button
$("#port,#main,#side-header").click(function(){
  //console.log('click port');
  pageControl('port');
  updatePortTable();
  updateSummaryTable();

});

// cashFlow button
$("#cashFlow").click(function(){
  pagePortVisible(false);
});

$(".stocklink").click(function(){
  console.log( 'test')
})

// default load and show table
$('#table-port').ready(function(){
  updatePortTable();
})
$('#table-summary').ready(function(){
  updateSummaryTable();
})

$('#side-nav-list').ready(function(){
  createSideNavList(this)
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
      updatePortTable();
      updateSummaryTable();
      createSideNavList();
      console.log('done')
    });
  })
})

$('#model-edit-button').on("click",function(){
  var postData = {};
  getFormData('form-edit-group', postData);
  ajaxPost('history',postData, function(){
    updatePortTable();
    updateSummaryTable();
    createSideNavList();
  });
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

// General function

function ajaxGet(url, callback){
  $.ajax({
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
function updatePortTable(){
  $('#table-port > tbody').children().each(function(){
    this.remove();
  });
  ajaxGet('port', function (data){
    for ( var i in data){
      var tr = '<tr>'
      var order = parseInt(i)+1;
      if (data[i].cost < data[i].marketValue){
        tr = '<tr class="success">'
      } else if (data[i].cost > data[i].marketValue) {
        tr = '<tr class="danger">'
      }
      $('#table-port > tbody:last-child').append('' +
        tr +
        '<td>' + order + '</td>' +
        '<td  class="stocklink"><a href="#">' + data[i].name + '</a></td>' +
        '<td>' + data[i].type + '</td>' +
        '<td>' + data[i].volume + '</td>' +
        '<td>' + data[i].averagedPrice.toFixed(2) + '</td>' +
        '<td>' + data[i].lastPrice + '</td>' +
        '<td>' + data[i].cost + '</td>' +
        '<td>' + data[i].marketValue + '</td>' +
        '</tr>');
    }
    initStockEditLink('stocklink');
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
        '<td>' + data[i] + '</td>' +
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
      '<td>' + data.history[i].amount + '</td>' +
      '<td>' + data.history[i].cost + '</td>' +
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
      '<td>' + data.profit.toFixed(2) + '</td>' +
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

// Page control
function pageControl(mode){
  switch (mode){
    case 'port':
      pagePortVisible(true);
      pageStockVisible(false);
        break;
    case 'stock':
      pagePortVisible(false);
      pageStockVisible(true);
          break;
    default:
          break;
  }
}
function initStockLink(classname){
  $('.'+classname).click(function(){
    //pageControl('stock')
    //

    var assetName = $(this).text();
    console.log(assetName)
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
    var assetName = $(this).text();
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
function createSideNavList(){
  $('#side-nav-list').children().each(function(){
    if (this.id != 'side-header')this.remove();
  });
  ajaxGet('port', function (data){
    for (var i in data){
      var percentage = data[i].volume > 0 ? (data[i].lastPrice - data[i].averagedPrice)/data[i].averagedPrice*100:0;
      percentage = percentage.toFixed(2);
      $('#side-nav-list').append('' +
        '<div class="list-group-item">' +
        '<span class="badge">' +
        percentage + '%' +
        '</span>' +
          '<div class="text-group-item-stock">'+
            data[i].name +
          '</div>' +
        '</div>'
      )
    }
    initStockLink("text-group-item-stock");
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


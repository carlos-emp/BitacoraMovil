var user2 = "CarlosVazquez";
var conn = "";
var conexiones = 0;
var selectedTarget = "";
var selectedConversacion={};
var selectedChatPerson = "";
var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
var monthNum = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
var d = new Date();
var app = angular.module('bitacora-movil', ['onsen']);
app.controller("body-controller", function($scope, $http) {
  $scope.actividades = {};
  $scope.usuarios = {};
  $scope.conversaciones = [];
  $scope.selectedChats = {};
  $scope.user2 = user2;
  $scope.fecha="Hoy";
  // ==================== favoritos ============================
  $scope.favoritos=[];
  $scope.getFavs= function(){
    $http.get('http://alexrojas.cloudapp.net/web/chat/myFavs.php?me='+user2).success(function(data) {
      $scope.favoritos = data;
    });
  };
  $scope.getFavs();
  // ==================== pop over menu ============================
  $scope.showSortMenu=function(){
    $('#sort-menu').fadeIn();
  };
  $scope.hideSortMenu=function(){
    $('#sort-menu').fadeOut();
  };
  // ==================== end pop over menu ============================

  $scope.getConver = function() {
    $http.get('http://alexrojas.cloudapp.net/web/chat/myChats.php?me=' + user2).success(function(data) {
      $scope.conversaciones = data;
    });
  };
  $scope.getConver();
  $scope.order = 'categoria';
  $scope.dia = d.getDate();
  if ($scope.dia < 10) {
    $scope.dia = '0' + $scope.dia;
  }
  $scope.dateTop = {
    value: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    strVal: d.getFullYear() + '-' + monthNum[d.getMonth()] + '-' + $scope.dia
  };
  $scope.changeDate = function() {
    var tmp = $('#datePicker').val().split("-");
    //alert(tmp[0]);
    $scope.dateTop = {
      value: new Date(tmp[0], tmp[1] - 1, tmp[2]),
      strVal: $('#datePicker').val()
    };
    if($scope.dateTop.strVal==d.getFullYear() + '-' + monthNum[d.getMonth()] + '-' + $scope.dia){
      $scope.fecha="Hoy";
    }
    else {
      $scope.fecha=$scope.dateTop.strVal;
    }
  };
  $scope.llamar = function() {
    $http.get('http://alexrojas.cloudapp.net/web/api/bitacora/getActivities.php?user='+user2).
    success(function(data) {
      $scope.actividades = data;
    });
  };
  $scope.getUsuarios = function() {
    $http.get('http://empowerlabs.com/proyectos/trackersAPI/getUsers.php').
    success(function(data) {
      $scope.usuarios = data;
    });
  };
  $scope.findUsuarioURLimage = function(wikiName) {
    var finalThum = "img/fondo-fantasma.png";
    for (var i = 0; i < $scope.usuarios.length; i++) {
      if ($scope.usuarios[i].nombre === wikiName) {
        finalThum = $scope.usuarios[i].image;
        break;
      }
    }
    return finalThum;
  };
  $scope.enviarForm = function() {
  $('#loading').css('display', 'block');

  var date = d.getDate() + ' de ' + monthNames[d.getMonth()] + ' de ' + d.getFullYear();

  var url = "http://alexrojas.cloudapp.net/web/api/bitacora/insert.php";
  // the script where you handle the form input.
  var data = $('#form-alta-actividad').serialize() + '&' + $.param({
    from: user2,
    to: "",
    date: d.getFullYear() + '-' + monthNum[d.getMonth()] + '-' + $scope.dia,
    topic: '',
    lab: '',
    estatus: '0'
  });
  $.ajax({
    type: "POST",
    url: url,
    data: data, // serializes the form's elements.
    success: function(data) {
      //$('#new').fadeOut();
      document.getElementById("form-alta-actividad").reset();
      $scope.closeModalAlta();
      $('#loading').css('display', 'none');
      $scope.llamar();
      // show response from the php script.
    }
  });
};
  //alert($scope.findUsuarioURLimage('JoseRojas'));
  ons.ready(function() {
    // Init code here
    $scope.llamar();
    $scope.getUsuarios();
    start = function(websocketServerLocation) {
      if ($scope.conexiones > 0) {
        $scope.conn.close();
      }
      conn = new WebSocket(websocketServerLocation);
      conexiones++;
      //try to reconnect in 5 minutes
      setTimeout(function() {
        start(websocketServerLocation);
      }, 300000);

      conn.onopen = function(e) {
        console.log("Connection established!" + e);
      };
      conn.onclose = function(e) {
        console.log("Connection closed!" + e);
      };
      conn.onmessage = function(e) {
        //console.log("mensaje: " + e.data);
        $scope.json = e.data;
        $scope.json = jQuery.parseJSON($scope.json);
        var quien = $scope.json.target.split('-');
        if ($scope.json.type === "getConver") {
          if (quien[0] === user2 || quien[1] === user2) {
            $scope.selectedChats = $scope.json.chats;
            //console.log("mensaje: " + e.data);
            $scope.llamarChats();
            $scope.$apply(function() {
              $(".chat").scrollTop($(".chat")[0].scrollHeight);
            });
            $(".chat").scrollTop($(".chat")[0].scrollHeight);
          }
        } else {
          if ($scope.json.type === "send") {
            if (quien[0] === user2 || quien[1] === user2) {
              var clase = 'you';
              var objetivo = $scope.json.sent.para;
              if ($scope.json.sent.de !== user2) {
                clase = "me";
                objetivo = $scope.json.sent.de;
                //console.log(objetivo);
                $(".chat").append('<div class="bubble '+clase+'">'+$scope.json.mensaje+'<img src="'+$scope.findUsuarioURLimage(objetivo)+'" class="circle" style="width:20px; height:20px; position: absolute; top:-10px; left: -5px">  <div class="timeline-date">'+d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()+'</div></div>');
              } else {
              $(".chat").append('<div class="bubble '+clase+'">'+$scope.json.mensaje+'<img src="'+$scope.findUsuarioURLimage(user2)+'" class="circle" style="width:20px; height:20px; position: absolute; bottom:-10px; right: -5px">  <div class="timeline-date">'+d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()+'</div></div>');
                //$('#' + json.target).text("0");
              }
              $(".chat").scrollTop($(".chat")[0].scrollHeight);
            }
          }
        }
      };
    };
    start('ws://alexrojas.cloudapp.net:9000');
  });
  $scope.showModalAlta=function(){
  $scope.hideSortMenu();
    $("#modal-alta").fadeIn();
  }
  $scope.closeModalAlta=function(){
    $("#modal-alta").fadeOut();
  }
  $scope.lanzarCalendario = function() {
    $('.fixed-action-btn').closeFAB();
    $scope.ons.navigator.pushPage('calendario.html', {
      animation: "fade"
    });
  };
  $scope.lanzarMessageboard = function() {
    $('.fixed-action-btn').closeFAB();
    $scope.ons.navigator.pushPage('MessageBoard.html', {
      animation: "fade"
    });
  };
  $scope.lanzarChat = function() {
    $('.fixed-action-btn').closeFAB();
    $scope.ons.navigator.pushPage('chat.html', {
      animation: "fade"
    });
  };
  $scope.lanzarConversacion = function(conversacion) {
    selectedConversacion=conversacion;
    var arrTarget = [user2, conversacion.nombre];
    arrTarget.sort();
    arrTarget.reverse();
    selectedChatPerson=arrTarget[0];
    if(selectedTarget==user2){
      selectedChatPerson=arrTarget[1];
    }
    //console.log(arrTarget[0]+arrTarget[1]);
    //ws.$emit('onMessage', JSON.stringify({"type":"getConver","chatTarget":"VictorCastillo-JoseRojas","from":"alexrojas","to":"JoseRojas","message":"hola"})); // it sends the event 'hello' with data 'world'
    selectedTarget = arrTarget[0] + '-' + arrTarget[1];
    $scope.ons.navigator.pushPage('conversacion.html', {
      animation: "slide"
    });
  };
  $scope.llamarChats = function() {
    $scope.selectedChat = $scope.selectedChats;
  };
  $scope.llamarChats();
  $scope.regresar = function() {
    $scope.ons.navigator.popPage();
  };
  $scope.cerrarOpcion = function() {
    $('.fixed-action-btn').closeFAB();
  };
  $scope.abrirOpcion = function() {
    $('.fixed-action-btn').openFAB();
  };
});
app.controller("ActividadesController", function($scope, $http) {

  $scope.order="categoria";
  // ==================== Orden ============================

  $scope.setOrder = function(orderCode) {
    switch (orderCode) {
      case 0:
        if ($scope.order == 'id') {
          $scope.order = '-id';
        } else {
          $scope.order = 'id';
        }
        break;
      case 1:
        if ($scope.order == 'color') {
          $scope.order = '-color';
        } else {
          $scope.order = 'color';
        }
        break;
      case 2:
        if ($scope.order == 'para') {
          $scope.order = '-para';
        } else {
          $scope.order = 'para';
        }
        break;
      case 3:
        if ($scope.order == 'tiempo') {
          $scope.order = '-tiempo';
        } else {
          $scope.order = 'tiempo';
        }
        break;
      case 4:
        if ($scope.order == 'categoria') {
          $scope.order = '-categoria';
        } else {
          $scope.order = 'categoria';
        }
        break;
      case 5:
        if ($scope.order == 'prioridad') {
          $scope.order = '-prioridad';
        } else {
          $scope.order = 'prioridad';
        }
        break;
      default:

    }
  };
});
app.controller("ChatController", function($scope, $http) {

});
app.controller("ContactosController", function($scope, $http) {
  $scope.lanzarConversacionContactos=function(para){

    var arrTarget = [user2, para];
    arrTarget.sort();
    arrTarget.reverse();
    selectedChatPerson=arrTarget[0];
    if(selectedTarget==user2){
      selectedChatPerson=arrTarget[1];
    }
    selectedTarget = arrTarget[0] + '-' + arrTarget[1];
    $scope.ons.navigator.pushPage('conversacion.html', {
      animation: "slide"
    });
  };
});
app.controller("FavoritosController", function($scope, $http) {
  $scope.lanzarConversacionFavoritos=function(para){

    var arrTarget = [user2, para];
    arrTarget.sort();
    arrTarget.reverse();
    selectedChatPerson=arrTarget[0];
    if(selectedTarget==user2){
      selectedChatPerson=arrTarget[1];
    }
    selectedTarget = arrTarget[0] + '-' + arrTarget[1];
    $scope.ons.navigator.pushPage('conversacion.html', {
      animation: "slide"
    });
  };
});
app.controller("ConversacionController", function($scope, $http) {
  $scope.selectedTarget=selectedChatPerson;
  conn.send(JSON.stringify({
    "type": "getConver",
    "chatTarget": selectedTarget
  }));
  $scope.sendMessage=function(){

    conn.send(JSON.stringify({
      "message": '' + $('#textNuevo').val(),
      "chatTarget": selectedTarget,
      "from": user2,
      "to": selectedConversacion.nombre,
      "time": d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds(),
      "date": d.getFullYear() + '-' + monthNum[d.getMonth()] + '-' + d.getDate(),
      "type": "send"
    }));
    $('#textNuevo').val("");
  };
});

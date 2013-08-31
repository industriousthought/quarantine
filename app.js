var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

server.listen(80);

app.get('/joystick.png', function (req, res) {
  res.sendfile(__dirname + '/joystick.png');
});

app.get('/hero.png', function (req, res) {
  res.sendfile(__dirname + '/img/player.png');
});

app.get('/bullet.png', function (req, res) {
  res.sendfile(__dirname + '/bullet.png');
});

app.get('/zombie1.png', function (req, res) {
  res.sendfile(__dirname + '/img/zombie1.png');
});

app.get('/zombie2.png', function (req, res) {
  res.sendfile(__dirname + '/img/zombie2.png');
});

app.get('/zombie3.png', function (req, res) {
  res.sendfile(__dirname + '/img/zombie3.png');
});

app.get('/car1.png', function (req, res) {
  res.sendfile(__dirname + '/img/car1.png');
});

app.get('/car2.png', function (req, res) {
  res.sendfile(__dirname + '/img/car2.png');
});

app.get('/car3.png', function (req, res) {
  res.sendfile(__dirname + '/img/car3.png');
});

app.get('/car4.png', function (req, res) {
  res.sendfile(__dirname + '/img/car4.png');
});

app.get('/car5.png', function (req, res) {
  res.sendfile(__dirname + '/img/car5.png');
});

app.get('/car6.png', function (req, res) {
  res.sendfile(__dirname + '/img/car6.png');
});

app.get('/background.png', function (req, res) {
  res.sendfile(__dirname + '/img/background.png');
});

app.get('/css/reset.css', function (req, res) {
  res.sendfile(__dirname + '/css/reset.css');
});

app.get('/css/controllerStyle.css', function (req, res) {
  res.sendfile(__dirname + '/css/controllerStyle.css');
});

app.get('/controller', function (req, res) {
  res.sendfile(__dirname + '/controller.html');
});

app.get('/display', function (req, res) {
  res.sendfile(__dirname + '/display.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('event', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

var lastPlayer = 0;
var players = [];
var display = null;

var con = io.of('/con').on('connection', function (socket) {
    socket.on('event', function (data) {
        
        dis.emit('event', {
            'x': data.x,
            'y': data.y,
            'controller': data.controller,
            'id': data.id

      });
    });

    socket.on('pingBack', function(data) {
        if (players[data.id]) {
            players[data.id].outstandingPing = null;
        }

    });
    
    socket.on('newPlayer', function (data) {
        var newPlayer = {};
        
        if (data.id && players[data.id]) {
            newPlayer = players[data.id];
            players[data.id].alive = true;
        } else {
            newPlayer.id = data.id;
            newPlayer.nick = data.nick;
            newPlayer.alive = true;
            players[newPlayer.id] = newPlayer;
        }
        
        console.log(data.id + ', ' + newPlayer.id);

        dis.emit('event', {
            'newPlayer': newPlayer.id,
            'nick': newPlayer.nick
        });

        lastPlayer++;

    });


    console.log('new controller');
  });

var dis= io.of('/dis').on('connection', function (socket) {

    display = {};

    socket.on('deadPlayer', function (data) {
        players[data.id].living = null;
        con.emit('deadPlayer', {
            'id': data.id
        });

    });

    socket.on('pingBack', function(data) {
        display.outstandingPing = null;

    });
    
});
 
var pingSendInterval = setInterval(function() {
    var pingId = new Date().getTime();
    var i = 0;
    for (i in players) {
        players[i].outstandingPing = pingId;
    }
    if (display) {
        display.outstandingPing = pingId;
    }

    dis.emit('ping', {
        time: pingId
    });

    con.emit('ping', {
        time: pingId
    });

}, 1000);

var pingCheckInterval = setInterval(function() {
    var now = new Date().getTime();
    var elapsedTime = 0;
    for (i in players) {
        if (players[i].outstandingPing) {
            elapsedTime = now - players[i].outstandingPing;
            if (elapsedTime > 500) {
                console.log('player ID: ' + i + ' is experienceing latency of ' + elapsedTime + '.');
            }
            players[i].outstandingPing = null;
        }
    }

    if (display && display.outstandingPing) {
        elapsedTime = now - display.outstandingPing;
        if (elapsedTime > 500) {
            console.log('Display is experienceing latency of ' + elapsedTime + '.');
            display.outstandingPing = null;
        }
    }

            
}, 50);

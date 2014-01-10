var pg = require('pg');
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(80);

var conString = "dbname=d6k6js98rpille host=ec2-174-129-197-200.compute-1.amazonaws.com port=5432 user=flfxetvvtvfgtx password=RjWlyNAl5ZWSkJx0hlJ4w4RfIx sslmode=require";
//var pgString = "postgres://flfxetvvtvfgtx:RjWlyNAl5ZWSkJx0hlJ4w4RfIx@ec2-174-129-197-200.compute-1.amazonaws.com:5432/d6k6js98rpille";

var client = new pg.Client(conString);
client.connect();

//client.query('CREATE TABLE users(id VARCHAR(32), nick VARCHAR(32), fbID VARCHAR(32));');
//client.query('INSERT INTO users(id, nick, fbID) VALUES(\'1\', \'brian\', \'Doe\');');
//client.query('INSERT INTO users(id, nick) VALUES("id", "a");');


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/splash.html');
});

var games = [];
var lobbies = [];
var players = [];
var pause = false;
var pauseUser = false;

var makeGame = function(p) {

    var game = {};
    game.id = p.id;
    game.players = [];
    game.lastPlayer = 0;
    
    lobbies[game.id] = io.of('/lobby' + game.id).on('connection', function (socket) {

        for (var p in game.players) {
            lobbies[game.id].emit('newPlayer', {
                'id': p
            });

        }
        socket.on('cancleLobby', function (data) {
            delete lobbies[game.id];
            delete games[game.id];

        });
    });

    game.controller = io.of('/con' + game.id).on('connection', function (socket) {

        socket.on('event', function (data) {
            
            game.display.emit('event', {
                'x': data.x,
                'y': data.y,
                'controller': data.controller,
                'id': data.id

          });
        });

        socket.on('newPlayer', function (data) {
            if (!players[data.id]) {
                client.query('INSERT INTO users(id, nick, fbID) VALUES(\'' + data.id + '\', \'' + data.nick + '\', \'Doe\');');
                players[data.id] = {};
                players[data.id].nick = data.nick;
            }

            lobbies[game.id].emit('newPlayer', {
                'id': data.id,
                'nick': players[data.id].nick 
            });
            game.players[data.id] = {'nick': players[data.id].nick};

        });

        socket.on('checkPlayer', function(data) {
            if (players[data.id]) {
                game.controller.emit('idExists', {
                    id: data.id,
                    nick: players[data.id].nick
                });
            } else {
                game.controller.emit('idNotExist', {
                    true: 'true'
                });
          
            }
        });

        socket.on('pause', function(data) {
            if (!pauseUser) { 
                pauseUser = data.id;
            } else {
                game.display.emit('pause', {
                    true: true
                });
            console.log('pause sent');
            }
            console.log('pause pressed');

        });

    });
            
    game.display = io.of('/dis' + game.id).on('connection', function (socket) {

        console.log('display connected!');

        for (var p in game.players) {
            game.display.emit('event', {
                'newPlayer': p
            });
        }

        socket.on('deadPlayer', function (data) {
            game.players[data.id].living = null;
            game.controller.emit('deadPlayer', {
                'id': data.id

        });


    });
});
 

}

app.get('/newGame', function(req, res) {
    var gameID = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        gameID += possible.charAt(Math.floor(Math.random() * possible.length));

    res.send(gameID);


    games[gameID] = makeGame({id: gameID});
});

app.get('/img/cancle.gif', function(req, res) {
  res.sendfile(__dirname + '/img/cancle.gif');
});

app.get('/img/gas_mask.gif', function(req, res) {
  res.sendfile(__dirname + '/img/gas_mask.gif');
});

app.get('/css/splashStyle.css', function(req, res) {
  res.sendfile(__dirname + '/css/splashStyle.css');
});

app.get('/js/animationEffects.js', function(req, res) {
  res.sendfile(__dirname + '/js/animationEffects.js');
});

app.get('/js/mathTools.js', function(req, res) {
  res.sendfile(__dirname + '/js/mathTools.js');
});

app.get('/img/help.gif', function(req, res) {
  res.sendfile(__dirname + '/img/help.gif');
});

app.get('/img/newGame.gif', function(req, res) {
  res.sendfile(__dirname + '/img/newGame.gif');
});

app.get('/img/settings.gif', function(req, res) {
  res.sendfile(__dirname + '/img/settings.gif');
});

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

app.get('/fb.html', function (req, res) {
  res.sendfile(__dirname + '/fb.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('event', { hello: 'world' });
  socket.on('my other event', function (data) {
  });
});





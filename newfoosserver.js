
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser());

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}


var mongoose = require('mongoose');
mongoose.connect('mongodb://foosboy69:foosboy79@ds043350.mongolab.com:43350/quantifiedfoos');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Database Connected")
});

//======================================================
//===============SET UP DATABASE SCHEMES================
//======================================================
var Schema = mongoose.Schema;

var gameSchema = Schema({
   teams: [teamSchema],                       
   timeDate: { type: Date, default: Date.now }
});

var teamSchema = Schema({
  players : [{ type: String, ref: 'Player' }],      //holds reference to players' playerID
  score : { type: Number, default: 0 },
  win: Boolean                                
});                      

var playerSchema = Schema({
  playerID: String,
  name: String,
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  goals: { type: Number, default: 0 }                          
});

//======================================================
//====================SET UP ROUTES=====================
//======================================================


var Player = mongoose.model('Player', playerSchema);
var Game = mongoose.model('Game', gameSchema);
var Team = mongoose.model('Team', teamSchema);
var newGame = new Game();
var newRedTeam = new Team();
var newBlueTeam = new Team();

app.get('/', function(req, res) {
    res.send('Hello World');
});

//ADD NEW PLAYERT
app.get('/newPlayer', function(req, res) { 
  console.log(req.query['playerID']);
  createNewPlayer(req.query['playerID']);
  res.end("New Player :" + req.query['playerID'] + " Logged");
});


//SETUP NEW GAME		
app.get('/newGame', function(req, res) { 
  newGame = new Game();
  console.log(newGame._id)
  newRedTeam = new Team();
  newBlueTeam = new Team();
  console.log("New Game Initiated!");
  res.send(newGame._id + '\n' + newRedTeam._id + '\n' + newBlueTeam._id);
  res.end("New Game Initiated!");  
  });

//ADD RED TEAM PLAYERS
app.get('/redTeam', function(req, res) { 
  Player.findOne({ 'playerID': req.query['playerOneID'] }, function (err, person) {      //fix with findone and update
    if (err) return handleError(err);
    console.log(person.name + " is ready to play for Red Team"); 
    res.end(person.name + " is ready to play for Red Team");
    newRedTeam.players.push(person.playerID);
    redTeamUpdate();
   })
  Player.findOne({ 'playerID': req.query['playerTwoID'] }, function (err, person) {
    if (err) return handleError(err);
    console.log(person.name + " is ready to play for Red Team"); 
    res.end(person.name + " is ready to play for Red Team"); 
    newRedTeam.players.push(person.playerID);
    redTeamUpdate();
  })
});

//ADD BLUE TEAM PLAYERS
app.get('/blueTeam', function(req, res) { 
  Player.findOne({ 'playerID': req.query['playerOneID'] }, function (err, person) {
    if (err) return handleError(err);
    console.log(person.name + " is ready to play for Blue Team"); 
    res.end(person.name + " is ready to play for Blue Team"); 
    newBlueTeam.players.push(person.playerID);
    blueTeamUpdate();
  })

  Player.findOne({ 'playerID': req.query['playerTwoID'] }, function (err, person) {
    if (err) return handleError(err);                                        //can probably add new Player here
    console.log(person.name + " is ready to play for Blue Team"); 
    res.end(person.name + " is ready to play for Blue Team"); 
    newBlueTeam.players.push(person.playerID);
    blueTeamUpdate();
  })
});

//START NEW GAME
app.get('/gameStart', function(req, res) { 
  newGame.teams.push(newRedTeam);
  newGame.teams.push(newBlueTeam);
  newGameUpdate();
  console.log("Game Started!")
  res.end("Game Started!")
});

//INPUT SCORES

app.get('/redGoal', function(req, res) { 
  redTeamScore(req.query['playerID']);
  res.end("Red Team Scores!");
});

app.get('/blueGoal', function(req, res) { 
  blueTeamScore(req.query['playerID']);
  res.end("Red Team Scores!");
});

app.get('/gameOver', function(req, res) {
    redTeamRecord(req.query['redTeam']);         //true or false
    blueTeamRecord(req.query['blueTeam']);
    res.end("Game Over");
});

//======================================================
//====================SET UP FUNCTIONS=====================
//======================================================


var createNewPlayer = function(cardNum){
  var newPlayer = new Player();
  newPlayer.wins = 0;
  newPlayer.losses = 0;
  newPlayer.name = '';
  newPlayer.playerID = cardNum;
  newPlayer.save(function (err) {
    if (err){
      console.log('Error on save!');
    }else{
      console.log("Player saved!");
    }
    });
  //return newPlayer;
}


var blueTeamUpdate = function(){
  newBlueTeam.update(function (err) {
    if (err){
      //console.log ('Error on save!');
      newBlueTeam.save();
     }else{
      console.log("Blue Team Logged!");}
  })
};

var redTeamUpdate = function(){
  newRedTeam.update(function (err) {
    if (err){
      //console.log ('Error on save!');
      newRedTeam.save();
     }else{
      console.log("Red Team Logged!");}
  })
}

var newGameUpdate = function(){
  newGame.update(function (err) {
    if (err){
      //console.log ('Error on save!');
      newGame.save();
     }else{
      console.log("New Game Logged!");}
  })
}



var redTeamScore = function(playerID){
  newRedTeam.score += 1;
  Player.findOne({ 'playerID': playerID }, function (err, person) {
  if (err) return handleError(err);                                        //can probably add new Player here
    console.log(person.name + " Scored!"); 
    person.goals += 1; 
    person.save(function (err) {
      if (err){
        console.log('Error on save!');
      }else{
        console.log("Player Score saved!");
      }
    });
  });
  redTeamUpdate();
}

var blueTeamScore = function(playerID){
  newBlueTeam.score += 1
  console
  Player.findOne({ 'playerID': playerID }, function (err, person) {
  if (err) return handleError(err);                                        //can probably add new Player here
    console.log(person.name + " Scored!"); 
    person.goals += 1; 
    person.save(function (err) {
      if (err){
        console.log('Error on save!');
      }else{
        console.log("Player Score saved!");
      }
    });
  });
  blueTeamUpdate();
}

var redTeamRecord = function(win){
  newRedTeam.win = win;
  for (var x = 0; x < newRedTeam.players.length;x++){
    Player.findOne({ 'playerID': newRedTeam.players[x] }, function (err, person) {
    if (err) return handleError(err);                                        //can probably add new Player here
      if (win == true) person.wins += 1; 
      if (win == false) person.losses += 1; 
      person.save(function (err) {
        if (err){
          console.log('Error on save!');
        }else{
          console.log("Player Score saved!");
        }
      });
    });
  }
  redTeamUpdate();
}


var blueTeamRecord = function(win){
  newBlueTeam.win = win;
  for (var x = 0; x < newBlueTeam.players.length;x++){
    Player.findOne({ 'playerID': newBlueTeam.players[x] }, function (err, person) {
    if (err) return handleError(err);                                        //can probably add new Player here
      if (win == true) person.wins += 1; 
      if (win == false) person.losses += 1; 
      person.save(function (err) {
        if (err){
          console.log('Error on save!');
        }else{
          console.log("Player Score saved!");
        }
      });
    });
  }
  blueTeamUpdate();
}







// var port = Number(process.env.PORT || 5000);
// app.listen(port);
// console.log('Listening on port',port);

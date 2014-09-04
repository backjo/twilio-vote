// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("ballot");
Voters = new Meteor.Collection("voter");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {idx: 1, name: 1}});
  };

  Template.player.winning = function() {
    var leadPlayer = Players.findOne({}, {sort: {score: -1}});
    return this._id == leadPlayer._id ? "winning" : "";
  }


  Template.leaderboard.events({
    'click button.submit_new': function() {
      var count = Players.find().count();
      Players.insert({name: document.getElementById('new_person').value, idx: count+1, score: 0});
    },
    'click button.reset': function() {
      Meteor.call('reset');
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    return Meteor.methods({

      reset: function () {

        Players.remove({});
        Voters.remove({});
        return;

      }
    });
  });
}

Router.map(function() {
  this.route('twilio', {
    path: '/twilio',
    where: 'server',

    action: function() {
      this.response.writeHead(200, {'Content-type': 'application/json; charset=utf-8'});
      this.response.end(JSON.stringify(this.request.body));
      var voter = Voters.findOne({"number": this.request.body.From});
      console.log(this.params);
      console.log(this.request.body);
      if(voter) {
	console.log('voter found');
        Players.update({idx: voter.vote}, {$inc: {score: -1}});
	console.log(voter._id);
        Voters.update({_id: voter._id}, {$set: {vote: Number(this.request.body.Body)}});
      } else {
	      console.log('new voter')
        Voters.insert({vote: Number(this.request.body.Body), number: this.request.body.From});
      }
      Players.update({idx: Number(this.request.body.Body)}, {$inc: {score: 1}});
    }

  })
});

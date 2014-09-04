// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("votingtest24");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {idx: 1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player.winning = function() {
    var leadPlayer = Players.findOne({}, {sort: {score: -1}});
    return this._id == leadPlayer._id ? "winning" : "";
  }


  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click button.submit_new': function() {
      var count = Players.find().count();
      Players.insert({name: document.getElementById('new_person').value, idx: count+1});
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
  });
}

Router.map(function() {
  this.route('twilio', {
    path: '/twilio',
    where: 'server',

    action: function() {
      console.log(this.request.body);

      this.response.writeHead(200, {'Content-type': 'application/json; charset=utf-8'});
      this.response.end(JSON.stringify(this.request.body));
    }
  })
});

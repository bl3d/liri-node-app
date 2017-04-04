//get required packages
var fs = require("fs"),
    keys = require("./keys.js"),
    inquirer = require("inquirer"), //https://www.npmjs.com/package/inquirer
    request = require("request"), //https://www.npmjs.com/package/request
    twitter = require("twitter"), //https://www.npmjs.com/package/twitter
    spotify = require("spotify"); //https://www.npmjs.com/package/spotify



//create logic for LIRI
var liri = {

  name: null,

  choiceArray: [
    "my-tweets",
    "spotify-this-song",
    "movie-this",
    "do-what-it-says"
  ],  

  init: function() { 
    //send arguments to liri, if none exist, this should prompt inquirer (liri.welcome)
    if (process.argv.length < 2 || process.argv[2] === undefined) {
      // console.log('no arguments were given, greet with LIRI');
      liri.welcome();
    } else {
      // console.log('arguments were given up front, just run command'); 
      liri.performAction(process.argv[2], process.argv.slice(3, process.argv.length).join(" "));
    }
  },

  welcome: function() {
    //if file is invoked with node but no additional params, ask the user's name and what they would like to do
    inquirer.prompt([{
        type: "input",
        message: "What is your name?",
        name: "name"
      }, {
        type: "list",
        message: "What would you like to know?",
        choices: [
          "1) Recent Tweets?",
          "2) Info about a specific song?",
          "3) Info about a specific movie?",
          "4) Info about the only thing LIRI cares about?"
        ],
        name: "action"
      } 
    ]).then(function(user) {

      //set user name in liri object for personalized response later
      liri.name = user.name;

      //get index in selected answer for conversion
      var choiceIndex = parseInt(user.action.split(')')) - 1;

      //if index 0 or 3, no additional info is required
      if (choiceIndex === 0 || choiceIndex === 3) {
        liri.performAction(liri.choiceArray[choiceIndex]);
      } else{
        //else collect requested song or movie
        var type = (choiceIndex === 1) ? 'song' : 'movie';

        inquirer.prompt([{
            type: "input",
            message: "What "+type+" would you like info on?",
            name: "specificInfo"
          } 
        ]).then(function(request) {
          liri.performAction(liri.choiceArray[choiceIndex], request.specificInfo);
        });        
      }
    });

  },

  performAction: function(action, request) {   

    switch (action){

      case "my-tweets":
        console.log("tweet me!");
        /*var client = new Twitter({
          consumer_key: '',
          consumer_secret: '',
          bearer_token: ''
        });

        client.get('statuses/user_timeline', { screen_name: 'nodejs', count: 20 }, function(error, tweets, response) {
          if (!error) {
            res.status(200).render('index', { title: 'Express', tweets: tweets });
          }
          else {
            res.status(500).json({ error: error });
          }
        });*/
        break;

      case "spotify-this-song":
        console.log("song me!");

        //artist OR album OR track
        /*spotify.search({ type: 'track', query: 'dancing in the moonlight' }, function(err, data) {
            if ( err ) {
                console.log('Error occurred: ' + err);
                return;
            }
         
            // Do something with 'data' 
        });*/
        break;

      case "movie-this":
        console.log("movie me!");
        /*request("http://www.omdbapi.com/?t=remember+the+titans&y=&plot=short&r=json", function(error, response, body) { 
          if (!error && response.statusCode === 200) {  
            console.log("The movie's rating is: " + JSON.parse(body).imdbRating);
          }
        });*/
        break;

      case "do-what-it-says":
        console.log("do... me?!");
        /*fs.readFile("random.txt", "utf8", function(error, data) {

          if (!error) {
            // We will then print the contents of data
            console.log(data);

            // Then split it by commas (to make it more readable)
            var dataArr = data.split(",");

            // We will then re-display the content as an array for later use.
            console.log(dataArr);

          }else{
            console.log('Sorry, I had an issue processing this request, please try again or run another function.');
          }

        });*/
        break;

      default:
        console.log("Sorry, I didn't understand that.\n Please try again or just type 'node liri.js' to be guided through the options!"); 

    }   

  },

  log: function(data){
    //this needs to keep track of all actions in log.txt
  }

};



//kick off LIRI app
liri.init();
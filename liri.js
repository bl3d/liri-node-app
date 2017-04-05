//get required packages
var fs = require("fs"),
    keys = require("./keys.js"),
    inquirer = require("inquirer"), //https://www.npmjs.com/package/inquirer
    request = require("request"), //https://www.npmjs.com/package/request
    Twitter = require("twitter"), //https://www.npmjs.com/package/twitter
    spotify = require("spotify"); //https://www.npmjs.com/package/spotify



//create logic for LIRI
var liri = {

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
        type: "list",
        message: "Hi, What would you like to know?!",
        choices: [
          "1) Recent Tweets?",
          "2) Info about a specific song?",
          "3) Info about a specific movie?",
          "4) Info about the only thing LIRI cares about?"
        ],
        name: "action"
      } 
    ]).then(function(user) { 

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
        ]).then(function(query) {
          liri.performAction(liri.choiceArray[choiceIndex], query.specificInfo);
        });        
      }
    });

  },

  performAction: function(action, query) {   

    switch (action){

      case "my-tweets": 
        var client = new Twitter(keys.twitterKeys);

        client.get('statuses/user_timeline', { count: 20 }, function(error, tweets, response) {
          if (!error) {
            // console.log(tweets);
            for (var i = 0; i < tweets.length; i++) {
              console.log((i+1)+') '+tweets[i].created_at+':\n'+'"'+tweets[i].text+'"');
            };
          }
          else {
            console.log("Sorry, there was an error connecting to Twitter, please try again soon.");
          }
        });
        break;

      case "spotify-this-song": 
        var song = (query) ? query : 'The Sign Ace of Base';

        //artist OR album OR track
        spotify.search({ type: 'track', query: song }, function(err, data) {
            if ( err ) {
              console.log("Sorry, there was an error connecting to Spotify, please try again soon."); 
            }
            else{
              // console.log(data);
              var thisSong = data.tracks.items[0];
              console.log('Artist: '+thisSong.artists[0].name);
              console.log('Song Name: '+thisSong.name);
              console.log('Preview URL: '+thisSong.preview_url);
              console.log('Album: '+thisSong.album.name);                          
            }
        });
        break;

      case "movie-this": 
        var movie = (query) ? query.replace(" ", "+") : 'Mr.Nobody';

        request("http://www.omdbapi.com/?t="+movie+"&y=&plot=short&r=json", function(error, response, body) { 
          if (!error && response.statusCode === 200) {  
            // console.log(JSON.parse(body));
            if (JSON.parse(body).Response != 'False') {
              var thisData = JSON.parse(body);
               
               if (thisData.Title) {
                console.log('* Title: '+thisData.Title);
               };                
               
               if (thisData.Year) {
                console.log('* Year: '+thisData.Year);
               };                
               
               if (thisData.imdbRating) {
                console.log('* IMDB Rating: '+thisData.imdbRating);
               };                
               
               if (thisData.Country) {
                console.log('* Country: '+thisData.Country);
               };                
               
               if (thisData.Language) {
                console.log('* Language: '+thisData.Language);
               };                
               
               if (thisData.Plot) {
                console.log('* Plot: '+thisData.Plot);
               };                
               
               if (thisData.Actors) {
                console.log('* Actors: '+thisData.Actors);
               };                

               if (thisData.Ratings[1]) {
                console.log('* Rotten Tomatoes: '+thisData.Ratings[1].Value);
               };         

            } else{
              console.log("Sorry, I couldn\'t find that movie, please try again");
            }
       
          }
        });
        break;

      case "do-what-it-says": 
        fs.readFile("random.txt", "utf8", function(error, data) {
          if (!error) { 
            // Then split data into array by commas
            var dataArr = data.split(","); 

            //send results back to this function to perform... if not "do-what-it-says"
            if (dataArr[0] !== "do-what-it-says") {
              liri.performAction(dataArr[0], dataArr[1]);
            }else{
              console.log('Hey! What are you doing, trying to send me into recursion hell?!');
            }

          }else{
            console.log('Sorry, I had an issue processing this request, please try again or run another function.');
          }

        });
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
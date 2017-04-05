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
      liri.logThis('• LIRI called with no parameters, user will be promted...', true);
      liri.welcome();      
    } else {
      liri.logThis('• LIRI called with parameters, processing request...', true);
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
    }]).then(function(user) {

      //get index in selected answer for conversion
      var choiceIndex = parseInt(user.action.split(')')) - 1;

      //if index 0 or 3, no additional info is required
      if (choiceIndex === 0 || choiceIndex === 3) {
        liri.performAction(liri.choiceArray[choiceIndex]);
      } else {
        //else collect requested song or movie
        var type = (choiceIndex === 1) ? 'song' : 'movie';

        inquirer.prompt([{
          type: "input",
          message: "What " + type + " would you like info on?",
          name: "specificInfo"
        }]).then(function(query) {
          liri.performAction(liri.choiceArray[choiceIndex], query.specificInfo);
        });
      }
    });

  },

  performAction: function(action, query) {

    switch (action) {

      case "my-tweets":
        liri.logThis('--User opted to view recent tweets:', true);
        var client = new Twitter(keys.twitterKeys);

        client.get('statuses/user_timeline', {
          count: 20
        }, function(error, tweets, response) {
          if (!error) {
            // console.log(tweets);
            var allTweets = '';

            for (var i = 0; i < tweets.length; i++) {
              allTweets += ('  ' + (i + 1) + ') ' + tweets[i].created_at + ':\n' + '    "' + tweets[i].text + '"\n');
            };

            liri.logThis(allTweets);
            liri.logThis('  ____________________~ fin ~____________________\n\n');
            console.log('Go on, ask me another!\n\n');
          } else {
            liri.logThis("Sorry, there was an error connecting to Twitter, please try again soon.");
          }
        });
        break;

      case "spotify-this-song":
        liri.logThis('--User opted to get info on a song via Spotify:', true);
        var song = (query) ? query : 'The Sign Ace of Base';

        //artist OR album OR track
        spotify.search({
          type: 'track',
          query: song
        }, function(err, data) {
          if (err) {
            liri.logThis("Sorry, there was an error connecting to Spotify, please try again soon.");
          } else {
            // console.log(data);
            var thisSong = data.tracks.items[0];
            var songDeets = '';
            songDeets += ('  * Artist: ' + thisSong.artists[0].name+'\n');
            songDeets += ('  * Song Name: ' + thisSong.name+'\n');
            songDeets += ('  * Preview URL: ' + thisSong.preview_url+'\n');
            songDeets += ('  * Album: ' + thisSong.album.name+'\n');

            liri.logThis(songDeets);
            liri.logThis('  ____________________~ fin ~____________________\n\n');
            console.log('Go on, ask me another!\n\n');
          }
        });
        break;

      case "movie-this":
        liri.logThis('--User opted to get info on a movie via OMDB:', true);
        var movie = (query) ? query.replace(" ", "+") : 'Mr.Nobody';

        request("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&r=json", function(error, response, body) {
          if (!error && response.statusCode === 200) {
            // console.log(JSON.parse(body));
            if (JSON.parse(body).Response != 'False') {
              var thisData = JSON.parse(body);
              var songDeets = '';

              if (thisData.Title) {
                songDeets += ('  * Title: ' + thisData.Title+'\n');
              };

              if (thisData.Year) {
                songDeets += ('  * Year: ' + thisData.Year+'\n');
              };

              if (thisData.imdbRating) {
                songDeets += ('  * IMDB Rating: ' + thisData.imdbRating+'\n');
              };

              if (thisData.Country) {
                songDeets += ('  * Country: ' + thisData.Country+'\n');
              };

              if (thisData.Language) {
                songDeets += ('  * Language: ' + thisData.Language+'\n');
              };

              if (thisData.Plot) {
                songDeets += ('  * Plot: ' + thisData.Plot+'\n');
              };

              if (thisData.Actors) {
                songDeets += ('  * Actors: ' + thisData.Actors+'\n');
              };

              if (thisData.Ratings[1]) {
                songDeets += ('  * Rotten Tomatoes: ' + thisData.Ratings[1].Value+'\n');
              };

              liri.logThis(songDeets);
              liri.logThis('  ____________________~ fin ~____________________\n\n');
              console.log('Go on, ask me another!\n\n');

            } else {
              liri.logThis("Sorry, I couldn\'t find that movie, please try again");
            }

          }
        });
        break;

      case "do-what-it-says":
        liri.logThis('--User opted to do whatever command is in "random.txt":', true);
        fs.readFile("random.txt", "utf8", function(error, data) {
          if (!error) {
            // Then split data into array by commas
            var dataArr = data.split(",");

            //send results back to this function to perform... if not "do-what-it-says"
            if (dataArr[0] !== "do-what-it-says") {
              liri.performAction(dataArr[0], dataArr[1]);
              liri.logThis('text file sends it\'s command back through LIRI', true);
            } else {
              liri.logThis('Hey! What are you doing, trying to send me into recursion hell?!');
            }

          } else {
            liri.logThis('Sorry, I had an issue processing this request, please try again or run another function.');
          }

        });
        break;

      default:
        liri.logThis("Sorry, I didn't understand that.\n Please try again or just type 'node liri.js' to be guided through the options!");

    }

  },

  logThis: function(data, logOnly) {
    //console.log certain messages for user to see in terminal
    if (!logOnly) {
      console.log(data);
    };

    //this needs to keep track of all actions in log.txt
    fs.appendFile('log.txt', data + '\n', function(err) {
      /*if (!err) {
        console.log(data);
      };*/
    });
  }

};



//kick off LIRI app
liri.init();
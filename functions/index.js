const functions = require('firebase-functions');
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.holamundo = functions.https.onRequest((req, res) => {

    url = 'http://www.snopes.com/category/facts/';
    respuesta="Fin de Ejecucion";
 
    request(url, function(error, response, html) {
        if(!error) {
            var $ = cheerio.load(html);
            var title;
            var counter = 0;
            var story = {
                title : "",
            };
            var json = { articles: []};
            console.log("Ingreso a scrapear");
            $('h2.title').each(function() {
                story = {title: ""};
                var data = $(this);
                title = data.text();
                story.title = title
                json.articles.push(story);
                console.log("Capturando Datos... " + data.text());
            })

            console.log(JSON.stringify(json));

       }

       

        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  output.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function
        /*
        fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err) {
            console.log('File successfully written! - Check your project directory for the output.json file');
        })
        */
    })   

    res.send(respuesta);
 });

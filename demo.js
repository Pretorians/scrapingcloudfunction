const functions = require('firebase-functions');
const firebase = require('firebase');
var axios = require('axios');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

const appFirebase = firebase.initializeApp({
    apiKey: "AIzaSyAH1o7sEzotd6rjzOABjcNEYtdDZW3UfT8",
    authDomain: "scraping-6960e.firebaseapp.com",
    databaseURL: "https://scraping-6960e.firebaseio.com",
    projectId: "scraping-6960e",
    storageBucket: "scraping-6960e.appspot.com",
    messagingSenderId: "381148053741"    
});

 

    var url = 'http://es.fifa.com/worldcup/matches/index.html';
    var respuesta = "Exito";

    console.log("Inicio carga de la pagina: " + url);
    axios.get(url).then( function (response)  {    
        if(response.toString().trim() != "") {
            console.log(response.data.toString().trim().length);
            var $ = cheerio.load(response.data);
            var contFlujo = 0;
            var PaisLocal, PaisVisitante, ScoreText;

            console.log("Ingreso a scrapear score");         
            var database = firebase.database();
            $('div.fi-mu.fixture').each(function() {
    
                PaisLocal = $(this).children(".fi-mu__m").children(".home").children(".fi-t__n").children(".fi-t__nText");
                PaisVisitante = $(this).children(".fi-mu__m").children(".away").children(".fi-t__n").children(".fi-t__nText");
                ScoreText = $(this).children(".fi-mu__m").children(".fi-s-wrap").children(".fi-s").children(".fi-s__score.fi-s__date-HHmm").children(".fi-s__scoreText");
                
                if(contFlujo <=63){
                    var ref = database.ref("matches/"+contFlujo+"/").update({ scoreTeam1: PaisLocal.text().trim(), scoreTeam2: PaisVisitante.text().trim() });  
                }
                contFlujo ++;
            });

            console.log("Fin de scrapear ...");
            console.log("Fin de actualizar ...");
       }
       else{
           console.log("Error al cargar pagina:" + url);
       }
    })
    .catch(function (error) {
        console.log(error);
    });   




const functions = require('firebase-functions');
const firebase = require('firebase');
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

 exports.scrapingfifa = functions.https.onRequest((req, res) => {

    var url = 'http://www.fifa.com/worldcup/matches/index.html';
    var json = { partidos: []};
    var respuesta = "Exito";
 
    request(url, function(error, response, html) {
        if(!error) {
            var $ = cheerio.load(html);
            var pais1;
            var pais2;
            var fecha;
            var etapa;
            var resultado;
            var penales;
            var estatus;
            console.log("Ingreso a scrapear");
            var storpartido = {
                home : "",
                visita : "",
                etapa : "",
                fecha : "",
                estatus : "",
                resultado : "",
                penales : "",
            };        
            $('div.col-xs-12.clear-grid').each(function() {
    
                var data = $(this).children();
                pais1 = data.children(".mu-m").children(".t.home").children(".t-n").children(".t-nText").text();
                pais2 = data.children(".mu-m").children(".t.away").children(".t-n").children(".t-nText").text();
                etapa = data.children(".mu-i").children(".mu-i-group").text();
                fecha = data.children(".mu-i").children(".mu-i-datetime").text();
                estatus = data.children(".mu-m").children(".s").children(".s-fixture").children(".s-status-abbr").text();
                resultado = data.children(".mu-m").children(".s").children(".s-fixture").children(".s-score.s-date-HHmm").children(".s-scoreText").text();
                penales = data.children(".mu-m").children(".s").children(".s-fixture").children(".mu-reasonwin-abbr").children(".text-reasonwin").text();
    
                storpartido = {
                    home : pais1,
                    visita : pais2,
                    etapa : etapa,
                    fecha : fecha,
                    estatus : estatus,
                    resultado : resultado,
                    penales : penales,
                };        
                json.partidos.push(storpartido);
            })
            //console.log(JSON.stringify(json));
            var database = firebase.database();         
            var ref = database.ref("/").set(json);
       }
    })   

    res.send(respuesta);
 });

 exports.consultafifa = functions.https.onRequest((req, res) => {
    var respuesta = "Exito";
    var ref = firebase.database().ref('/');
    var partidos;

    ref.on("value", function(snapshot) {
        partidos = snapshot.val();
    });  
    res.send(partidos);
 });    

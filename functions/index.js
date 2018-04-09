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

    var url = 'http://es.fifa.com/worldcup/matches/index.html';
    var json = { matches: []};
    var respuesta = "Exito";

    /*
    var options = {
        url: 'http://es.fifa.com/worldcup/matches/index.html',
        headers: {
          'User-Agent': 'request',  
          'Accept-Language': 'es-ES',
          'Content-Language': 'es-ES'
        }
      };    
    */
    console.log("Inicio carga de la pagina: " + url);
    request(url, function(error, response, html) {
        if(!error) {
            var $ = cheerio.load(html);
            var pais1;
            var pais2;
            var datetimelocal;
            var grupo;
            var resultado;
            var penales;
            var estatus;
            var timeutc;
            var idpartido;
            var round;

            console.log("Ingreso a scrapear");
            var storpartido = {
            };        
            $('div.col-xs-12.clear-grid').each(function() {
    
                var data = $(this).children();
                pais1 = data.children(".mu-m").children(".t.home").children(".t-n").children(".t-nText").text();
                pais2 = data.children(".mu-m").children(".t.away").children(".t-n").children(".t-nText").text();
                
                if((pais1 !="" && pais1 != null) && (pais2 !="" && pais2 != null)){
                    
                    etapa = data.children(".mu-i").children(".mu-i-group").text() + "";
                    datetimelocal = data.children(".mu-i").children(".mu-i-datetime").text();
                    estatus = data.children(".mu-m").children(".s").children(".s-fixture").children(".s-status-abbr").text();
                    resultado = data.children(".mu-m").children(".s").children(".s-fixture").children(".s-score.s-date-HHmm").children(".s-scoreText").text();
                    penales = data.children(".mu-m").children(".s").children(".s-fixture").children(".mu-reasonwin-abbr").children(".text-reasonwin").text();

                    datetimelocal = datetimelocal.replace(data.children(".mu-i").children(".mu-i-datetime").children(".wrap-localtime").text(), "");
                    timeutc = data.children(".mu-m").children(".s").children(".s-fixture").children(".s-score.s-date-HHmm").attr("data-timeutc");
                    idpartido = data.children(".mu-i").children(".mu-i-matchnum").text();
                    idpartido = idpartido.replace("Partido","").trim();

                    if(etapa.toString().split("Grupo").length > 1){
                        grupo= etapa.toString().split("Grupo")[1].trim();
                        round= "GR";
                    }else{
                        grupo="";
                        round=etapa;    
                    }
            
                    storpartido ={
                        city : data.children(".mu-i").children(".mu-i-location").children(".mu-i-venue").text(),
                        date : data.children(".mu-i").children(".mu-i-date").text(),
                        datetime : datetimelocal,
                        group : grupo,
                        id : idpartido,
                        round : round,
                        scorePenaltyTeam1 : "",
                        scorePenaltyTeam2 : "",
                        scoreTeam1 : "",
                        scoreTeam2 : "",
                        stadium : data.children(".mu-i").children(".mu-i-location").children(".mu-i-stadium").text(),
                        team1 : data.children(".mu-m").children(".t.home").children(".t-n").children(".t-nTri").text(),
                        team2 : data.children(".mu-m").children(".t.away").children(".t-n").children(".t-nTri").text(),
                        teamName1 : data.children(".mu-m").children(".t.home").children(".t-n").children(".t-nText").text(),
                        teamName2 : data.children(".mu-m").children(".t.away").children(".t-n").children(".t-nText").text(),
                        timeutc : timeutc,
                    };

                    json.matches.push(storpartido);
                }
            });

            console.log("Fin de scrapear ...");
            var database = firebase.database();         
            var ref = database.ref("matches/").set(json.matches);
            console.log("Fin de guardar");
       }
       else{
           console.log("Error al cargar pagina:" + url);
       }
    });   

    res.send(respuesta);
 });

 exports.scrapingtablafifa = functions.https.onRequest((req, res) => {
    var respuesta = "Exito";
    var url = 'http://es.fifa.com/worldcup/groups/index.html';
    var json = { positionTable: []};
    var cont = 0;
    
    request(url, function(error, response, html) {
        if(!error) {
            var $ = cheerio.load(html);
            console.log("Ingreso a scrapear");
            var postable = {
            };        
    
            $('div.group-wrap').each(function() {
        
                var data = $(this).children(".module").children(".inner").children(".anchor").children("table.table.tbl-standings");
                var datos = data.children("tbody").children("tr");
    
                datos.each(function() {
                    console.log($(this).text());
                });
                //console.log(datos);
                postable = { 
                };
                //json.positionTable.push(postable);
                cont = cont + 1;
                
            });
            console.log("Fin de scrapear");       
       }
       else{
           console.log("Error al cargar pagina:" + url);
       }
    }); 
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

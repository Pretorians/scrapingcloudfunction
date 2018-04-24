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

 exports.scrapingPartidosFifa = functions.https.onRequest((req, res) => {

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
    axios.get(url).then( function (response)  {    
        if(response.toString().trim() != "") {
            console.log(response.data.toString().trim().length);
            var $ = cheerio.load(response.data);
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
                    } else if(idpartido.toString()==="63" || idpartido.toString()==="64"){
                        grupo="";
                        round="Final"; 
                    }                
                    else{
                        grupo="";
                        round=etapa.toString().replace("de final","").trim();    
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
            console.log(json.matches);
            var ref = database.ref("matches/").set(json.matches);
            console.log("Fin de guardar ...");
       }
       else{
           console.log("Error al cargar pagina:" + url);
       }
    //});
        res.status(200).send("Exito");
    })
    .catch(function (error) {
        console.log(error);
    });   
    //console.log("fin de carga de la pagina: " + url);
    //res.send(respuesta);
 });

 exports.scrapingUpdateScoreFifa = functions.https.onRequest((req, res) => {

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
                ScoreText = ScoreText.text().trim();
                var result = ScoreText.search("-");
                if(result ===-1){
                    PaisLocal="";
                    PaisVisitante="";
                }
                else{
                    PaisLocal=ScoreText.split("-")[0];
                    PaisVisitante=ScoreText.split("-")[1];
                }

                if(contFlujo <=63){
                    var ref = database.ref("matches/"+contFlujo+"/").update({ scoreTeam1: PaisLocal, scoreTeam2: PaisVisitante });  
                }
                contFlujo ++;
            });

            console.log("Fin de scrapear ...");
            console.log("Fin de actualizar ...");
            res.status(200).send("Exito al actualizar el score");
       }
       else{
           console.log("Error al cargar pagina:" + url);
       }
    })
    .catch(function (error) {
        console.log(error);
    });   
 });  

 exports.scrapingTablaFifa = functions.https.onRequest((req, res) => {
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
 

 exports.consultaFifa = functions.https.onRequest((req, res) => {
    var respuesta = "Exito";
    var ref = firebase.database().ref('/');
    var partidos;

    ref.on("value", function(snapshot) {
        partidos = snapshot.val();
    });  
    res.send(partidos);
 });    

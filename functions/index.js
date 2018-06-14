const functions = require('firebase-functions');
const firebase = require('firebase');
var axios = require('axios');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var phantom = require("phantom");
var app     = express();
const moment = require('moment');
const cors = require('cors')({
  origin: true,
});

const appFirebase = firebase.initializeApp({

});

exports.scrapingUpdateLiveScoreFifa = functions.https.onRequest((req, res) => {

    //var url = 'http://es.fifa.com/worldcup/matches/index.html';
    var respuesta = "Exito";
    var ref = firebase.database().ref('matches/');
    var partidos;
    
    ref.once('value').then(snapshot=>{   
    
        //var url = 'https://scraping-6960e.firebaseapp.com/'
        var respuesta = "Exito";
        var _ph, _page, _outObj;

        phantom.create().then(function(ph){
            _ph = ph;
            return _ph.createPage();
        }).then(function(page){
            _page = page;
            return _page.open('https://es.fifa.com/worldcup/matches/');
        }).then(function(status){
            return new Promise(function(resolve,reject){
                setTimeout(function(){
                      console.log("Entro al timeout");
                      resolve(status);
                  },10000);
              });
        }).then(function(status){
            console.log(status);
            console.log("Esperando unos segundos para la ejecucion de script");
            return _page.property('content');
        }).then(function(content){
                var $ = cheerio.load(content);
                var contFlujo = 0;
                var PaisLocal, PaisVisitante, ScoreText, Etapa;
                var codPaisLocal, codPaisVisitante, grupo, round;
    
                console.log("Ingreso a scrapear score");         
                var database = firebase.database();
                $('div.fi-mu.live').each(function() {        
                    var padreDiv = $(this).parent().parent().attr("class");
    
                    //if(padreDiv === "fi-matchlist"){
                        PaisLocal = $(this).children(".fi-mu__m").children(".home").children(".fi-t__n").children(".fi-t__nText");
                        codPaisLocal = $(this).children(".fi-mu__m").children(".home").children(".fi-t__n").children(".fi-t__nTri").text().trim();
                        PaisVisitante = $(this).children(".fi-mu__m").children(".away").children(".fi-t__n").children(".fi-t__nText");
                        codPaisVisitante = $(this).children(".fi-mu__m").children(".away").children(".fi-t__n").children(".fi-t__nTri").text().trim();
                        ScoreText = $(this).children(".fi-mu__m").children(".fi-s-wrap").children(".fi-s").children(".fi-s__score.fi-s__date-HHmm").children(".fi-s__scoreText");
                        Etapa = $(this).children(".fi-mu__info").children(".fi__info__group");
    
                        if(Etapa.text().toString().split("Grupo").length > 1){
                            grupo= Etapa.text().toString().split("Grupo")[1].trim();
                            round= "GR";
                        }              
                  
                        ScoreText = ScoreText.text().trim();
                        var result = ScoreText.search("-");
                        if(result ===-1){
                            PaisLocal="";
                            PaisVisitante="";
                        }
                        else{
                            PaisLocal=ScoreText.split("-")[0].toString().trim();
                            PaisVisitante=ScoreText.split("-")[1].toString().trim();
                                                    
                            var key;
                            if(contFlujo <=63){
                                var updateScore = false;
                                snapshot.forEach((childSnapshot)=>{
                                    if((codPaisLocal === childSnapshot.val().team1 && codPaisVisitante === childSnapshot.val().team2) &&
                                    (grupo === childSnapshot.val().group || round != 'GR')){
                                        
                                        if((PaisLocal != childSnapshot.val().scoreTeam1) ||
                                        (PaisVisitante != childSnapshot.val().scoreTeam2)){
                                            updateScore = true;
                                        }
                                        key = childSnapshot.key;
                                        return true;
                                    }
                                });                    
    
                                if(updateScore){
                                    var ref = database.ref("matches/"+key+"/").update({ scoreTeam1: PaisLocal, scoreTeam2: PaisVisitante });  
                                }    
                            }
                            /**/
                        }
                        contFlujo ++;
                        console.log(codPaisLocal + " vs " + codPaisVisitante + " = " + ScoreText);
                    //}
                });
    
                console.log("Lectura de Partidos ..." + contFlujo);
                console.log("Fin de scrapear ...");
                console.log("Fin de actualizar ...");
                res.status(200).send("Exito al actualizar el score"); 

                _page.close();
                _ph.exit();
            }).catch(function(e){
                console.log(e); 
        });
    });   
 });  
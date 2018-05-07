const functions = require('firebase-functions');
const firebase = require('firebase');
var axios = require('axios');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
const moment = require('moment');
const cors = require('cors')({
  origin: true,
});

//CABECERA DE DATOS CORREO

const SENDGRID_API_KEY="";
const SENDGRID_SENDER="soporte@chaman.pe";
const Sendgrid=require('sendgrid')(SENDGRID_API_KEY);
/**/

const appFirebase = firebase.initializeApp({
   
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

    //var url = 'http://es.fifa.com/worldcup/matches/index.html';

    var respuesta = "Exito";
    var ref = firebase.database().ref('matches/');
    var partidos;
    
    ref.once('value').then(snapshot=>{   
    
        var url = 'https://scraping-6960e.firebaseapp.com/'
        var respuesta = "Exito";
    
        console.log("Inicio carga de la pagina: " + url);
        axios.get(url).then( function (response)  {    
            if(response.toString().trim() != "") {
                console.log(response.data.toString().trim().length);
                var $ = cheerio.load(response.data);
                var contFlujo = 0;
                var PaisLocal, PaisVisitante, ScoreText, Etapa;
                var codPaisLocal, codPaisVisitante, grupo, round;
    
                console.log("Ingreso a scrapear score");         
                var database = firebase.database();
                $('div.fi-mu.fixture').each(function() {
        
                    var padreDiv = $(this).parent().parent().attr("class");
    
                    if(padreDiv === "fi-matchlist"){
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
                        }
                        contFlujo ++;
                    }
                });
    
                console.log("Lectura de Partidos ..." + contFlujo);
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
 

 exports.envioCorreo = functions.https.onRequest((req, res) => {

    return cors(req, res, () => {
      console.log(req.body.correo);
      console.log(req.body.nombre);

      var correo = req.body.correo;
      var nomCliente = req.body.nombre; 

      const sgReq = Sendgrid.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: {
            personalizations: [{
              to: [{ email: correo }],
              substitutions: {
                "-name-": nomCliente
              }, 
              subject: 'Que tal Mundo Chaman!',     
            }],
            from: { email: SENDGRID_SENDER },
            content: [{
              type: 'text/html',
              value: 'Bienvenido el momento llego, Copa Mundial 2018'
            }],
            template_id: ""     
          }
      });
      
      Sendgrid.API(sgReq, (err) => {
          if (err) {
            next(err);
            return;
          }
      });

      var json = { "respuesta": "ok" };
      res.status(200).send(json);
    });

  });

  exports.enviocorreobienvenida = functions.database.ref('/users/{userId}')
    .onCreate((event) => {
        console.log("Preparandose para enviar el correo")
		return admin.database().ref('/users/'+event.params.userId).once('value').then((snapshot)=>{
    		snapshot.forEach((childSnapshot)=>{
				var item=childSnapshot.val();
				var nombre, correo;
				nombre = item.profile.givenName;
				correo = item.profile.email;

                console.log(nombre);
                console.log(correo);

				const sgReq = Sendgrid.emptyRequest({
					method: 'POST',
					path: '/v3/mail/send',
					body: {
					  personalizations: [{
						to: [{ email: correo }],
						substitutions: {
						  "-name-": nomCliente
						}, 
						subject: 'Bienvenidos a la Polla del Chaman!',     
					  }],
					  from: { email: SENDGRID_SENDER },
					  content: [{
						type: 'text/html',
						value: 'Bienvenidos a la Polla del Chaman!'
					  }],
					  template_id: "13ecacfd-e9e3-474b-a519-b485549f8b3f"     
					}
				});
				
				Sendgrid.API(sgReq, (err) => {
					if (err) {
					  next(err);
					  return;
					}
				});
			})
		});
});	
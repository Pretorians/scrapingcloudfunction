
//const phantom = require('phantom');

/*
(async function() {
  const instance = await phantom.create();
  const page = await instance.createPage();
  await page.on('onResourceRequested', function(requestData) {
    console.info('Requesting', requestData.url);
  });

  const status = await page.open('https://stackoverflow.com/');
  const content = await page.property('content');
  console.log(content);

  await instance.exit();
})();
*/

var phantom = require("phantom");
var cheerio = require('cheerio');
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
    //console.log(content);
    var $ = cheerio.load(content);
    var contFlujo = 0;
    var contFlujoSinValidar = 0;
    var PaisLocal, PaisVisitante, ScoreText, Etapa;
    var codPaisLocal, codPaisVisitante, grupo, round;
    console.log("Ingreso a scrapear score");  

    $('div.fi-mu.fixture').each(function() {
    
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
            /*
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
            */
            }
            contFlujo ++;
            console.log(codPaisLocal + " vs " + codPaisVisitante + " = " + ScoreText);
        //}
        contFlujoSinValidar ++;
    });

    console.log("Lectura de Partidos ..." + contFlujo);
    console.log("Lectura de Partidos sin validar ..." + contFlujoSinValidar);
    console.log("Fin de scrapear ...");
    console.log("Fin de actualizar ...");

    _page.close();
    _ph.exit();
}).catch(function(e){
   console.log(e); 
});





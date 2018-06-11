var axios = require('axios');
var request = require('request');
var cheerio = require('cheerio');


var respuesta = "Exito";
var partidos;


var url = 'https://scraping-6960e.firebaseapp.com/'
var respuesta = "Exito";

console.log("Inicio carga de la pagina: " + url);
axios.get(url).then(function (response) {
    if (response.toString().trim() != "") {
        console.log(response.data.toString().trim().length);
        var $ = cheerio.load(response.data);
        var contFlujo = 0;
        var PaisLocal, PaisVisitante, ScoreText, Etapa;
        var codPaisLocal, codPaisVisitante, grupo, round;

        console.log("Ingreso a scrapear score");

        $('div.fi-mu.fixture').each(function () {

            var padreDiv = $(this).parent().parent().attr("class");

            if (padreDiv === "fi-matchlist") {
                PaisLocal = $(this).children(".fi-mu__m").children(".home").children(".fi-t__n").children(".fi-t__nText");
                codPaisLocal = $(this).children(".fi-mu__m").children(".home").children(".fi-t__n").children(".fi-t__nTri").text().trim();
                PaisVisitante = $(this).children(".fi-mu__m").children(".away").children(".fi-t__n").children(".fi-t__nText");
                codPaisVisitante = $(this).children(".fi-mu__m").children(".away").children(".fi-t__n").children(".fi-t__nTri").text().trim();
                ScoreText = $(this).children(".fi-mu__m").children(".fi-s-wrap").children(".fi-s").children(".fi-s__score.fi-s__date-HHmm").children(".fi-s__scoreText");
                Etapa = $(this).children(".fi-mu__info").children(".fi__info__group");

                if (Etapa.text().toString().split("Grupo").length > 1) {
                    grupo = Etapa.text().toString().split("Grupo")[1].trim();
                    round = "GR";
                }


                ScoreText = ScoreText.text().trim();
                var result = ScoreText.search("-");
                if (result === -1) {
                    PaisLocal = "";
                    PaisVisitante = "";
                }
                else {
                    PaisLocal = ScoreText.split("-")[0].toString().trim();
                    PaisVisitante = ScoreText.split("-")[1].toString().trim();

                }
                contFlujo++;
                console.log(codPaisLocal + " vs " + codPaisVisitante + " = " + ScoreText);
            }
        });

        console.log("Lectura de Partidos ..." + contFlujo);
        console.log("Fin de scrapear ...");
        console.log("Fin de actualizar ...");
        //res.status(200).send("Exito al actualizar el score");
    }
    else {
        console.log("Error al cargar pagina:" + url);
    }
})
    .catch(function (error) {
        console.log(error);
    });








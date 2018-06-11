
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

function promiseTimeout (time) {
    return new Promise(function(resolve,reject){
      setTimeout(function(){
            console.log("Entro al timeout");
            resolve(time);
        },time);
    });
  };

var phantom = require("phantom");
var _ph, _page, _outObj;

phantom.create().then(function(ph){
    _ph = ph;
    return _ph.createPage();
}).then(function(page){
    _page = page;
    return _page.open('https://scraping-6960e.firebaseapp.com/');
}).then(function(status){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
              console.log("Entro al timeout");
              resolve(status);
          },20000);
      });
}).then(function(status){
    console.log(status);
    console.log("Esperando 5 segundos");
    return _page.property('content');
}).then(function(content){
    console.log(content);
    _page.close();
    _ph.exit();
}).catch(function(e){
   console.log(e); 
});





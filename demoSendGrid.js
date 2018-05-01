'use strict';

const SENDGRID_API_KEY = "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";
const SENDGRID_SENDER = "soporte@chaman.pe";
const Sendgrid = require('sendgrid')(SENDGRID_API_KEY);

var correo = "carlos.montesdeoca.h@gmail.com";
var nomCliente = "Carlos Montes";

const sgReq = Sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{ email: correo }],
        substitutions: {
          "-name-": nomCliente
        }, 
        subject: 'Que tal Mundo Nocturno!',     
      }],
      from: { email: SENDGRID_SENDER },
      content: [{
        type: 'text/html',
        value: 'Bienvenido el momento llego'
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

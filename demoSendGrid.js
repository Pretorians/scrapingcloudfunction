'use strict';

const SENDGRID_API_KEY = "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";
const SENDGRID_SENDER = "soporte@chaman.pe";
const Sendgrid = require('sendgrid')(SENDGRID_API_KEY);

//Template_20180424074433670

const sgReq = Sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{ email: "carlos.montesdeoca.h@gmail.com" }],
        subject: 'Hola Mundo Nocturno!'
      }],
      from: { email: SENDGRID_SENDER },
      content: [{
        type: 'text/html',
        value: 'Bienvenido el momento llego'
      }],
      template_id: "115c9e79-5ccc-4745-90c0-490974be084a"
    }
});

Sendgrid.API(sgReq, (err) => {
    if (err) {
      next(err);
      return;
    }
});

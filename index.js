'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
// bot fb page
const token = "EAADiQpmWQRgBAPglvHwxHZCMaXlZBHHjADrALySMQvlwR4wl5MbnhW5ZA3JDaKqOagA6ZC32lZBoDAv0mYO3rwgJtlihDcGAnfmb3xgj5YTen2ZBPA4a3zsSot4TVB7W0xdjnrmh4ZAt4NVvmBoZAzONDTmWNh119KA1f4YQZA18towZDZD";
const msngerServerUrl = 'https://mecatobot.herokuapp.com/bot';
//global var
var time
app.set('port', (process.env.PORT || 5000));
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// Process application/json
app.use(bodyParser.json());
app.use(express.static('public'));
// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am Weatherman!.');
});
// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'Mecato-Bot') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});
// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'));
});
//FBM webhook

app.post('/webhook/', function (req, res) {
    var intent=0;
    sendtoBot(req, res,intent);
});

function sendtoBot(req, res,numintent) {
    console.log(JSON.stringify(req.body));
    let messaging_events = req.body.entry[0].messaging;

    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i];
        let sender = event.sender.id;
        let recipient = event.recipient.id;
        time = req.body.entry[0].time;
        let text = "";
        let type = "";
        try {
            text = messaging_events[i].postback.title;
        } catch (err) {
        }
        try {
            type = messaging_events[i].postback.payload;
        } catch (err) {
        }
        console.log("type " + type);
        if (type.length != 0) {
            request({
                url: msngerServerUrl,
                method: 'POST',
                form: {
                    'userId': sender,
                    'userType': type,
                    'userUtterance': text
                }
            },
                    function (error, response, body) {
                        //response is from the bot
                        if (!error && response.statusCode === 200) {
                            selectTypeBotMessage(sender, body);
                        } else if(!error && numintent<10) {
                            console.log("intent" + numintent);
                            console.log("response" + JSON.stringify(response));
                            console.log("re send- " + body);
                            numintent++;
                            sendtoBot(req, res,numintent);
                        }else{
                            sendTextMessage(sender, 'no te puedo ayudar con tu solicitud');
                        }
                    });
        } else {
            sendtextbot(event, sender,numintent);
        }

    }
    res.sendStatus(200);
}
function InfoPersona(sender) {
    let user = null
    request({
        url: 'https://graph.facebook.com/' + sender + '?fields=first_name,last_name&access_token=' + token,
        method: 'GET',
    }, function (error, response, body) {
        console.log(body);
        var infou = JSON.parse(body);
        console.log(infou);
        let u = '{';
        u += '"first_name": "' + infou.first_name + '",';
        u += '"last_name": "' + infou.last_name + '",';
        u += '"id": "' + infou.id + '"';
        u += '}';
        user = JSON.parse(u);
        console.log("completado" + user);
        console.log("completado" + user.first_name);
        return user;
    });

}

function sendtextbot(event, sender,numintent) {
    if (event.message && event.message.text) {
        let text = event.message.text;
        //send it to the bot
        request({
            url: msngerServerUrl,
            method: 'POST',
            form: {
                'userId': sender,
                'userUtterance': text
            }
        },
                function (error, response, body) {
                    //response is from the bot
                    if (!error && response.statusCode === 200) {
                        selectTypeBotMessage(sender, body);
                    } else if(!error && numintent<10) {
                            console.log("intent" + numintent);
                            console.log("response" + JSON.stringify(response));
                            console.log("re send- " + body);
                            numintent++;
                            sendtextbot(event, sender,numintent);
                        }else{
                            sendTextMessage(sender, 'no te puedo ayudar con tu solicitud');
                        }
                });
    }
}

function selectTypeBotMessage(sender, body) {
    // Print out the response body
    console.log(body);
    body = body.substring(1, body.length - 1);
    body = body.replace(/\\/g, '');
    let botOut = JSON.parse(body);
    if (botOut.botUtterance !== null) {
        if (botOut.type !== null) {
            var ty = botOut.type;
            var t1 = "ofrecerTipo";
            var t2 = "ofrecerIngredientes";
            var t3 = "ofrecerTiendas";
            var t4 = "saludar";
            var t5 = "agradecer";
            var t6 = "confirmarPedido";
            var t7 = "finalizar";
            var t8 = "menu";
            var t9 = "addIngredient";
            var n1 = ty.localeCompare(t1);
            var n2 = ty.localeCompare(t2);
            var n3 = ty.localeCompare(t3);
            var n4 = ty.localeCompare(t4);
            var n5 = ty.localeCompare(t5);
            var n6 = ty.localeCompare(t6);
            var n7 = ty.localeCompare(t7);
            var n8 = ty.localeCompare(t8);
            var n9 = ty.localeCompare(t9);
            if (n1 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendUserPostback(sender, botOut);
                }
            } else if (n2 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendUserPostback(sender, botOut);
                }
            } else if (n3 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendUserPostback(sender, botOut);
                }
            } else if (n4 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n5 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n6 === 0) {
                sendTextMessageConfirm(sender, botOut)
                sendButtonsConfirm(sender)
            } else if (n7 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n8 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
                sendTextMessageList(sender, botOut);
            } else if (n9 === 0) {
                console.log(botOut.botUtterance)
            } else {
                sendTextMessage(sender, "disculpa no puedo responder a tu solicitud");
            }
        }
        console.log(botOut.botUtterance);
    }
}

function sendUserPostback(sender, bot) {
    let buttons = '[ ';
    for (var i = 0; i < bot.buttons.length; i++) {
        if (i !== 0) {
            buttons += ',';
        }
        buttons += '{';
        buttons += '"type": "postback",';
        buttons += '"title": "' + bot.buttons[i].titulo + '",';
        buttons += ' "payload": "' + bot.buttons[i].respuesta + '"';
        buttons += '}';
    }
    buttons += ']';
    console.log(buttons);
    let b = JSON.parse(buttons);
    if (bot !== 'null') {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": bot.botUtterance,
                    "buttons": b
                }
            }
        };
        console.log(messageData);
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}


function sendTextMessage(sender, text) {
    if (text !== 'null') {

        let messageData = {'text': text
        };
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}

function sendTextMessageList(sender, bot) {
    console.log(bot);
    let elements = '[';
    let cant = 0;
    if (bot.elements.length > 10) {
        cant = 10;
    } else {
        cant = bot.elements.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0) {
            elements += ',';
        }
        elements += '{';
        elements += '"title":"' + bot.elements[i].titulo + '"';
        var subtitulo = "";
        try {
            var t1 = "undefined";
            var n1 = bot.elements[i].subtitulo.localeCompare(t1);
            if (n1 !== 0) {
                var subtitulo = bot.elements[i].subtitulo;
                elements += ',"subtitle":"' + subtitulo + '"';
            }

        } catch (err) {
        }
        try {
            var t1 = "undefined";
            var n1 = bot.elements[i].url.localeCompare(t1);
            if (n1 !== 0) {
                var url = bot.elements[i].url;
                url = fixUrl(url);
                elements += ',"image_url":"' + url + '"';
            }
        } catch (err) {
        }
        if (bot.elements[i].buttons.length > 0) {
            elements += ',"buttons":[';
            for (var j = 0; j < bot.elements[i].buttons.length; j++) {
                elements += '{';
                elements += ' "type": "postback",';
                elements += ' "title": "' + bot.elements[i].buttons[j].titulo + '",';
                elements += ' "payload": "' + bot.elements[i].buttons[j].respuesta + '"';
                elements += '}';
            }
            elements += ']';
        }
        elements += '}';
    }
    elements += ']';

    let arrayElements = JSON.parse(elements);
    console.log(arrayElements);
    if (bot !== 'null') {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": arrayElements
                }
            }
        };
        console.log(messageData);
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}

function sendTextMessage(sender, text) {
    if (text !== 'null') {

        let messageData = {'text': text
        };
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}

function sendTextMessageConfirm(sender, bot) {
    console.log(bot);
    let elements = '[';
    let cant = 0;
    if (bot.Pedido.ingredientes.length > 10) {
        cant = 10;
    } else {
        cant = bot.Pedido.ingredientes.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0 && i !== cant) {
            elements += ',';
        }
        elements += '{';
        elements += ' "title": "' + bot.Pedido.ingredientes[i] + '",';
        //elements += ' "subtitle":"<ITEM_DESCRIPTION_OR_DETAILS>",';
        elements += ' "quantity": "1", ';
        elements += ' "price": 5000,';
        elements += ' "currency": "COP",';
        elements += ' "image_url":"'+ decodeURIComponent(fixUrl(bot.msg[i])) + '"';
        //elements += ' "image_url":"https://goo.gl/images/JJpN9r"';
        elements += ' }  ';
    }
    elements += ']';

    let arrayElements = JSON.parse(elements);
    console.log(arrayElements);
    if (bot !== 'null') {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "receipt",
                    "recipient_name": " " + bot.username,
                    "order_number": bot.Pedido.tipo + "  en la tienda " + bot.Pedido.tienda,
                    "currency": "COP",
                    "payment_method": "Visa 2345",
                    "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                    "timestamp":"1428444852",
                    "address": {
                        "street_1": "1 Hacker Way",
                        "street_2": "",
                        "city": "Bogotá",
                        "postal_code": "94025",
                        "state": "BA",
                        "country": "CO"
                    },
                    "summary": {
                        "subtotal": "5000",
                        "shipping_cost": "1800",
                        "total_tax": "200",
                        "total_cost": "7000"
                    },
                    "elements": arrayElements
                }
            }
        };
        console.log(messageData);
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}

function sendButtonsConfirm(sender) {
    let buttons = '[ ';
    buttons += '{';
    buttons += '"type": "postback",';
    buttons += '"title": "Si",';
    buttons += ' "payload": "confirmandoPedido"';
    buttons += '}';
    buttons += ',';
    buttons += '{';
    buttons += '"type": "postback",';
    buttons += '"title": "No",';
    buttons += ' "payload": "confirmandoPedido"';
    buttons += '}';
    buttons += ']';
    console.log(buttons);
    let b = JSON.parse(buttons);
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": " desea confirmar el pedido?",
                "buttons": b
            }
        }
    };
    console.log(messageData);
    // Start the request
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData

        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}


function fixUrl(url) {
    console.log("url" + url)
    var res = ''
    var var2 = url.split("u003d");
    for (var i = 0; i < var2.length; i++) {
        if (i != 0) {
            res += '='
        }
        res += var2[i]
    }
    var2 = res.split("u0026");
    res = '';
    for (var i = 0; i < var2.length; i++) {
        if (i != 0) {
            res += '&'
        }
        res += var2[i]
    }
    console.log("fix url " + res)
    return res;
}

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
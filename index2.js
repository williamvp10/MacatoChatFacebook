'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
// bot fb page
const token = "EAADiQpmWQRgBAPglvHwxHZCMaXlZBHHjADrALySMQvlwR4wl5MbnhW5ZA3JDaKqOagA6ZC32lZBoDAv0mYO3rwgJtlihDcGAnfmb3xgj5YTen2ZBPA4a3zsSot4TVB7W0xdjnrmh4ZAt4NVvmBoZAzONDTmWNh119KA1f4YQZA18towZDZD";
const msngerServerUrl = 'https://mecatobot.herokuapp.com/bot';
//global var

var varIngredientes = "";
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
app.post('/webhook/', function (req, res) {
    console.log(JSON.stringify(req.body));
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {

        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        let recipient = event.recipient.id;
        let time = req.body.entry[0].time;
        let text = "";
        try {
            text = req.body.entry[0].messaging[i].postback.title;
            var type = "" + req.body.entry[0].messaging[i].postback.payload;
            var type1 = type.split(":")[0];
            console.log(type);
            var compareIngredientes = "add Ingredientes";
            var compare2Ingredientes = "requestTiendas";
            var compareresultIngredientes = compareIngredientes.localeCompare(type1);
            var compareresult2Ingredientes = compare2Ingredientes.localeCompare(type1);
            if (compareresultIngredientes === 0) {
                if (varIngredientes.length > 0) {
                    varIngredientes += ",";
                }
                varIngredientes += type.split(":")[1];
            } else if (compareresult2Ingredientes === 0) {
                request({
                    url: msngerServerUrl,
                    method: 'POST',
                    form: {
                        'userType': type,
                        'userUtterance': varIngredientes
                    }
                }, function (error, response, body) {
                    //response is from the bot
                    varIngredientes = "";
                    if (!error && response.statusCode === 200) {
                        selectTypeBotMessage(sender, body);
                    } else {
                        sendTextMessage(sender, 'Error!');
                    }
                });
            } else {
                request({
                    url: msngerServerUrl,
                    method: 'POST',
                    form: {
                        'userType': type,
                        'userUtterance': text
                    }
                }, function (error, response, body) {
                    //response is from the bot
                    if (!error && response.statusCode === 200) {
                        selectTypeBotMessage(sender, body);
                    } else {
                        sendTextMessage(sender, 'Error!');
                    }
                });
            }
        } catch (err) {
            sendtextbot(event, sender);
        }

    }

    res.sendStatus(200);
});

function sendtextbot(event, sender) {
    if (event.message && event.message.text) {
        let text = event.message.text;
        //send it to the bot
        request({
            url: msngerServerUrl,
            method: 'POST',
            form: {
                'userUtterance': text
            }
        },
                function (error, response, body) {
                    //response is from the bot
                    if (!error && response.statusCode === 200) {
                        selectTypeBotMessage(sender, body);
                    } else {
                        sendTextMessage(sender, 'Error!');
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
            var t1 = "Producto";
            var n1 = ty.localeCompare(t1);
            var t2 = "Ingredientes";
            var n2 = ty.localeCompare(t2);
            var t3 = "Tiendas";
            var n3 = ty.localeCompare(t3);
            var t4 = "finalizar";
            var n4 = ty.localeCompare(t4);
            var t5 = "Resultados";
            var n5 = ty.localeCompare(t5);
            if (n1 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n2 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n3 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n4 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n5 === 0) {
                sendTextMessage(sender, botOut.InformeProducto.text);
                sendTextMessage(sender, botOut.InformeIngredientes.text);
                sendTextMessage(sender, botOut.InformeTienda.text);
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else {
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            }


        }
        console.log(botOut.botUtterance);
    }
}
function sendTextMessageType(sender, bot) {
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
        elements += ' "title":"' + bot.elements[i].titulo + '",';
        var subtitulo = "";
        try {
            var subtitulo = bot.elements[i].titulo;
            elements += ' "subtitle":"' + subtitulo + '",';
        } catch (err) {
        }
        try {
            var t1 = "undefined";
            var n1 = bot.elements[i].url.localeCompare(t1);
            if (n1 !== 0) {
                var url = bot.elements[i].url;
                elements += ' "image_url":"' + url + '",';
            }
        } catch (err) {
        }

        elements += ' "buttons":[';
        for (var j = 0; j < bot.elements[i].buttons.length; j++) {
            elements += ' { ';
            elements += ' "type": "postback",';
            elements += ' "title": "' + bot.elements[i].buttons[j].titulo + '",';
            elements += ' "payload": "' + bot.elements[i].buttons[j].respuesta + '"';
            elements += '  }  ';
        }
        elements += ' ]  ';
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

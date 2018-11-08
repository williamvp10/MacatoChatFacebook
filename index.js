'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
// bot fb page
const token = "EAADiQpmWQRgBAPglvHwxHZCMaXlZBHHjADrALySMQvlwR4wl5MbnhW5ZA3JDaKqOagA6ZC32lZBoDAv0mYO3rwgJtlihDcGAnfmb3xgj5YTen2ZBPA4a3zsSot4TVB7W0xdjnrmh4ZAt4NVvmBoZAzONDTmWNh119KA1f4YQZA18towZDZD";
const msngerServerUrl = 'https://mecatobot.herokuapp.com/bot';
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
    console.log(JSON.stringify(req.body));
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {

        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;

        let recipient = event.recipient.id;
        let time = req.body.entry[0].time;

        // we call the MessengerBot here..
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
                        console.log("body " + body);
                        //response is from the bot
                        if (!error && response.statusCode === 200) {
                            // Print out the response body

                            body = body.substring(1, body.length - 1);
                            body = body.replace(/\\/g, '');
                            console.log(body);
                            let botOut = JSON.parse(body);
                            if (botOut.botUtterance !== null) {
                                selectTypeBotMessage(sender, botOut);
                            }
                        } else {
                            sendTextMessage(sender, 'Error!');
                        }
                    });
        }
    }


    res.sendStatus(200);

});
function sendTextMessage(sender, text) {
    if (text !== 'null') {

        let messageData = {
            'text': text
        };
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                type: "mensaje",
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

function selectTypeBotMessage(sender, botOut) {

    if (botOut.botUtterance !== null) {
        if (botOut.type !== null) {
            var ty = botOut.type;
            var t1 = "ofrecerTipo";
            var t2 = "ofrecerIngredientes";
            var t3 = "ofrecerTiendas";
            var t4 = "saludar";
            var t5 = "agradecer";
            var n1 = ty.localeCompare(t1);
            var n2 = ty.localeCompare(t2);
            var n3 = ty.localeCompare(t3);
            var n4 = ty.localeCompare(t4);
            var n5 = ty.localeCompare(t5);
            sendTextMessage(sender, botOut.botUtterance);
            if (n1 === 0) {
                var but = "";
                for (var i = 0; i < botOut.buttons.product[i].length; i++) {
                    but += '' + botOut.buttons.product[i].tipo + '  ';
                }
                sendTextMessage(sender, but);
            } else if (n2 === 0) {
                sendTextMessageIngredients(sender, botOut);
            } else if (n3 === 0) {
                sendTextMessageTiendas(sender, botOut);
            } else if (n4 === 0) {
                sendTextMessageType(sender, botOut.botUtterance);
            } else if (n5 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else {
                sendTextMessage(sender, "disculpa no entendi");
            }
        }
        console.log(botOut.botUtterance);
    }
}
//
function sendTextMessageType(sender, bot) {
    console.log(bot);
    console.log(bot.buttons);
    console.log(bot.buttons.product);
    var but = "";
    for (var i = 0; i < bot.buttons[0].length; i++) {
        but += '' + bot.buttons[0].product[i].tipo + '  ';
    }
    console.log(but);
    if (bot !== 'null') {
        let messageData = {
            'text': but
        };
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
function sendTextMessageIngredients(sender, bot) {
    var but = "";
    for (var i = 0; i < bot.buttons.product.length; i++) {
        but += '' + bot.buttons.product[i].ingredientes + '  ';
    }
    console.log(but);
    if (bot !== 'null') {
        let messageData = {
            'text': but
        };
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

function sendTextMessageTiendas(sender, bot) {
    var but = "";
    for (var i = 0; i < bot.buttons.product.length; i++) {
        but += '' + bot.buttons.tienda[i].nombre + ':' + bot.buttons.tienda[i].url + '  ';
    }
    console.log(but);
    if (bot !== 'null') {
        let messageData = {
            'text': but
        };
        let buttons = '[ ';
        for (var i = 0; i < bot.buttons.tienda.length; i++) {
            if (i !== 0) {
                buttons += ',';
            }
            buttons += '{';
            buttons += ' "type":"web_url",';
            buttons += ' "title": "' + bot.buttons.tienda[i].nombre + '",';
            buttons += ' "url":"' + bot.buttons.tienda[i].url + '"';
            buttons += '}';
        }

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


//                              envio de una imagen 
// let messageData = {"attachment": {
//                "type": "image",
//                "payload": {
//                    "url": "https://www.google.com.co/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
//                }
//            }
//        }

//                                   botones
//let messageData = {
//            "attachment": {
//                "type": "template",
//                "payload": {
//                    "template_type": "button",
//                    "text": "What do you want to do next?",
//                    "buttons": [
//                        {
//                            "type": "web_url",
//                            "url": "https://www.messenger.com",
//                            "title": "Visit Messenger"
//                        },
//                        {
//                            "type": "postback",   //error en el tipo postback
//                            "title": "Weather this weekend",
//                            "payload": "PAYLOAD_WEEKEND_LONDON"
//                        },
//                        {
//                            "type": "Goto Website",
//                            "url": "https://myweather.com/london",
//                            "title": "More Info"
//                        }
//                    ]
//                }
//            }
//        }




//let messageData = {
//            "attachment": {
//                "type": "template",
//                "payload": {
//                    "template_type": "list",
//                    "top_element_style": "compact",
//                    "elements": [
//                        {
//                            "title": "Classic T-Shirt Collection",
//                            "subtitle": "See all our colors",
//                            "image_url": "https://www.google.com.co/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
//                            "buttons": [
//                                {
//                                    "title": "View",
//                                    "type": "web_url",
//                                    "url": "https://www.google.com",
//                                    "messenger_extensions": true,
//                                    "webview_height_ratio": "tall",
//                                    "fallback_url": "https://www.google.com"
//                                }
//                            ]
//                        },
//                        {
//                            "title": "Classic White T-Shirt",
//                            "subtitle": "See all our colors",
//                            "default_action": {
//                                "type": "web_url",
//                                "url": "https://www.google.com",
//                                "messenger_extensions": false,
//                                "webview_height_ratio": "tall"
//                            }
//                        },
//                        {
//                            "title": "Classic Blue T-Shirt",
//                            "image_url": "https://www.google.com.co/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
//                            "subtitle": "100% Cotton, 200% Comfortable",
//                            "default_action": {
//                                "type": "web_url",
//                                "url": "https://www.google.com",
//                                "messenger_extensions": true,
//                                "webview_height_ratio": "tall",
//                                "fallback_url": "https://www.google.com"
//                            },
//                            "buttons": [
//                                {
//                                    "title": "Shop Now",
//                                    "type": "web_url",
//                                    "url": "https://www.google.com",
//                                    "messenger_extensions": true,
//                                    "webview_height_ratio": "tall",
//                                    "fallback_url": "https://www.google.com"
//                                }
//                            ]
//                        }
//                    ],
//                    "buttons": [
//                        {
//                            "title": "View More",
//                            "type": "postback",
//                            "payload": "payload"
//                        }
//                    ]
//                }
//            }
//        } 


function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
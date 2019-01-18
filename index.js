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
        let text = "";
        try {
            text = req.body.entry[0].messaging[i].postback.title;
            let type= req.body.entry[0].messaging[i].postback.payload;
            console.log(type);
            request({
                url: msngerServerUrl,
                method: 'POST',
                form: {
                    'userType': type,
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
        } catch (err) {
            if (event.message && event.message.text) {
                text = event.message.text;
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
        // we call the MessengerBot here..

    }

    res.sendStatus(200);
});
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
            var n1 = ty.localeCompare(t1);
            var n2 = ty.localeCompare(t2);
            var n3 = ty.localeCompare(t3);
            var n4 = ty.localeCompare(t4);
            var n5 = ty.localeCompare(t5);
            if (n1 === 0) {
                sendTextMessageType(sender, botOut);
            } else if (n2 === 0) {
                sendTextMessageIngredients(sender, botOut);
            } else if (n3 === 0) {
                sendTextMessageTiendas(sender, botOut);
            } else if (n4 === 0) {
                sendTextMessageType(sender, botOut);
            } else if (n5 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else {
                sendTextMessage(sender, "disculpa no entendi, mejor callate viejo lesviano ");
            }
        }
        console.log(botOut.botUtterance);
    }
}

function sendTextMessageType(sender, bot) {
    let buttons = '[ ';
    for (var i = 0; i < bot.buttons.product.length; i++) {
        if (i !== 0) {
            buttons += ',';
        }
        buttons += '{';
        buttons += '"type": "postback",';
        buttons += '"title": "' + bot.buttons.product[i].tipo + '",';
        buttons += ' "payload": "requestIngredientes"';
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

function sendTextMessageIngredients(sender, bot) {
    let buttons = '[ ';
    let cant=0;
    if(bot.buttons.product.length>3){
        cant=3;
    }else{
        cant=bot.buttons.product.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0) {
            buttons += ',';
        }
        buttons += '{';
        buttons += ' "type": "postback",';
        buttons += ' "title": "' + bot.buttons.product[i].ingredientes + '",';
        buttons += ' "payload": "requestTiendas"';
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
                    "text": "gracias",
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

function sendTextMessageTiendas(sender, bot) {
    let buttons = '[ ';
    let cant=0;
    if(bot.buttons.tienda.length>3){
        cant=3;
    }else{
        cant=bot.buttons.tienda.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0) {
            buttons += ',';
        }
        buttons += '{';
        buttons += ' "type":"web_url",';
        buttons += ' "title": "' + bot.buttons.tienda[i].nombre + '",';
        buttons += ' "url":"' + bot.buttons.tienda[i].url + '"';
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
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
// bot fb page
const token = "EAADiQpmWQRgBAPglvHwxHZCMaXlZBHHjADrALySMQvlwR4wl5MbnhW5ZA3JDaKqOagA6ZC32lZBoDAv0mYO3rwgJtlihDcGAnfmb3xgj5YTen2ZBPA4a3zsSot4TVB7W0xdjnrmh4ZAt4NVvmBoZAzONDTmWNh119KA1f4YQZA18towZDZD";
const msngerServerUrl = 'https://mecatobot.herokuapp.com/bot';
//global var
var ingredientes = "";
var idusuario = "";
var usuario = "";
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
        idusuario = sender;
        let recipient = event.recipient.id;
        let time = req.body.entry[0].time;
        let text = "";
        try {
            text = req.body.entry[0].messaging[i].postback.title;
            let type = req.body.entry[0].messaging[i].postback.payload;
            console.log(type);
            var compare = "add ingredient";
            var compare2 = "requestTiendas";
            var compareresult = compare.localeCompare(type);
            var compareresult2 = compare2.localeCompare(type);
            if (compareresult === 0) {
                ingredientes += "," + text;
            } else if (compareresult2 === 0) {
                console.log(ingredientes);
                request({
                    url: msngerServerUrl,
                    method: 'POST',
                    form: {
                        'userType': type,
                        'userUtterance': ingredientes
                    }
                }, function (error, response, body) {
                    //response is from the bot
                    ingredientes = "";
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
        } catch (err) {
            sendtextbot(event, sender);
        }
        if (usuario.length === 0) {
//            FB.api(
//                        "/{"+idusuario+"}/",
//                    function (response) {
//                        if (response && !response.error) {
//                           alert("usurariooooooo "+response);
//                        }
//                    }
//            );
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
            var t1 = "ofrecerTipo";
            var t2 = "ofrecerIngredientes";
            var t3 = "ofrecerTiendas";
            var t4 = "saludar";
            var t5 = "agradecer";
            var t6 = "confirmarPedido";
            var t7 = "finalizar";
            var n1 = ty.localeCompare(t1);
            var n2 = ty.localeCompare(t2);
            var n3 = ty.localeCompare(t3);
            var n4 = ty.localeCompare(t4);
            var n5 = ty.localeCompare(t5);
            var n6 = ty.localeCompare(t6);
            var n7 = ty.localeCompare(t7);
            if (n1 === 0) {
                sendTextMessageType(sender, botOut);
            } else if (n2 === 0) {
                sendTextMessageIngredients(sender, botOut);
                sendTextMessageIngredientsButtons(sender);
            } else if (n3 === 0) {
                sendTextMessageTiendas(sender, botOut);
            } else if (n4 === 0) {
                sendTextMessageType(sender, botOut);
            } else if (n5 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n6 === 0) {
                sendTextMessageConfirm(sender, botOut);
                sendButtonsConfirm(sender);
            } else if (n7 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else {
                sendTextMessage(sender, "disculpa no puedo responder a tu solicitud");
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
    let elements = '[';
    let cant = 0;
    if (bot.buttons.product.length > 10) {
        cant = 10;
    } else {
        cant = bot.buttons.product.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0) {
            elements += ',';
        }
        elements += '{';
        elements += ' "title":"' + bot.buttons.product[i].ingredientes + '",';
        //  elements += ' "image_url":"https://petersfancybrownhats.com/company_image.png",';
        //  elements += ' "subtitle":"null",';
        //  elements += ' "default_action": {';
        //  elements += ' "type": "web_url",';
        //  elements += ' "url": "https://petersfancybrownhats.com/view?item=103",';
        //  elements += ' "messenger_extensions": false,';
        //  elements += ' "webview_height_ratio": "tall"';
        //  elements += '  },';
        elements += ' "buttons":[';
        elements += ' { ';
        elements += ' "type": "postback",';
        elements += ' "title": "' +bot.buttons.product[i].ingredientes+'",';
        elements += ' "payload": "add ingredient"';
        elements += '  }  ';
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

function sendTextMessageIngredientsButtons(sender) {
    let buttons = '[ ';
    buttons += '{';
    buttons += '"type": "postback",';
    buttons += ' "title": "enviar",';
    buttons += ' "payload": "requestTiendas"';
    buttons += '}';
    buttons += ']';
    console.log(buttons);
    let b = JSON.parse(buttons);
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": " Seleccione los ingredientes, al finalizar precione el boton enviar",
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
        elements += ' "subtitle":"<ITEM_DESCRIPTION_OR_DETAILS>",';
        elements += ' "quantity": "1", ';
        elements += ' "price": 5000,';
        elements += ' "currency": "COP",';
        elements += ' "image_url":"https://goo.gl/images/JJpN9r"';
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
                    "recipient_name": "n" + usuario,
                    "order_number": bot.Pedido.tipo + " 1 en la tienda " + bot.Pedido.tienda,
                    "currency": "COP",
                    "payment_method": "Visa 2345",
                    "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                    "timestamp": "1428444852",
                    "address": {
                        "street_1": "1 Hacker Way",
                        "street_2": "",
                        "city": "Menlo Park",
                        "postal_code": "94025",
                        "state": "CA",
                        "country": "US"
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

function sendTextMessageTiendas(sender, bot) {
    let buttons = '[ ';
    let cant = 0;
    if (bot.buttons.tienda.length > 3) {
        cant = 3;
    } else {
        cant = bot.buttons.tienda.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0) {
            buttons += ',';
        }
        buttons += '{';
        buttons += ' "type":"postback",';
        buttons += ' "title": "' + bot.buttons.tienda[i].nombre + '",';
        buttons += ' "payload": "confirmar pedido"';
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
//
//
//
//
//
//function sendTextMessageIngredients(sender, bot) {
//    let buttons = '[ ';
//    let cant=0;
//    if(bot.buttons.product.length>3){
//        cant=3;
//    }else{
//        cant=bot.buttons.product.length;
//    }
//    for (var i = 0; i < cant; i++) {
//        if (i !== 0) {
//            buttons += ',';
//        }
//        buttons += '{';
//        buttons += ' "type": "postback",';
//        buttons += ' "title": "' + bot.buttons.product[i].ingredientes + '",';
//        buttons += ' "payload": "requestTiendas"';
//        buttons += '}';
//    }
//    buttons += ']';
//    console.log(buttons);
//    let b = JSON.parse(buttons);
//    if (bot !== 'null') {
//        let messageData = {
//            "attachment": {
//                "type": "template",
//                "payload": {
//                    "template_type": "button",
//                    "text": bot.botUtterance,
//                    "buttons": b
//                }
//            }
//        };
//        console.log(messageData);
//        // Start the request
//        request({
//            url: 'https://graph.facebook.com/v2.6/me/messages',
//            qs: {access_token: token},
//            method: 'POST',
//            json: {
//                recipient: {id: sender},
//                message: messageData
//
//            }
//        }, function (error, response, body) {
//            if (error) {
//                console.log('Error sending messages: ', error);
//            } else if (response.body.error) {
//                console.log('Error: ', response.body.error);
//            }
//        });
//    }
//}






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

//function sendTextMessageList(sender, bot) {
//    let elements = '[';
//    let cant = 0;
//    if (bot.elements.length > 10) {
//        cant = 10;
//    } else {
//        cant = bot.elements.length;
//    }
//    for (var i = 0; i < cant; i++) {
//        if (i !== 0) {
//            elements += ',';
//        }
//        elements += '{';
//        elements += ' "title":"' + bot.elements[i].titulo + '",';
//        var subtitulo = "";
//        try {
//            var subtitulo = bot.elements[i].titulo;
//            elements += ' "subtitle":"' + subtitulo + '",';
//        } catch (err) {
//        }
//        try {
//            var url = bot.elements.url;
//            elements += ' "image_url":"' + url + '",';
//        } catch (err) {
//        }
//        elements += ' "buttons":[';
//        for (var j = 0; j < bot.elements[i].buttons.length; j++) {
//            elements += ' { ';
//            elements += ' "type": "postback",';
//            elements += ' "title": "' + bot.elements[i].buttons[j].titulo + '",';
//            elements += ' "payload": "' + bot.elements[i].buttons[j].respuesta + '"';
//            elements += '  }  ';
//        }
//        elements += ' ]  ';
//        elements += ' }  ';
//    }
//    elements += ']';
//
//    let arrayElements = JSON.parse(elements);
//    console.log(arrayElements);
//    if (bot !== 'null') {
//        let messageData = {
//            "attachment": {
//                "type": "template",
//                "payload": {
//                    "template_type": "generic",
//                    "elements": arrayElements
//                }
//            }
//        };
//        console.log(messageData);
//        // Start the request
//        request({
//            url: 'https://graph.facebook.com/v2.6/me/messages',
//            qs: {access_token: token},
//            method: 'POST',
//            json: {
//                recipient: {id: sender},
//                message: messageData
//
//            }
//        }, function (error, response, body) {
//            if (error) {
//                console.log('Error sending messages: ', error);
//            } else if (response.body.error) {
//                console.log('Error: ', response.body.error);
//            }
//        });
//    }
//}


function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
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

function imagenes(ingredientes){
    var text='';
    var t1 = "Queso";
        var t2 = "masa";
        var t3 = "champiñones";
        var t4 = "pollo";
        var t5 = "bocadillo";
        var t6 = "piña";
        var t7 = "tomates";
        var t8 = "oregano";
        var t9 = "carne";
        var t10 = "salchichon";
        var n1 = ingredientes.localeCompare(t1);
        var n2 = ingredientes.localeCompare(t2);
        var n3 = ingredientes.localeCompare(t3);
        var n4 = ingredientes.localeCompare(t4);
        var n5 = ingredientes.localeCompare(t5);
        var n6 = ingredientes.localeCompare(t6);
        var n7 = ingredientes.localeCompare(t7);
        var n8 = ingredientes.localeCompare(t8);
        var n9 = ingredientes.localeCompare(t9);
        var n10 = ingredientes.localeCompare(t10);
        
        if (n1 === 0) {
            text += ' "image_url":"https://previews.123rf.com/images/peterhermesfurian/peterhermesfurian1611/peterhermesfurian161100063/66300148-rallado-queso-para-pizza-de-mozzarella-en-un-taz%C3%B3n-de-madera-sobre-blanco-cheddar-como-el-queso-italian.jpg",';
            text += ' "subtitle":"delicioso queso rallado",';
        }else if (n2 === 0) {
             text += ' "image_url":"https://comemelapizza.com/wp-content/uploads/2014/09/masa-b%C3%A1sica-de-pizza-5.jpg",';
             text += ' "subtitle":" masa para pizza",';
        }else if (n3 === 0) {
             text += ' "image_url":"https://www.hogarmania.com/archivos/201202/champinones-668x400x80xX.jpg",';
             text += ' "subtitle":" championes frescos ",';
        }else if (n4 === 0) {
             text += ' "image_url":"https://previews.123rf.com/images/duplass/duplass0805/duplass080500061/3054741-bowl-de-pechuga-de-pollo-desmenuzado-en-un-taz%C3%B3n-en-la-cocina-o-restaurante-.jpg",';
             text += ' "subtitle":" pollo desmenuzado",';
        }else if (n5 === 0) {
             text += ' "image_url":"https://upload.wikimedia.org/wikipedia/commons/6/60/Bocadillo.jpg",';
             text += ' "subtitle":" bocadillo dulce",';
        }else if (n6 === 0) {
             text += ' "image_url":"data:image/jpeg;base64,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",';
             text += ' "subtitle":" masa para pizza",';
        }else if (n7 === 0) {
             text += ' "image_url":"https://www.webconsultas.com/sites/default/files/styles/encabezado_articulo/public/migrated/tomate.jpg",';
             text += ' "subtitle":" masa para pizza",';
        }else if (n8 === 0) {
             text += ' "image_url":"https://comemelapizza.com/wp-content/uploads/2014/09/masa-b%C3%A1sica-de-pizza-5.jpg",';
             text += ' "subtitle":" masa para pizza",';
        }else if (n9 === 0) {
             text += ' "image_url":"https://www.chefzeecooks.com/wp-content/uploads/2018/08/Carne_Asada_web.jpg",';
             text += ' "subtitle":" carne",';
        }else if (n10 === 0) {
             text += ' "image_url":"https://comemelapizza.com/wp-content/uploads/2014/09/masa-b%C3%A1sica-de-pizza-5.jpg",';
             text += ' "subtitle":" masa para pizza",';
        }
    return text;    
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
        elements += imagenes(bot.buttons.product[i].ingredientes);
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
        elements += ' "title": "' + bot.buttons.product[i].ingredientes + '",';
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
        elements += imagenes(bot.Pedido.ingredientes[i]);
        //elements += ' "subtitle":"<ITEM_DESCRIPTION_OR_DETAILS>",';
        elements += ' "quantity": "1", ';
        elements += ' "price": 5000,';
        elements += ' "currency": "COP"';
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
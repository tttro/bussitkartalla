var config = require('./config');

// static content and routing
var express = require('express');
var app = require('express')();
var http = require('http');
var server = http.Server(app);
var _ = require('lodash');
var io = require('socket.io')(server);

var _socket;

var state = {
    error: false
};

var timerIsOn = 0;

app.use(express.static(__dirname + '/'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

app.get('/api/config', function(req, res) {
    res.send('var config = ' + JSON.stringify(config));
});
var port = process.env.PORT || 5000
server.listen(port);
console.log("http server listening on %d", port)

io.on('connection', function(socket){
    console.log('Connection opened');
    _socket = socket;
    updateData();

});



var updateData = function() {

    http.get(config.apiUrl, function(response){

        var data = '';
        response.on('data', function(chunk){
            data += chunk;
        });
        response.on('end',function(){

            var busData = _.map(JSON.parse(data).Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity, function(jorney) {
                return {
                    line: jorney.MonitoredVehicleJourney.LineRef.value,
                    location: jorney.MonitoredVehicleJourney.VehicleLocation,
                    origin: jorney.MonitoredVehicleJourney.OriginName.value,
                    destination: jorney.MonitoredVehicleJourney.DestinationName.value,
                    delay: jorney.MonitoredVehicleJourney.Delay
                };
            });
            //console.log(_socket);
            _socket.emit('bus-update', { data: busData });
        });

    }).on("error", function(e) {
        console.log("Error: ", e);
    });


    setTimeout(updateData, config.updateInterval);


}



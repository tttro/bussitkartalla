'use strict';
var data;
var markers = [];
var routeLayer = [];

$(document).ready(function (){

    var map = L.map('map', {
        // initial options for Leaflet map - currently empty
    }).setView([61.49, 23.77] , 13);



    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'examples.map-i875mjb7'

    }).addTo(map);
    var host = location.origin.replace(/^http/, 'ws')
    var socket = io.connect(host);


    var drawBusOnMap = function(result){
        for(var a=0;a<markers.length;a++) {
            map.removeLayer(markers[a]);
        }

        markers = [];

        for(var i in result.data){

            var marker = L.marker([result.data[i].location.Latitude, result.data[i].location.Longitude]).addTo(map);
            marker.bindPopup("<b>"+result.data[i].line+"</b><br>"+result.data[i].destination);
            markers.push(marker);
        }
    }
    var drawLineRoutesByLine = function(lineNum){

        var alreadyVisible = lineNum in routeLayer;

        if(alreadyVisible) {
            map.removeLayer(routeLayer[lineNum]);
            delete routeLayer[lineNum];
        }
        else {
            if (typeof allPoints[lineNum] !== 'undefined') {

                routeLayer[lineNum] = L.polyline(allPoints[lineNum]);
                routeLayer[lineNum].addTo(map);
            }
        }

    }

    var generateRouteMenu = function(){
        if (typeof routes !== 'undefined') {

            for(var i=0; i<routes.length; i++) {
                $('#routesList').append('<li routeid="'+routes[i].route_id+'"><span>'+routes[i].route_id+'</span></li>');
            }

        }
    }

    // SocketIO events
    socket.on('bus-update', function (result){

        drawBusOnMap(result);

    });



    // Click handlers
    $('#routesList').on('click', 'li', function(e){
        drawLineRoutesByLine($(this).attr('routeid'));
        $(this).toggleClass('active');
    });

    $('#side-info-panel').on('click', '#toggle-menu', function(e){
        $('#side-info-panel').toggleClass('min');
    });

    // Init
    generateRouteMenu();


});


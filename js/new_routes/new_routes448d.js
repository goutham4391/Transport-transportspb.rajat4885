NewRoutesShow = function (mapManager) {
    let self = this;
    self.center_lat = 0;
    self.center_lon = 0;
    self.zoom = 8;
    self.mapSelectorId = 'map';
    self.mapManager = mapManager;
    self.map = mapManager.map;
    self.routesPolyLines = [];
    self.defaultStrokeWidth = 4;
    self.defaultStrokeColor = "#000000";
    self.paths0Data = [];
    self.paths1Data = [];
    self.allStopsData = [];
    self.renderedStops = [];
    self.showNewRoutes = true;
    self.showChangingRoutes = true;
    self.captionsCollection = null;

    self.init = function () {
        self.paths0Data = JSON.parse($("#paths0Data").html());
        self.paths1Data = JSON.parse($("#paths1Data").html());
        self.allStopsData = JSON.parse($("#allStopsData").html());

        self.captionsCollection = new ymaps.GeoObjectCollection(null);
        self.map.geoObjects.add(self.captionsCollection);

        self.initRoutes();

        self.map.events.add('click', function (e) {
            let target = e.get('target');
            console.log($(target).hasClass('caption_layout_container'));
            console.log($(target).hasClass('square_layout'));
            self.closeAllRoutes();
        });

        $(document).on('click','.route_show_on_map_btn', function (e) {
            e.preventDefault();
            self.openRoute($(this).attr('attr-id'));
            self.scrollToMap();
        });

        $("#filterNewRoutes").keyup(function(event) {
            self.filterRoutes($(this).val());
        });

        self.initButtonsOnMap();
    }

    self.initButtonsOnMap = function () {
        let ButtonLayout1 = ymaps.templateLayoutFactory.createClass(
            "<div id='fullMapBtn' class='on_map_btn show_new_routes_btn active'><img src='/img/checkboxes/filled_20.png' alt='' />" +
            '<span>новые</span>' +
            //"{% if !state.selected %}Развернуть карту{% else %}Свернуть карту{% endif %}" +
            "</div>"
        );

        let ButtonLayout2 = ymaps.templateLayoutFactory.createClass(
            "<div id='fullMapBtn' class='on_map_btn show_changing_routes_btn active'><img src='/img/checkboxes/filled_20.png' alt='' />" +
            '<span>измененные</span>' +
            //"{% if !state.selected %}Развернуть карту{% else %}Свернуть карту{% endif %}" +
            "</div>"
        );

        let btn1 = new ymaps.control.Button({options: {layout: ButtonLayout1}});
        let btn2 = new ymaps.control.Button({options: {layout: ButtonLayout2}});
        self.map.controls.add(btn1, {float: 'none', position: {bottom: '50px', right: '65px'}});
        self.map.controls.add(btn2, {float: 'none', position: {bottom: '50px', right: '215px'}});

        $(document).on('click','.show_new_routes_btn',function () {
            self.switchShowNewRoutes();
        });

        $(document).on('click','.show_changing_routes_btn',function () {
            self.switchShowChangingRoutes();
        });
    }

    self.switchShowNewRoutes = function () {
        self.showNewRoutes = !self.showNewRoutes;

        let routesData = self.getNewRoutesData();

        if (self.showNewRoutes) {
            $('.routeRow.newRoute').show();
            $(".show_new_routes_btn").addClass('active');
            $(".show_new_routes_btn img").attr('src','/img/checkboxes/filled_20.png');
            for (let i in routesData) {
                self.map.geoObjects.add(routesData[i].polyline);
                for (let i2 in routesData[i].captions) {
                    self.map.geoObjects.add(routesData[i].captions[i2]);
                }
            }
        } else {
            $('.routeRow.newRoute').hide();
            $(".show_new_routes_btn").removeClass('active');
            $(".show_new_routes_btn img").attr('src','/img/checkboxes/empty_20.png');
            for (let i in routesData) {
                self.map.geoObjects.remove(routesData[i].polyline);
                for (let i2 in routesData[i].captions) {
                    self.map.geoObjects.remove(routesData[i].captions[i2]);
                }
            }
        }
    }

    self.switchShowChangingRoutes = function () {
        self.showChangingRoutes = !self.showChangingRoutes;

        let routesData = self.getChangingRoutesData();

        if (self.showChangingRoutes) {
            $('.routeRow.changingRoute').show();
            $(".show_changing_routes_btn").addClass('active');
            $(".show_changing_routes_btn img").attr('src','/img/checkboxes/filled_20.png');
            for (let i in routesData) {
                self.map.geoObjects.add(routesData[i].polyline);
                for (let i2 in routesData[i].captions) {
                    self.map.geoObjects.add(routesData[i].captions[i2]);
                }
            }
        } else {
            $('.routeRow.changingRoute').hide();
            $(".show_changing_routes_btn").removeClass('active');
            $(".show_changing_routes_btn img").attr('src','/img/checkboxes/empty_20.png');
            for (let i in routesData) {
                self.map.geoObjects.remove(routesData[i].polyline);
                for (let i2 in routesData[i].captions) {
                    self.map.geoObjects.remove(routesData[i].captions[i2]);
                }
            }
        }
    }

    self.initRoutes = function () {
        let paths = self.paths0Data;

        for (let pathsKey in paths) {
            let route = paths[pathsKey];
            route.hidden = false;

            let desc = route.name;
            if (route.start_from !== null) {
                desc += '<br/>Вводится с: ' + route.start_from;
            }
            desc += '</br><a href="'+route.url+'" target="_blank">Подробная информация</a>';

            let myPolyline = new ymaps.Polyline(route.path, {
                balloonContent: desc,
                hintContent: route.name,
            }, {
                balloonCloseButton: true,
                strokeColor: route.color !== undefined ? route.color : self.defaultStrokeColor,
                strokeWidth: self.defaultStrokeWidth,
                strokeOpacity: 1
            });

            self.map.geoObjects.add(myPolyline);

            myPolyline.events.add('click', function (e) {
                self.openRoute(route.id);
            });

            self.routesPolyLines.push({
                routeData: route,
                polyline: myPolyline,
                captions: self.renderRouteSmallCaptions(route)
            });
        }
    }

    self.openRoute = function (routeId) {
        let data = self.getRouteDataById(routeId);

        self.drawRoutesDefault(true);
        self.removeRenderedStops();

        $(".routeRow"+routeId).addClass('active');

        $('.caption_layout_container').css('display','none');
        data.polyline.options.set('strokeWidth',"8");
        data.polyline.options.set('strokeOpacity',"1");
        self.renderRouteStops(data.routeData);
        self.setBounds(data.polyline.geometry.getBounds());
    }

    self.setBounds = function(bounds){
        if(bounds === undefined) {
            bounds = self.map.geoObjects.getBounds();
        }
        self.map.setBounds(bounds, {
            checkZoomRange: true,
            zoomMargin: 25
        });
    };

    self.scrollToMap = function () {
        let offset = $('.map').offset().top - 100;
        offset = offset < 0 ? 0 : offset;
        $('html, body').animate({ scrollTop: offset+'px' }, 500);
    }

    self.renderRouteSmallCaptions = function (route) {

        let routeColor = route.color !== undefined ? route.color : self.defaultStrokeColor;
        let fontColor = '#000';
        let backgroundColor = '#fff';

        if (route.captionsColor === 'light') {
            fontColor = '#fff';
        }
        if (route.captionsBackgroundColor === 'inherit') {
            backgroundColor = routeColor;
        }

        let squareLayout = ymaps.templateLayoutFactory.createClass('<div class="caption_layout_container" attr-id="'+route.id+'">' +
            '<div class="square_layout" style="background-color:'+backgroundColor+';border:4px solid '+routeColor+';color:'+fontColor+';">'+route.shortName+'</div>' +
            '</div>',{
            build: function () {
                // Вызываем родительский метод build.
                squareLayout.superclass.build.call(this);

            },
        });

        let result = [];
        for (let i in route.captionsPlaces) {
            let caption = new ymaps.GeoObject({
                geometry: {
                    type: "Point",
                    coordinates: route.captionsPlaces[i],
                },
                properties: {
                    hintContent: "",
                }
            }, {
                iconLayout: squareLayout,
                interactiveZIndex: false,
                zIndex: 9000,
                zIndexActive: 9000,
                zIndexHover: 9000,
                openBalloonOnClick: false,

                iconImageSize: [39, 39], // размеры картинки
                iconImageOffset: [-6, -10], // смещение картинки
            });

            //self.map.geoObjects.add(caption);
            self.captionsCollection.add(caption);
            result.push(caption);
        }
        return result;
    }

    self.renderRouteStops = function (route) {
        for(let i in route.stopsIds) {
            let data = self.getStopDataById(route.stopsIds[i]);
            let color = route.color !== undefined ? route.color : self.defaultStrokeColor

            let stop = new ymaps.GeoObject({
                geometry: {
                    type: "Point",
                    coordinates: [data.lat,data.lon],
                },
                properties: {
                    iconContent: data.name,
                    hintContent: data.name,
                    balloonContent: data.name,
                }
            }, {
                //preset: 'islands#blackStretchyIcon',
                preset: "islands#circleDotIcon",
                iconColor: color,
            });
            self.map.geoObjects.add(stop);
            self.renderedStops.push(stop);
        }
    }

    self.getStopDataById = function (id) {
        return self.allStopsData.find(function(element) {
            return element.id == id;
        });
    }

    self.getRouteDataById = function (id) {
        return self.routesPolyLines.find(function(element) {
            return element.routeData.id == id;
        });
    }
    
    self.getNewRoutesData = function () {
        return self.routesPolyLines.filter(element => element.routeData.isChanging === false);
    }

    self.getChangingRoutesData = function () {
        return self.routesPolyLines.filter(element => element.routeData.isChanging === true);
    }

    self.drawRoutesDefault = function (lessOpacity = false) {
        let opacity = lessOpacity ? "0.4" : "1";
        for (let index in self.routesPolyLines) {
            let route = self.routesPolyLines[index].routeData;
            let color = route.color !== undefined ? route.color : self.defaultStrokeColor

            self.routesPolyLines[index].polyline.options.set('strokeOpacity',opacity);
            self.routesPolyLines[index].polyline.options.set('strokeWidth',self.defaultStrokeWidth);
            self.routesPolyLines[index].polyline.options.set('strokeColor',color);
        }
        $(".routeRow").removeClass('active');
    }

    self.removeRenderedStops = function () {
        for (let index in self.renderedStops) {
            self.map.geoObjects.remove(self.renderedStops[index]);
        }
    }
    
    self.filterRoutes = function (search) {
        console.log(search);
        for (let index in self.routesPolyLines) {
            let route = self.routesPolyLines[index].routeData;
            self.routesPolyLines[index].routeData.hidden = route.shortName.toLowerCase().indexOf(search) == -1 && route.longName.toLowerCase().indexOf(search) == -1;
        }
        self.hideHiddenRoutes();
    }

    self.hideHiddenRoutes = function () {
        for (let index in self.routesPolyLines) {
            let route = self.routesPolyLines[index].routeData;
            if(route.hidden) {
                $(".routeRow" + route.id).addClass('hidden');
            } else {
                $(".routeRow" + route.id).removeClass('hidden');
            }
        }
    }

    self.closeAllRoutes = function () {
        self.drawRoutesDefault();
        self.removeRenderedStops();
        $('.caption_layout_container').css('display','block');
    }
}
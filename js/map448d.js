MapManager = function () {
	var self = this;

	self.map = '';
	self.container = 'map';
	self.center_lat = 0;
	self.center_lon = 0;
	self.zoom = 8;
	self.imgURL = '';
	self.imgURL2 = '';
	self.lineColor = '50a4d4';
	self.iconSettings = {};
	self.stops1data = [];
	self.stops2data = [];
	self.infowindow = '';
	self.markers = [];
	self.currentDirection = 2;
	self.currentShowMode = 'common';
	self.LatLngBounds = [];
	self.points1 = [];
	self.points2 = [];
	self.path1 = '';
	self.path2 = '';
	self.cluster_icon = '';
	self.style = 'standard';

	self.vehiclesList = [];
	self.vehiclesIDsList = [];
	self.delay = 6000;
	self.frames = self.delay/1000/23;
	self.frames_left = self.frames;
	self.moveTimeout = null;

	self.getConfig = function () {
		return self.config;
	};

	self.initmap = function (callback) {
		// Создаем карту
		var config = self.config;

		config.center = {lat: self.center_lat, lng: self.center_lon};
		config.zoom= self.zoom;
		config.styles= self.GetStyles(self.style);

		self.map = new google.maps.Map(document.getElementById(self.container), config);

		self.infowindow = new google.maps.InfoWindow({
			content: 'title'
		});

		if(callback != undefined){
			callback();
		}
	};


	self.InitAllStops = function () {
		// Наносим остановки на карту
		var markers = [];
		for (var x = 0; x < self.stops1data.length; x++) {
			var hint = '<div class="map_hint d-flex justify-content-center"><img src="'+self.stops1data[x].imgURL2+'" /><a href="' + self.stops1data[x].url + '" class="soc_route_hint">' + self.stops1data[x].name + '</a>';
			hint += '<i class="arrow-link__arrow">\n' +
				'                        <svg viewBox="0 0 14 25" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" width="14px" height="25px">\n' +
				'                            <path fill-rule="evenodd" d="M13.496,13.733 L2.930,24.482 C2.258,25.166 1.168,25.166 0.496,24.482 C-0.176,23.798 -0.176,22.690 0.496,22.006 L9.846,12.495 L0.496,2.984 C-0.175,2.300 -0.175,1.192 0.496,0.508 C1.168,-0.175 2.258,-0.175 2.930,0.508 L13.497,11.257 C13.833,11.599 14.000,12.047 14.000,12.495 C14.000,12.943 13.832,13.391 13.496,13.733 Z"></path>\n' +
				'                        </svg>\n' +
				'                    </i>'+'</div>';

			var marker = self.createMarkerStepPoint(
				{'lat': Number(self.stops1data[x].lat), 'lng': Number(self.stops1data[x].lon)},
				self.stops1data[x].imgURL,
				self.stops1data[x].name,
				hint,
				'',
				null
			);

			marker.addListener('click', function (id) {
				return function () {
					console.log('click marker');
					self.showStopAtAllStops(id);
				}
			}(self.stops1data[x].id));

			self.markers[self.markers.length] = {
				marker: marker,
				data: self.stops1data[x],
				hint: hint,
				direction: 1
			};
			markers.push(marker);
			//if(x==50) break;
		}
		for(var x = 0; x < self.markers.length; x++){
			//self.markers[x].marker.setMap(self.map);
		}
		var markerCluster = new MarkerClusterer(self.map, markers,
			{imagePath: self.cluster_icon});

		$(document).on('click','.close_stop_at_AllStops',function () {
			$(".map_station_area,.map_station_area_fullMap").html('');
		});


		// Добавляем кнопку "расширить карту"
		var fullMapBtnElement = document.getElementById('fullMapBtn');
		fullMapBtnElement.index = 1;
		self.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(fullMapBtnElement);

		$(document).on('click', '#fullMapBtn', function () {
			self.SwitchFullShow(); // По клику будем менять вид карты
		});

	};

	self.showStopAtAllStops = function (id) {
		console.log('showStopAtAllStops works well id='+id);
		var stop = '';
		var dummy_row = '';
		var dummy, route, html;

		for(var i=0; i < self.stops1data.length; i++){
			if(self.stops1data[i].id === id){
				stop = self.stops1data[i];
			}
		}
		if(stop === ''){
			console.log('stop not found');
			console.log(self.stops1data);
			return null;
		}
		//console.log('stop found');

		//console.log(stop);
		// Поставим центр карты на эту точку и поставим дефолтный зум
		self.map.setCenter( {lat: Number(stop.lat), lng: Number(stop.lon) });

		if(self.map.getZoom() < 16)
			self.map.setZoom(16);



		// Получаем расписание по остановке
		var URLSITE = $("#URLSITE").html();
		var dop_url = '';
		if(lang !== 'ru') dop_url = '/'+lang;
		var url = URLSITE + dop_url + '/find/ajaxSearchStopRasp/' + id;
		console.log(url);

		$.ajax({
			url: url,
			beforeSend: function(){
				dummy = $(".dummy_stop_at_AllStops .map__stations").clone();

				dummy.find('.stop-link img').attr('src',stop.imgURL2);
				dummy.find('.stop_title').html(stop.name);
				dummy.find('.stop-link').attr('href',stop.url);

				$(".map_station_area").html(dummy);
				$(".map_station_area_fullMap").html(dummy.clone());
			},
			success: function (data) {
				var rasp = jQuery.parseJSON(data);
				var r1, r2, i;

				if(rasp == null){
					return null;
				}

				dummy =  $(".map_station_area .map__stations");
				dummy.find('.loading-text').addClass('hidden');
				dummy.find('.refresh-link').removeClass('hidden');

				if(rasp.routes !== undefined && rasp.routes.length > 0){
					for(i=0; i < rasp.routes.length; i++){
						route = rasp.routes[i];
						dummy_row = $(".dummy_stop_at_AllStops_row .table__row").clone();
						dummy_row.find('.table__item.title').html(route.type+' N<sup>o</sup> <a href="'+route.url+'">'+route.route_short_name+'</a>');

						//console.log(route);

						if(route.times_online !== undefined && route.times_online.length > 0){
							for(i2=0; i2 < route.times_online.length; i2++){
								html = '<div><time>'+route.times_online[i2]+'</time><sup>online</sup></div>\n';
								dummy_row.find(".online-time").append(html);
							}
						}else if(route.times_offline !== undefined && route.times_offline.length > 0){
							for(i2=0; i2 < route.times_offline.length; i2++){
								html = '<div><time>'+route.times_offline[i2]+'</time></div>\n';
								dummy_row.find(".offline-time").append(html);
							}
						}

						dummy.find(".routes_table_atStop").prepend(dummy_row);
					}
				} else {
					if($("#WEBSITE_ID").text() === 'sb')
						dummy.find('.rtitle').text('В данную минуту нет данных о проходящих в ближайшее время маршрутах.');
					else
						dummy.find('.rtitle').text('Данные о проходящих маршрутах отсутствуют.');
				}



				$(document)
					.off('click','.refresh-link')
					.on('click','.refresh-link',function (id) {
						return function(){
							self.showStopAtAllStops(id);
						}
					}(stop.id));



				$('.scroll-routes').niceScroll({
					cursorcolor: 'rgb(217, 217, 217)',
					cursoropacitymin: 1,
					cursorwidth: '6px',
					cursorborderradius: '3px',
					cursorborder: '0'
				});
			},
			error: function (req, str, exc) {
				dummy =  $(".map_station_area .map__stations");
				dummy.find('.loading-text').addClass('hidden');
				dummy.find('.refresh-link').removeClass('hidden');
			}
		});
	};

	self.InitSocialRoute = function () {

		self.path1 = self.DrawLine(self.points1, '', self.lineColor);
		self.path2 = self.DrawLine(self.points2, '', self.lineColor);

		// Наносим остановки на карту
		for (var x = 0; x < self.stops1data.length; x++) {
			var hint = '<div class="map_hint"><img src="'+self.imgURL2+'" /><a href="' + self.stops1data[x].url + '" class="soc_route_hint">' + self.stops1data[x].name + '</a></div>';
			var marker = self.createMarkerStepPoint(
				{'lat': Number(self.stops1data[x].lat), 'lng': Number(self.stops1data[x].lon)},
				self.imgURL,
				self.stops1data[x].name,
				hint
			);
			self.markers[self.markers.length] = {
				marker: marker,
				data: self.stops1data[x],
				hint: hint,
				direction: 1
			};
		}

		for (x = 0; x < self.stops2data.length; x++) {
			hint = '<div class="map_hint"><img src="'+self.imgURL2+'" /><a href="' + self.stops2data[x].url + '" class="soc_route_hint">' + self.stops2data[x].name + '</a></div>';
			marker = self.createMarkerStepPoint(
				{'lat': Number(self.stops2data[x].lat), 'lng': Number(self.stops2data[x].lon)},
				self.imgURL,
				self.stops2data[x].name,
				hint
			);
			self.markers[self.markers.length] = {
				marker: marker,
				data: self.stops2data[x],
				hint: hint,
				direction: 2
			};
		}


		// Вешаем обработчик для клика по строке с остановкой соц.маршрута
		$(document).on('click', '.carriers__item', function () {
			var stop_id = $(this).data('stop-id');
			var stop_direction = $(this).data('direction');

			//console.log(self.markers);

			for(var x = 0; x < self.markers.length; x++){
				if(stop_id == self.markers[x].data.id && stop_direction == self.markers[x].direction){


					// Отобразим окно с подсказкой
					self.showWindow(self.markers[x].hint, self.markers[x].marker);

					// Если остановка на направлении, которое не отображается сейчас, то нужно отобразить другое направление
					if (self.currentDirection != self.markers[x].direction){
						self.ChangeDirection();
					}

					// Поставим центр карты на эту точку и поставим дефолтный зум
					self.map.setCenter( {lat: Number(self.markers[x].data.lat), lng: Number(self.markers[x].data.lon) });
					self.map.setZoom(13);

					// Проскроллим экран до самой карты
					$('html, body').animate({ scrollTop: '0px' }, 500);

					break;
				}
			}
		});

		// Добавляем кнопку сменить направление
		var changeDirectionBtnElement = document.getElementById('changeDirectionBtn');
		changeDirectionBtnElement.index = 1;
		self.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(changeDirectionBtnElement);

		self.ChangeDirection(); // Сразу меняем направление, потому что по умолчанию отображается обратное
		$(document).on('click', '.changeDirectionBtn', function () {
			self.ChangeDirection(); // По клику будем менять
		});

		// Добавляем кнопку "расширить карту"
		var fullMapBtnElement = document.getElementById('fullMapBtn');
		fullMapBtnElement.index = 1;
		self.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(fullMapBtnElement);

		$(document).on('click', '#fullMapBtn', function () {
			self.SwitchTripleShow(); // По клику будем менять вид карты
		});

		/* $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() { 		});*/

	};




	self.createMarkerStepPoint = function (coordinates, imgURL, title, hint, label, callback) {
		if(label == undefined) label = '';
		var image = {
			url: imgURL,
			size: new google.maps.Size(self.iconSettings.size[0], self.iconSettings.size[1]),
			origin: new google.maps.Point(self.iconSettings.origin[0], self.iconSettings.origin[1]),
			anchor: new google.maps.Point(self.iconSettings.anchor[0], self.iconSettings.anchor[1])
		};

		/*var shape = {
			coords: [1, 1],
			type: 'poly'
		};*/
		var marker = new google.maps.Marker({
			map: null,
			position: {
				lat: coordinates.lat,
				lng: coordinates.lng
			},
			//position: place.geometry.location,
			icon: image,
			//shape: shape,
			title: title,
			label: label,
			zIndex: 900
		});

		if(callback !== null){
			marker.addListener('click', function () {
				if(callback === undefined)
					self.showWindow(hint, marker);
				else
					callback();
			});
		}
		return marker;
	};

	self.DrawLine = function(points, hint, color, weight) {
		var coordinates = [];
		for (var x = 0; x < points.length; x++) {
			coordinates[coordinates.length] = {
				lat: parseFloat(points[x][0]),
				lng: parseFloat(points[x][1])
			};
		}
		if(weight === undefined) weight = 2;

		//console.log(points.length);
		//console.log(coordinates);
		return new google.maps.Polyline({
			path: coordinates,
			geodesic: true,
			strokeColor: '#' + color,
			strokeOpacity: 1.0,
			strokeWeight: weight
		});
	};


	self.ChangeDirection = function() {

		console.log('ChangeDirection call');

		if (self.currentDirection == 1) {

			self.currentDirection = 2;
			self.path1.setMap(null);
			self.path2.setMap(self.map);
			$(".carriers__item.direction1").hide();
			$(".carriers__item.direction2").show();
			$(".revert_direction_title").html('Прямое направление');
		} else {

			self.currentDirection = 1;
			self.path1.setMap(self.map);
			self.path2.setMap(null);
			$(".carriers__item.direction2").hide();
			$(".carriers__item.direction1").show();
			$(".revert_direction_title").html('Обратное направление');
		}

		//	console.log(self.markers);


		for(var x = 0; x < self.markers.length; x++){
			if(self.markers[x].direction == self.currentDirection){
				self.markers[x].marker.setMap(self.map);
			}else{
				self.markers[x].marker.setMap(null);
			}
		}
	};

	// Смена режима карты между тремя вариантами- маленький, средний, и полноэкранный
	// Тут танцы с бубнами потому что нет метода в АПИ для включения полноэкранного режима
	self.SwitchTripleShow = function () {
		console.log('SwitchTripleShow');
		//console.log(self.currentShowMode);

		if(self.currentShowMode == 'common'){
			self.currentShowMode = 'full';
			if(isTabletOrSmaller()){
				// Это мобильник. Сэмулируем клик по дефолтной кнопке "Включить полноэкранный режим"
				console.log('Это мобильник. Сэмулируем клик по дефолтной кнопке "Включить полноэкранный режим"');
				self.defaultFullScreenBtnClick();
			}else{
				// Это не мобильник. Значит расширим до среднего уровня
				console.log('Это не мобильник. Значит расширим до среднего уровня');
				$(".map_medium_area").append( $("#map") );
				$(".map.map_full").addClass('active');
			}

			$(".map__showfull img").attr('src','/img/close.png');

		}else{
			self.currentShowMode = 'common';

			// Проверим, если стоит полноэкранный режим, то сэмулируем клик по кнопке
			if(self.isFullScreen()){
				console.log('стоит полноэкранный режим, то сэмулируем клик по кнопке');
				self.defaultFullScreenBtnClick();
			}

			$(".map_small_area").append( $("#map") );
			$(".map.map_full").removeClass('active');

			$(".map__showfull img").attr('src','/img/full-size.png');
		}
	};

	// Смена режима карты между тремя вариантами- маленький, средний, и полноэкранный
	// Тут танцы с бубнами потому что нет метода в АПИ для включения полноэкранного режима
	self.SwitchFullShow = function () {
		console.log('SwitchFullShow');
		//console.log(self.currentShowMode);

		if(self.currentShowMode == 'common'){
			self.currentShowMode = 'full';
			//self.defaultFullScreenBtnClick();
			$(".map__showfull img").attr('src','/img/close.png');
			$("#fullMap").css('display','block');
			$("#fullMap").append( $("#map") );

		}else{
			self.currentShowMode = 'common';
			// Проверим, если стоит полноэкранный режим, то сэмулируем клик по кнопке
			if(self.isFullScreen()){
				//console.log('стоит полноэкранный режим, то сэмулируем клик по кнопке');
				//self.defaultFullScreenBtnClick();
			}
			$(".map").append( $("#map") );
			$("#fullMap").css('display','none');
			$(".map__showfull img").attr('src','/img/full-size.png');
		}
	};

	// Возвращает true, если стоит полноэкранный режим
	self.isFullScreen = function () {
		return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
	};

	// Эмуляция клика по дефолтной кнопке "Включить полноэкранный режим"
	self.defaultFullScreenBtnClick = function () {
		$('div.gm-style button[title="Включить полноэкранный режим"]').trigger('click');
	};

	self.showWindow = function(text, marker) {
		self.infowindow.setContent(text);
		self.infowindow.open(self.map, marker);
	};

	self.SetBounds = function () {
		var bounds = new google.maps.LatLngBounds(
			self.LatLngBounds[0],
			self.LatLngBounds[1]
		);
		self.map.fitBounds(bounds);
	};

	function isTabletOrSmaller() {
		//console.log($(document).width());
		if($(document).width() < 1024)
			return true;
		else return false;
	}


	self.liveData = function () {

		//console.log(self.LatLngBounds);
		console.log('getBounds');
		console.log(self.map.getBounds());

		$.ajax({
			type: "GET",
			//url: "http://transport.orgp.spb.ru/Portal/transport/internalapi/vehicles/positions/?transports=bus,tram",
			url: "http://transport.orgp.spb.ru/Portal/transport/internalapi/vehicles/positions/?transports=bus&routeID=221",
			//data: {'bbox': '30.307088401418127,59.91846089364453,30.38831776032964,59.942028075469466'},
			data: {'bbox': '20.10,59.84,40.12,159.94'},
			dataType: "json",
			success: self.parseFeed,
			error: function () {
				// something wrong. but setInterval will set up connection automatically
				setTimeout(self.liveData, 1500);
			}
		});

		$(document).on('click','.read_full_area',function () {
			self.map.getBounds();
		});

	};

	self.parseFeed = function (json) {
		console.log(json);

		if(json.success === true){
			self.frames_left = self.frames;
			for(var x = 0; x < json.result.length; x++){
				var obj = json.result[x];
				if(obj.routeId != 1329) continue;

				if(self.vehiclesIDsList[obj.vehicleId] === undefined){
					// Такого транспорта еще нет в списке. Добавить в список
					var marker = self.createMarkerStepPoint(
						{'lat': obj.position.lat,'lng': obj.position.lon},
						'/img/icons/points_small/mezhgor_bus.png',
						'fsdfs',
						''
					);
					marker.setMap(self.map);
					obj.marker  = marker;
					obj.frame_distance = {
						lat: 0,
						lng: 0
					};

					self.vehiclesList.push(obj);
					self.vehiclesIDsList[obj.vehicleId] = self.vehiclesList.length-1;
				}else{
					// Такой транспорт в списке есть. Обновим его. Получим скорость
					var exist_obj = self.vehiclesList[ self.vehiclesIDsList[obj.vehicleId] ];
					console.log('существующий транспорт');
					console.log(exist_obj);

					// Текущая позиция, с которой начинаем движение
					var position = exist_obj.marker.getPosition();

					// Получим расстояние, которое нужно преодолеть за итерацию
					exist_obj.distance = {
						lat: obj.position.lat - position.lat(),
						lng: obj.position.lon - position.lng()
					};

					exist_obj.frame_distance = {
						lat: exist_obj.distance.lat / self.frames,
						lng: exist_obj.distance.lng / self.frames
					};

					self.vehiclesList[ self.vehiclesIDsList[obj.vehicleId] ] = exist_obj;
				}


				if(x == 150) break;
			}

			console.log(self.vehiclesList);

			if(self.moveTimeout === null){
				// Запускаем анимацию движения
				self.MoveTo()
			}

			setTimeout(self.liveData,self.delay);
		}else{
			setTimeout(self.liveData,1500);
		}

	};

	self.MoveVehicles =function () {
		console.log('MoveVehicles');



		//return null;
		for( var x = 0; x < self.vehiclesList.length; x++){

			var marker = self.vehiclesList[x].marker;

			// Задержка между кадрами будет равняться задержке между обращениями к серверу, поделенной на кол-во кадров
			var frame_delay = self.delay / self.frames;

			// Точка назначения
			var destination = {lat: 59.98536, lng: 30.41337330};

			// Текущая позиция, с которой начинаем движение
			var position = marker.getPosition();

			// Получим расстояние, которое нужно преодолеть за итерацию
			var distance = {
				lat: destination.lat - marker.getPosition().lat(),
				lng: destination.lng - marker.getPosition().lng()
			};

			// Дистанция одного фрейма. Расстояние, которое надо проезжать за один кадр
			var frame_distance = {
				lat: distance.lat / self.frames,
				lng: distance.lng / self.frames
			};

			//console.log('frame_distance');
			//console.log(frame_distance);



			console.log('BEFORE START');
			self.MoveTo(marker,frame_distance,frame_delay);

		}
	};

	self.MoveTo = function(){
		if(self.frames_left < 1){
			// Кадры закончились. сбрасываем счетчик
			self.moveTimeout = null;
			return null;
		}

		// Задержка между кадрами будет равняться задержке между обращениями к серверу, поделенной на кол-во кадров
		var frame_delay = self.delay / self.frames;


		// Теперь обходим массив существующих объектов. Если у какого-то задана frame_distance, то на эту дистанцию надо
		// подвинуть маркер
		for(var x = 0; x < self.vehiclesList.length; x++){
			var obj = self.vehiclesList[x];
			if(obj.frame_distance.lat == 0 && obj.frame_distance.lng == 0) continue;
			var position = obj.marker.getPosition();
			var new_position = {
				lat: position.lat() + obj.frame_distance.lat,
				lng: position.lng() + obj.frame_distance.lng
			};
			obj.marker.setPosition( new_position );
		}
		//console.log('self.frames_left');
		//console.log(self.frames_left);

		self.frames_left = self.frames_left-1;
		self.moveTimeout = setTimeout(
			function() { self.MoveTo() },
			frame_delay
		);
	};

	self.GetStyles = function(type) {
		var style = [
			{
				"featureType": "administrative.province",
				"elementType": "all",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "landscape",
				"elementType": "all",
				"stylers": [
					{
						"saturation": "-68"
					},
					{
						"lightness": "-32"
					},
					{
						"gamma": "6.64"
					}
				]
			},

			{
				"featureType": "poi.park",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"color": "#6ac54c"
					},
					{
						"lightness": "-3"
					},
					{
						"saturation": -40
					},
					{
						"gamma": "3.25"
					}
				]
			},
			{
				"featureType": "road.highway",
				"elementType": "geometry.stroke",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "road.local",
				"elementType": "all",
				"stylers": [
					{
						"saturation": "-31"
					},
					{
						"lightness": "33"
					},
					{
						"visibility": "on"
					},
					{
						"hue": "#ff0000"
					},
					{
						"gamma": "8.05"
					}
				]
			},
			{
				"featureType": "road.local",
				"elementType": "labels",
				"stylers": [
					{
						"color": "#333333"
					},
					{
						"saturation": "-46"
					},
					{
						"weight": "0.65"
					},
					{
						"lightness": "48"
					},
					{
						"gamma": "1.25"
					},
					{
						"visibility": "on"
					}
				]
			},
			{
				"featureType": "road.local",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"saturation": "-39"
					},
					{
						"lightness": "-29"
					},
					{
						"gamma": "1.52"
					},
					{
						"visibility": "simplified"
					},
					{
						"color": "#301616"
					}
				]
			},
			{
				"featureType": "transit",
				"elementType": "all",
				"stylers": [
					{
						"saturation": -100
					},
					{
						"visibility": "simplified"
					}
				]
			},
			{
				"featureType": "transit.line",
				"elementType": "all",
				"stylers": [
					{
						"saturation": "40"
					},
					{
						"lightness": "-16"
					}
				]
			},
			{
				"featureType": "transit.station.bus",
				"elementType": "all",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},

			{
				"featureType": "transit.station.rail",
				"elementType": "labels.text",
				"stylers": [
					{
						"color": "#1b6ab7"
					},
					{
						"saturation": "-5"
					},
					{
						"lightness": "10"
					},
					{
						"gamma": "1.44"
					},
					{
						"weight": "5.44"
					},
					{
						"invert_lightness": true
					}
				]
			},
			{
				"featureType": "water",
				"elementType": "all",
				"stylers": [
					{
						"visibility": "on"
					},
					{
						"lightness": 30
					}
				]
			}
		];
		if(type === 'standard'){
			style[style.length] = {
				"featureType": "transit.station.rail",
				"elementType": "labels",
				"stylers": [
					{
						"saturation": "27"
					},
					{
						"hue": "#0081ff"
					}
				]
			};
			style[style.length] = {
				"featureType": "poi",
				"elementType": "all",
				"stylers": [
					{
						"saturation": "-84"
					}
				]
			};
			style[style.length] = {
				"featureType": "road.highway",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"lightness": 40
					},
					{
						"visibility": "on"
					},
					{
						"color": "#fdad00"
					}
				]
			};
		}
		if(type === 'metro'){
			style[style.length] = {
				"featureType": "poi",
				"elementType": "all",
				"stylers": [
					{
						"saturation": "-84"
					},

				]
			};
			style[style.length] = {
				"featureType": "poi",
				"elementType": "labels",
				"stylers": [
					{
						"visibility": "off"
					},
				]
			};
			style[style.length] = {
				"featureType": "transit.station.rail",
				"elementType": "labels",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			};

			style[style.length] = {
				"featureType": "road.highway",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"lightness": 10
					},
					{
						"visibility": "on"
					},
					{
						"color": "#d5a20d"
					}
				]
			};


		}
		return style;
	}

	self.config = {
		center: {lat: self.center_lat, lng: self.center_lon},
		zoom: self.zoom,
		styles: self.GetStyles(self.style),
		mapTypeControl: true,
		// Делаем переключение между Карта/Спутник в виде выпадающего списка
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			//mapTypeIds: ['roadmap', 'terrain']
		},
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		streetViewControl: false,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		fullscreenControl: false,
		gestureHandling: 'greedy'
	};
}
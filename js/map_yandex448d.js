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


	self.initmap = function (callback) {
		// Создаем карту
		self.map = new ymaps.Map(
			'map',
			{
				center: [self.center_lat, self.center_lon],
				zoom: self.zoom,
				controls: []
			}
		);

		self.map.controls
			.add('zoomControl')
			.add('typeSelector');

		var ButtonLayout2 = ymaps.templateLayoutFactory.createClass(
			"<div id='fullMapBtn' class='on_map_btn map__showfull'><img src='/img/full-size.png' alt='' />" +
			//"{% if !state.selected %}Развернуть карту{% else %}Свернуть карту{% endif %}" +
			"</div>"
		);

		var fullMapButton = new ymaps.control.Button({options: {layout: ButtonLayout2}});
		self.map.controls.add(fullMapButton, {float: 'none', position: {bottom: '50px', right: '15px'}});

		fullMapButton.events
			.add('click', function (e) {
				// Ссылку на объект, вызвавший событие,
				// можно получить из поля 'target'.
				if (fullMapButton.isSelected()) {
					//console.log(pureHeightMap);
					$("#map").css('height',pureHeightMap);
					$("#map").css('width',pureWidthMap);
					$("#fullMap").css('display','none');
					$("#desktopVersionAdv").css('display','block');
					$("#smallMap").append($("#map"));
					self.map.container.fitToViewport();
					document.location.href='#mapRoute';
				}
				else {
					var h=document.documentElement.clientHeight;
					var w=document.documentElement.clientWidth;
					//h=h-60;
					//console.log($("#map").css('height'));
					pureHeightMap=$("#map").css('height');
					pureWidthMap=$("#map").css('width');
					$("#map").css('height',h+'px');
					$("#map").css('width',w+'px');

					//console.log(pureHeightMap+' tt');
					//console.log($("#map").css('height'));
					$("#fullMap").css('display','block');
					$("#desktopVersionAdv").css('display','none');
					$("#fullMap").append($("#map"));
					self.map.container.fitToViewport();
					//document.location.href='#map';
				}
			})
		;

		if(callback != undefined){
			callback();
		}
	};


	self.createMarkerStepPoint = function (coordinates, imgURL, title, hint, label) {
		if (label === undefined) label = '';

		var stops = new ymaps.GeoObjectCollection(null, {
			//preset: 'islands#circleIcon',
			//iconColor: '#ff0000',
			iconLayout: 'default#image',
			// Своё изображение иконки метки.
			iconImageHref: imgURL,
			// Размеры метки.
			iconImageSize: [self.iconSettings.size[0], self.iconSettings.size[1]],
			// Смещение левого верхнего угла иконки относительно
			// её "ножки" (точки привязки).
			iconImageOffset: [-self.iconSettings.anchor[0], -self.iconSettings.anchor[1]]
		});

		var marker = new ymaps.Placemark(
			[coordinates.lat, coordinates.lng],
			{
				balloonContent: hint,
				//balloonContent: '<div class="map_hint"><img src="'+imgURL+'" /><a href="' + stops1data[x].url + '" class="soc_route_hint">' + stops1data[x].name + '</a></div>',
				//balloonId: stops1data[x].id
			},
			{
				balloonPanelMaxMapArea: 0
			}
		);
		stops.add(marker);

		self.map.geoObjects.add(stops);

		return marker;
	};

	self.InitAllStops = function () {

		$(document).on('click','.close_stop_at_AllStops',function () {
			$(".map_station_area").html('');
		});

		objectManager = new ymaps.ObjectManager({
			// Чтобы метки начали кластеризоваться, выставляем опцию.
			clusterize: true,
			// ObjectManager принимает те же опции, что и кластеризатор.
			gridSize: 32,
			clusterDisableClickZoom: false
		});


		// Чтобы задать опции одиночным объектам и кластерам,
		// обратимся к дочерним коллекциям ObjectManager.
		objectManager.objects.options.set('preset', 'islands#greenDotIcon');
		objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
		self.map.geoObjects.add(objectManager);

		objectManager.objects.events.add('balloonopen', function (e) {
			// Получим объект, на котором открылся балун.
			var id = e.get('objectId'),
				geoObject = objectManager.objects.getById(id);

			console.log('placemark open');
			console.log(id);
			console.log(geoObject);
			console.log(geoObject.properties.balloonContent);

			//geoObject.properties.balloonContent = 'Not found';
			//objectManager.objects.balloon.setData(objectManager.objects.balloon.getData());

			self.showStopAtAllStops(id, geoObject);

			// Загрузим данные для объекта при необходимости.
			//downloadContent([geoObject], id);
		});

		/*objectManager.clusters.events.add('balloonopen', function (e) {
			// Получим id кластера, на котором открылся балун.
			var id = e.get('objectId'),
				// Получим геообъекты внутри кластера.
				cluster = objectManager.clusters.getById(id),
				geoObjects = cluster.properties.geoObjects;

			console.log('dsdas');


			// Загрузим данные для объектов при необходимости.
			downloadContent(geoObjects, id, true);
		});*/


		/*function downloadContent(geoObjects, id, isCluster) {
			console.log('downloadContent');
			console.log(geoObjects);

			geoObjects.forEach(function (geoObject) {
				console.log(geoObject.properties.balloonContent);

				geoObject.properties.balloonContent = 'Not found';
			});


			function setNewData(){
				if (isCluster && objectManager.clusters.balloon.isOpen(id)) {
					objectManager.clusters.balloon.setData(objectManager.clusters.balloon.getData());
				} else if (objectManager.objects.balloon.isOpen(id)) {
					objectManager.objects.balloon.setData(objectManager.objects.balloon.getData());
				}
			}
		}*/

		$.ajax({
			url: "/data3.json"
		}).done(function(data) {
			objectManager.add(data);
		});


	};

	self.showStopAtAllStops = function (id, stop) {

		// Получаем расписание по остановке
		var URLSITE = $("#URLSITE").html();
		var url = URLSITE + '/find/ajaxSearchStopRasp/' + id;
		console.log('showStopAtAllStops');
		console.log(url);

		$.ajax({
			url: url,
			success: function (data) {
				var rasp = jQuery.parseJSON(data);
				var r1, r2;

				//console.log(rasp);

				dummy = $(".dummy_stop_at_AllStops .map__stations").clone();

				if(rasp.array_times !== undefined && rasp.array_times.length > 0){
					for(var i=0; i < rasp.array_times.length; i++){
						r1 = rasp.array_times[i];
						for(var i2=0; i2 < r1.length; i2++){
							r2 = r1[i2];
							//console.log(r2);
							dummy_row = $(".dummy_stop_at_AllStops_row .table__row").clone();
							dummy_row.find('.table__item.title').html(r2.type+' N<sup>o</sup> <a href="'+r2.url+'">'+r2.route_short_name+'</a>');
							if(r2.time !== undefined){
								dummy_row.find('.table__item .online-time').removeClass('hidden');
								dummy_row.find('.table__item .online-time time').text(r2.time);
								dummy_row.find('.table__item .online-time time').attr('datetime',r2.time);
							}
							dummy.find(".routes_table_atStop").prepend(dummy_row);
						}
					}
				}else{
					dummy.find('.rtitle').text('В данную минуту нет данных о проходящих в ближайшее время маршрутах.');
				}

				dummy.find('.stop-link img').attr('src',stop.imgURL2);
				dummy.find('.stop_title').html(stop.name);
				dummy.find('.stop-link').attr('href',stop.url);

				$(document)
					.off('click','.refresh-link')
					.on('click','.refresh-link',function (id,stop) {
						return function(){
							self.showStopAtAllStops(id,stop);
						}
					}(id,stop));

				$(".map_station_area").html(dummy);

				stop.properties.balloonContent = dummy.html();
				objectManager.objects.balloon.setData(objectManager.objects.balloon.getData());

				$('.scroll-routes').niceScroll({
					cursorcolor: 'rgb(217, 217, 217)',
					cursoropacitymin: 1,
					cursorwidth: '6px',
					cursorborderradius: '3px',
					cursorborder: '0'
				});
			},
			error: function (req, str, exc) {
			}
		});

	};

};
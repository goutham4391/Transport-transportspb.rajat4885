SchemeManager = function(){
	var self = this;
	self.routes_lines = [];
	self.dop_lines_points = [];
	self.dop_lines = [];
	self.markers = [];
	self.routes_markers = [];

	self.stations_only = [];
	self.lines_data = '';
	self.element = '';
	self.current_scale = 1;
	self.start_scale_value = 0;
	//self.start_currentscale_value = 0;

	self.scale_speed = 0.2;
	self.mouseStartPoint = [];
	self.currentX = 0;
	self.currentY = 0;
	self.startX = 0;
	self.startY = 0;
	self.svg_selector = '#svg_map';
	self.initialZoom = 0;
	self.updateURL = true;
	self.cache = {};


	self.init = function(){
		self.element = Snap(self.svg_selector);

		// Спарсим массив данных по линиям метро
		self.lines_data = JSON.parse($(".lines_stations").html());

		// Переберем все данные по линиям
		for( x =0; x < self.lines_data.length; x++){
			for(var x2 = 0; x2 < self.lines_data[x].stations.length; x2++){
				station_obj = self.lines_data[x].stations[x2];

				// Найдем эту станцию на схеме
				station_scheme = Snap('.station[data-sid="'+station_obj.stationId+'"]');
				if(station_scheme == undefined){
					continue;
				}

				// От станции на схеме считаем инфу в какой цвет она покрашена и ее координаты фактические
				// И добавим их в общий массив данных по линиям
				self.lines_data[x].stations[x2].color = self.lines_data[x].color;
				self.lines_data[x].stations[x2].cx = parseInt(station_scheme.attr('cx'));
				self.lines_data[x].stations[x2].cy = parseInt(station_scheme.attr('cy'));
			}
		}


		self.markDisabledStations();

		if(self.initialZoom > 0){
			self.ZoomIn( self.initialZoom );
		}

		var m = $(".map")[0];
		var mc = new Hammer(m);

		mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
		mc.get('pinch').set({ enable: true });
		mc.on("pinchin pinchout panleft panright panup pandown pinchstart pinchend panstart", function(ev) {  // panleft panright panup pandown tap doubletap press pinch pinchin pinchout
			//console.log(ev.type +" gesture detected.");
			//$('.finish-point').val(ev.type +" dted "+ev.scale);


			if(ev.type == 'pinchstart'){
				self.start_scale_value = self.current_scale;
			}
			if(ev.type == 'panstart'){
				self.startX = self.currentX;
				self.startY = self.currentY;
			}

			if(ev.type == 'pinchin'){
				self.current_scale = self.start_scale_value - (1-ev.scale)*3 ;
				self.updateSelfMatrix();
			}
			if(ev.type == 'pinchout'){
				self.current_scale = self.start_scale_value + (ev.scale-1)*3 ;
				self.updateSelfMatrix();
			}

			if(
				ev.type == 'panleft' ||
				ev.type == 'panright' ||
				ev.type == 'panup' ||
				ev.type == 'pandown'
			){

				self.currentX = self.startX + ev.deltaX;
				self.currentY = self.startY + ev.deltaY;

				var maxX = $(self.svg_selector).width()*self.current_scale/2.7 - 50;
				if( Math.abs(self.currentX) > maxX ){
					if(self.currentX > 0) self.currentX = maxX; else self.currentX = -maxX;
				}

				var maxY = $(self.svg_selector).height()*self.current_scale/2.7 - 50;
				if( Math.abs(self.currentY) > maxY ){
					if(self.currentY > 0) self.currentY = maxY; else self.currentY = -maxY;
				}
				self.updateSelfMatrix(self.currentX,self.currentY);
			}

		});



		$(document).on('click',".zoom_area .plus",function(){
			self.ZoomIn();
		});
		$(document).on('click',".zoom_area .minus",function(){
			self.ZoomOut();
		});

		$('.map').bind('mousewheel', function(e){
			if(e.originalEvent.wheelDelta /120 > 0) {
				self.ZoomIn();
			}
			else{
				self.ZoomOut();
			}
			e.preventDefault();
		});


		$( ".map" ).mousedown(function(e) {
			// Drag'n'drop
			self.mouseStartPoint = [ e.clientX, e.clientY ];
			document.onmousemove = function(e) {
				var x = self.currentX + e.clientX -  self.mouseStartPoint[0];
				var y = self.currentY + e.clientY -  self.mouseStartPoint[1];

				var maxX = $(self.svg_selector).width()/2 - 50;
				if( Math.abs(x) > maxX ){
					if(x > 0) x = maxX; else x = -maxX;
				}
				var maxY = $(self.svg_selector).height()/2 - 50;
				if( Math.abs(y) > maxY ){
					if(y > 0) y = maxY; else y = -maxY;
				}
				self.updateSelfMatrix(x,y);

				$(self.svg_selector).css('cursor','grabbing');
			};
			$(document).on('mouseup','body', function(e) {
				self.currentX = self.currentX + e.clientX -  self.mouseStartPoint[0];
				self.currentY = self.currentY + e.clientY -  self.mouseStartPoint[1];

				var maxX = $(self.svg_selector).width()/2.7 - 50;
				if( Math.abs(self.currentX) > maxX ){
					if(self.currentX > 0) self.currentX = maxX; else self.currentX = -maxX;
				}
				var maxY = $(self.svg_selector).height()/2.7 - 50;
				if( Math.abs(self.currentY) > maxY ){
					if(self.currentY > 0) self.currentY = maxY; else self.currentY = -maxY;
				}

				if(
					e.target.id =='svg_map' &&
					$(".start-point").val() != '' &&
					$(".finish-point").val() != '' &&
					( Math.abs(e.clientX - self.mouseStartPoint[0]) < 3 || Math.abs(e.clientY - self.mouseStartPoint[1]) < 3 )
				){
					//self.clearField();
				}
				document.onmousemove = null;
				$(document).off('mouseup','body');
				$(self.svg_selector).css('cursor','grab');
			});
		});




		$(document).on('click','.map',function(e){
			if($(this).hasClass('stationlabel')) return false;
		});

		// Клик по маршруту в блоке результатов
		$(document).on('click','.metro-route',function(){
			// Отображаем выбранный роут
			self.ShowRoute( $(this).data('routeid') );
		});

		// Выделим всё при фокусе на инпут
		$( ".scheme-input" ).focus(function() {
			$(this).select();
		});


		// Для каждого поля ввода станции делаем подсказки, после клика на подсказку вызываем поиск схемы
		$('.scheme-input').each(function (index) {
			var input = $(this);
			input.autocomplete({
				source: function (request, response) {
					var URLSITE = $("#URLSITE").html();
					var val = encodeURIComponent(input.val());
					var url,dop_url;

					var lang = $("#LANGUAGE").text();
					if(lang !== 'ru') dop_url = '/'+lang;

					url = URLSITE + dop_url +  '/site/ajaxSearchTipsMetroStations/text/' + val;


					if ( val in self.cache ) {
						response( self.cache[ val ] );
						return;
					}

					$.ajax({
						url: url,
						success: function (data) {
							data = jQuery.parseJSON(data);
							self.cache[ val ] = data;
							response(data);
						},
						error: function (req, str, exc) {
							// Messenger.show(str);
						}
					});
				},
				select: function( event, ui ) {
					// Выключаем поле и делаем поиск схемы
					input.val(ui.item.value).attr('disabled','disabled');
					self.findMetroScheme();
					return false;
				},
				minLength: 1
			});
		});

		$(document)
		// По клику на переключатель меняем значения полей местами
			.on('click','.scheme-separator',function (e) {
				var val1, val2;
				val1 = $(".scheme-input[name=start-point]").val();
				val2 = $(".scheme-input[name=finish-point]").val();
				$(".scheme-input[name=start-point]").val(val2);
				$(".scheme-input[name=finish-point]").val(val1);

				e.preventDefault();
				self.findMetroScheme();
			})

			// По клику на название станции или маркер станции
			.on('click','.stationlabel,.station',function(e){
				if($(this).hasClass('inactive')) return false;
				var station_id = parseInt( $(this).attr('data-sid') );
				self.ClickStation(station_id);
			})


			//По клику на крестик для очищения формы
			.on('click','.metroscheme_form .form__row .form__icon_right.pointer',function () {
				//console.log();
				self.clearField("."+$(this).data('field'));
			})
		;

		$(".station,.stationlabel").hover(function(e){
			var station_id = parseInt( $(this).attr('data-sid') );
			$('.stationlabel[data-sid="'+station_id+'"]').addClass('active');
			$('.station[data-sid="'+station_id+'"]').addClass('active');
		},function (e) {
			var station_id = parseInt( $(this).attr('data-sid') );
			var start_id = $(".start-point").attr('data-stationid');
			var finish_id = $(".finish-point").attr('data-stationid');

			if(start_id != station_id && finish_id != station_id){
				$('.stationlabel[data-sid="'+station_id+'"]').removeClass('active');
				$('.station[data-sid="'+station_id+'"]').removeClass('active');
			}
		});

		//self.TranslateScheme();

		// Запускаем поиск, если в инпутах уже что-то введено
		self.findMetroScheme();
	};

	self.ClickStation = function(station_id){

		var station_obj = self.findStationByID(station_id);

		if($(".start-point").val() != '' && $(".finish-point").val() != ''){
			self.clearField(".start-point");
			self.clearField(".finish-point");
		}else if( $(".start-point").val() == '' ){
			$(".start-point").val(station_obj.stationName).attr('disabled','disabled').attr('data-stationid',station_id);
			$('.stationlabel[data-sid="'+station_id+'"]').addClass('active');
			$('.station[data-sid="'+station_id+'"]').addClass('active');
			self.findMetroScheme();
		}else{
			$(".finish-point").val(station_obj.stationName).attr('disabled','disabled').attr('data-stationid',station_id);
			$('.stationlabel[data-sid="'+station_id+'"]').addClass('active');
			$('.station[data-sid="'+station_id+'"]').addClass('active');
			self.findMetroScheme();
		}
	};

	self.ZoomIn = function(value){
		if(value === undefined) value = self.scale_speed;
		//alert(value);

		self.current_scale = self.current_scale + value;
		if(self.current_scale > 2) self.current_scale = self.current_scale + value;

		self.updateSelfMatrix();
	};

	self.ZoomOut = function(value){
		if(value === undefined) value = self.scale_speed;

		self.current_scale = self.current_scale - value;
		self.updateSelfMatrix();
	};

	self.Zoom = function (value) {
		self.current_scale = value;
		self.updateSelfMatrix();
	};

	self.updateSelfMatrix = function(x,y){
		if(x === undefined) x = self.currentX;
		if(y === undefined) y = self.currentY;


		if(self.current_scale > 5.5) self.current_scale = 5.5;
		if(self.current_scale < 0.45) self.current_scale = 0.45;

		//console.log(self.current_scale);
		self.setCSS_TransformBySelector(self.svg_selector, 'matrix('+self.current_scale+',0,0,'+self.current_scale+','+x+','+y+')');
		//self.element.transform('matrix('+self.current_scale+',0,0,'+self.current_scale+','+x+','+y+')');
		//self.updateMatrix(self.current_scale,0,0,self.current_scale,self.currentX,self.currentY);
	};

	self.setCSS_TransformBySelector = function (selector, value) {
		//alert(value);
		$(selector)
			.css('transform',value)
			.css('-webkit-transform',value)
			.css('-moz-transform',value)
			.css('-ms-transform',value)
			.css('-o-transform',value)
		;
	};

	// Очищаем значение поля поиска, сбрасываем результаты поиска
	self.clearField = function(selector){
		$(".metro_scheme_results").html('');
		$(selector).val('').attr('disabled',null).attr('data-stationid','');
		$(".stationlabel").removeClass('active');
		$(".station").removeClass('active');
		self.RemoveAddedLinesAndMarkers();
		self.ShowParentsLinesAndMarkers();
	};

	self.findMetroScheme = function () {
		var station1, station2,dop_url;
		dop_url = '';


		if( $(".start-point").val() == '' || $(".finish-point").val() == '' ) return null;

		$(".start-point").attr('disabled','disabled');
		$(".finish-point").attr('disabled','disabled');

		station1 = self.findStation($(".start-point").val());
		station2 = self.findStation($(".finish-point").val());

		if(station1 === undefined){
			Messenger.show('К сожалению, станция отправки не найдена в базе данных. Проверьте написание');
			return false;
		}
		if(station2 === undefined){
			Messenger.show('К сожалению, станция прибытия не найдена в базе данных. Проверьте написание');
			return false;
		}

		var URLSITE = $("#URLSITE").html();
		var lang = $("#LANGUAGE").text();
		if(lang !== 'ru') dop_url = '/'+lang;

		url = URLSITE + dop_url + '/site/ajaxSearchMetroScheme/from/' + station1.stationId + '/to/' + station2.stationId;

		/*console.log('DOPURL STATUS');
		console.log(URLSITE);
		console.log(lang);*/

		if(self.updateURL === true){
			// Изменим тайтл и h1 страницы, доп.текст
			//var p_url = "/rezhim-raboty-metro/scheme?from="+station1.stationId+"&to="+station2.stationId;
			var title = $(".default_title").val();
			title = title.replace("***station1_name***", station1.stationName);
			title = title.replace("***station1_name2***", station1.stationName2);
			title = title.replace("***station2_name***", station2.stationName);
			title = title.replace("***station2_name2***", station2.stationName2);
			$("title").text(title);

			var h1  = $(".default_h1").val();
			h1 = h1.replace("***station1_name***", station1.stationName);
			h1 = h1.replace("***station1_name2***", station1.stationName2);
			h1 = h1.replace("***station2_name***", station2.stationName);
			h1 = h1.replace("***station2_name2***", station2.stationName2);
			$("h1").text(h1);

			var default_text  = $(".default_text").text();
			default_text = default_text.replace("***station1_name***", station1.stationName);
			default_text = default_text.replace("***station1_name2***", station1.stationName2);
			default_text = default_text.replace("***station2_name***", station2.stationName);
			default_text = default_text.replace("***station2_name2***", station2.stationName2);
			$(".additional_text_place").html(default_text);

			// Добавим в историю просмотров в браузере без обновления страницы
			window.history.replaceState({"pageTitle":title}, "", dop_url + "/rezhim-raboty-metro/scheme?from="+station1.stationId+"&to="+station2.stationId);
		}


		$.ajax({
			url: url,
			success: function (data) {
				data = jQuery.parseJSON(data);
				//console.log(data);
				if(data.routes_list === undefined){
					Messenger.show('К сожалению, результатов не найдено');
					return false;
				}

				var dummy_route, dummy_station, station_id, dummy_poezd, boarding,
					boarding_number, time, peresadki_text, station_obj, lastLineID, skip_boarding;

				$(".metro_scheme_results").html('');

				self.stations_only = [];

				// Перебираем лист роутов в ответе АПИ
				for(var x=0; x < data.routes_list.length; x++){

					// Склонируем хтмл код пустого роута
					dummy_route = $('.dummy_route .metro-route').clone();

					dummy_route.attr('data-routeid',x);

					self.stations_only[x] = [];

					// Время в пути и текст о пересадках
					time = data.routes_list[x].time;
					peresadki_text = data.routes_list[x].desc;
					dummy_route.find('.wrapper__title span').text(time);
					dummy_route.find('.peresadki_count').text(peresadki_text);

					lastLineID = -100;
					boarding_number = 0;
					// Начинаем перебирать станции роута
					for(var x2=0; x2 < data.routes[x].stations.length; x2++){
						station_id = data.routes[x].stations[x2];

						// Добавим айди станции в список станций этого роута
						self.stations_only[x][self.stations_only[x].length] = station_id;

						// Найдем объект станции по его айди
						station_obj = self.findStationByID(station_id);

						// Склонируем хтмл код пустой станции
						dummy_station = $('.dummy_station .metro_step').clone();
						dummy_station.find('span').text(station_obj.stationName);
						dummy_station.find('.scheme_metro_station_img').attr('src',station_obj.icon);
						dummy_route.find('.route_scheme__content').append(dummy_station);

						// Если станция первая в списке по роуту, то нужно проверить, добавлять ли ей посадку
						skip_boarding = false;
						if(x2==0){
							if(data.routes[x].stations[x2+1] != undefined){
								var next_station_id = data.routes[x].stations[x2+1];
								var next_station_obj = self.findStationByID(next_station_id);

								if(station_obj.lid != next_station_obj.lid) skip_boarding = true;
							}
						}

						// Добавляем посадку
						if( parseInt(station_obj.lid) !== parseInt(lastLineID) && skip_boarding == false ){

							dummy_poezd = $('.dummy_poezd .poezd').clone();

							boarding = data.routes[x].boarding[boarding_number];
							if(boarding !== undefined){
								for(var j in boarding){
									dummy_poezd.find('.v'+boarding[j]).addClass('active');
								}
								//console.log(boarding);
								dummy_route.find('.route_scheme__content').append(dummy_poezd);
							}

							if(lastLineID !== -100)
								dummy_station.prepend('<div class="peresadka_metro_area"></div>');

							lastLineID = station_obj.lid;
							boarding_number++;
						}else if( parseInt(station_obj.lid) !== parseInt(lastLineID)){
							lastLineID = station_obj.lid;
						}
					}

					$(".metro_scheme_results").append(dummy_route);

					/*$('.scroll-content').niceScroll({
						cursorcolor: 'rgb(217, 217, 217)',
						cursoropacitymin: 1,
						cursorwidth: '6px',
						cursorborderradius: '3px',
						cursorborder: '0'
					});*/


				};

				// Собрали все данные, рисуем первый роут
				self.ShowRoute(0);

			},
			error: function (req, str, exc) {
				// Messenger.show(str);
			}
		});
	};

	self.ShowRoute = function(id){
		$('.metro-route').removeClass('active');
		$('.metro-route[data-routeid="'+id+'"]').addClass('active');

		$('.stationlabel[data-sid="'+self.stations_only[id][0]+'"]').addClass('active');
		$('.stationlabel[data-sid="'+self.stations_only[id][self.stations_only[id].length-1]+'"]').addClass('active');
		$('.station[data-sid="'+self.stations_only[id][0]+'"]').addClass('active');
		$('.station[data-sid="'+self.stations_only[id][self.stations_only[id].length-1]+'"]').addClass('active');


		self.HideLinesAndMarkers();
		self.DrawLines(self.stations_only[id]);
		self.DrawMarkers(self.stations_only[id]);
		self.DrawDopLines();
		//self.showAllStationIDs();

		//console.log('after creation');
		//console.log(self.dop_lines);

		//$(".metro_scheme_results").getNiceScroll().resize();

		var offset = $('.metro_scheme_results').offset().top - 15;
		$('html, body').animate({ scrollTop: offset+'px' }, 500);
	};



	self.DrawLines = function(stations_array){
		//console.log('DrawLines');
		//console.log(stations_array);
		var station_obj,next_station_obj,base_edge;
		var last_lid = -1;
		var lines_points = [];

		// Перебираем станции роута
		for(var x = 0; x < stations_array.length; x++){
			station_obj = self.findStationByID(stations_array[x]);
			if(last_lid != station_obj.lid){
				lines_points.push([]);
			}
			lines_points[lines_points.length-1][lines_points[lines_points.length-1].length] = station_obj;
			last_lid = station_obj.lid;
		}

		//console.log('lines_points');
		//console.log(lines_points);

		for(x = 0; x < lines_points.length; x++){

			var one_line_points=[];
			for(var x2 = 0; x2 < lines_points[x].length; x2++){
				station_obj = lines_points[x][x2];
				//console.log(station_obj);

				dop_edge = [];
				dop_edge2 = [];

				one_line_points.push( parseFloat(station_obj.cx), parseFloat(station_obj.cy));
				if(lines_points[x][x2+1] != undefined){
					next_station_obj = lines_points[x][x2+1];
					if(station_obj.stationId < next_station_obj.stationId){
						base_edge = "#stationedge-"+station_obj.stationId+"-"+next_station_obj.stationId;
					}else{
						base_edge = "#stationedge-"+next_station_obj.stationId+"-"+station_obj.stationId;
					}
					if( $(base_edge+'-1').attr("cx") != undefined){
						//var dop_points  one_line_points.push($(base_edge+'-1').attr("cx"),$(base_edge+'-1').attr("cy"));
						var dop_edge = [ $(base_edge+'-1').attr("cx"), $(base_edge+'-1').attr("cy") ];
					}
					if( $(base_edge+'-2').attr("cx") != undefined){
						var dop_edge2 = [$(base_edge+'-2').attr("cx"), $(base_edge+'-2').attr("cy") ];
					}

					if(dop_edge.length > 0 && dop_edge2.length > 0){
						dop_edge[0] = parseFloat(dop_edge[0]);
						dop_edge[1] = parseFloat(dop_edge[1]);
						dop_edge2[0] = parseFloat(dop_edge2[0]);
						dop_edge2[1] = parseFloat(dop_edge2[1]);

						if(station_obj.stationId < next_station_obj.stationId){
							one_line_points.push( dop_edge[0], dop_edge[1] );
							one_line_points.push( dop_edge2[0], dop_edge2[1] );
						}else{
							one_line_points.push( dop_edge2[0], dop_edge2[1] );
							one_line_points.push( dop_edge[0], dop_edge[1] );
						}
					}else if(dop_edge.length > 0){
						dop_edge[0] = parseFloat(dop_edge[0]);
						dop_edge[1] = parseFloat(dop_edge[1]);

						one_line_points.push( dop_edge[0], dop_edge[1] );
					}

				}
			}
			var p1 = self.element.polyline(one_line_points);


			p1.attr({
				fill: "none",
				stroke: '#'+lines_points[x][0].color,
				strokeWidth: 5
			});
			self.routes_lines[self.routes_lines.length] = p1;

			// Если есть следующая линия, нарисуем к ней перемычку
			if(lines_points[x+1] != undefined){
				var dop_points = [
					lines_points[x][lines_points[x].length-1].cx,
					lines_points[x][lines_points[x].length-1].cy,
					lines_points[x+1][0].cx,
					lines_points[x+1][0].cy,
				];
				p1 = self.element.polyline(dop_points);
				p1.attr({
					fill: "none",
					stroke: '#'+lines_points[x][0].color,
					strokeWidth: 5
				});
				self.routes_lines[self.routes_lines.length] = p1;

				self.dop_lines_points.push(dop_points);
			}
		}
	};

	self.DrawDopLines = function(){
		//console.log('перед добавлением зеленых');
		//console.log(self.dop_lines);

		for(var x = 0; x < self.dop_lines_points.length; x++){
			var dop_points = self.dop_lines_points[x];
			var p_white = self.element.polyline(dop_points);
			p_white.attr({
				fill: "none",
				stroke: '#FFF',
				strokeWidth: 2,
			});
			//p1.addClass('dopline');

			self.dop_lines[self.dop_lines.length] = p_white;
		}

		//console.log('после добавления зеленых');
		//console.log(self.dop_lines);

	};

	self.DrawMarkers = function(stations_array){
		for(var x = 0; x < stations_array.length; x++){
			var strokeWidth = 2;
			if(x == 0 || x == stations_array.length-1) strokeWidth = 4;

			station_obj = self.findStationByID(stations_array[x]);
			var p1 = self.element.circle(
				station_obj.cx, station_obj.cy ,4
			);
			p1.attr({
				fill: "#fff",
				stroke: '#'+station_obj.color,
				strokeWidth: strokeWidth
			});
			self.markers[self.markers.length] = p1;

			//console.log(station_obj.stationId);
			$("#stationlabel"+station_obj.stationId).css('opacity','1');
		}
	};

	// Отладочная функция. Отображает ID всех станций прямо поверх самой схемы
	self.showAllStationIDs = function(){
		var station;
		for( x =0; x < self.lines_data.length; x++){
			for(var x2 = 0; x2 < self.lines_data[x].stations.length; x2++){
				station_obj = self.lines_data[x].stations[x2];
				if(station_obj.cx != undefined){
					var t1 = self.element.text(station_obj.cx + 6, station_obj.cy + 3,station_obj.stationId);
					t1.attr({'font-size':16,'color':'#f00','stroke':'#000','fill':'#fff'});
				}
			}
		}
	};


	self.ShowParentsLinesAndMarkers = function(){
		Snap('#line0').attr('opacity','1');
		Snap('#line1').attr('opacity','1');
		Snap('#line2').attr('opacity','1');
		Snap('#line3').attr('opacity','1');
		Snap('#line4').attr('opacity','1');
		$('.station:not(.stationback)').css('opacity','1');
		$('.stationlabel').css('opacity','1');
	};

	self.HideLinesAndMarkers = function(){
		console.log('HideLinesAndMarkers');
		Snap('#line0').attr('opacity','0.2');
		Snap('#line1').attr('opacity','0.2');
		Snap('#line2').attr('opacity','0.2');
		Snap('#line3').attr('opacity','0.2');
		Snap('#line4').attr('opacity','0.2');
		$('.station:not(.stationback)').css('opacity','0.2');
		$('.stationlabel').css('opacity','0.2');
		self.RemoveAddedLinesAndMarkers();
	};

	self.RemoveAddedLinesAndMarkers = function(){
		//console.log('RemoveAddedLinesAndMarkers');

		//console.log('before cleaning');
		//console.log(self.routes_lines[0]);
		//console.log(self.dop_lines[0]);

		for(j in self.routes_lines){
			self.routes_lines[j].remove();
			//self.routes_lines.splice(j,1);
		}
		for(j in self.dop_lines){
			self.dop_lines[j].remove();
			//self.routes_lines.splice(j,1);
		}
		for(j in self.markers){
			self.markers[j].remove();
		}

		//console.log('dopline cleaning');
		//$('.dopline').remove();
		//console.log('aafter cleaning');
		//console.log(self.routes_lines);
	};

	// Ищет станцию из массива json на странице
	self.findStation = function(name){
		var station;
		for( x =0; x < self.lines_data.length; x++){
			for(var x2 = 0; x2 < self.lines_data[x].stations.length; x2++){
				station = self.lines_data[x].stations[x2];
				if(station.stationName === name) return station;
			}
		}
	};

	self.findStationByID = function (id) {
		var station;
		//console.log(self.lines_data);
		for( x =0; x < self.lines_data.length; x++){
			for(var x2 = 0; x2 < self.lines_data[x].stations.length; x2++){
				station = self.lines_data[x].stations[x2];

				station.icon =  self.lines_data[x].icon2;
				station.lid =  parseInt(self.lines_data[x].lineID);
				//console.log(station);
				//console.log(self.lines_data[x].lineID);
				if( station.stationId == id) return station;
			}
		}
	};

	self.markDisabledStations = function(){

		for( x =0; x < self.lines_data.length; x++){
			for(var x2 = 0; x2 < self.lines_data[x].stations.length; x2++){
				var station = self.lines_data[x].stations[x2];
				if(station.status == 1){
					$('.stationlabel[data-sid="'+station.stationId+'"]').addClass('inactive').attr({'fill':'#c5c5c5'});
					$('.station[data-sid="'+station.stationId+'"]').addClass('inactive');

					var bbox = Snap('.stationlabel[data-sid="'+station.stationId+'"]').getBBox();
					self.element.image("/img/icons/station_inactive.svg", bbox.x2+5, bbox.y+3, 10, 9);

				}
			}
		}

	};


	self.TranslateScheme = function () {
		var station;
		var lang = $("#LANGUAGE").text();
		if(lang === 'ru') return null;

		for( x =0; x < self.lines_data.length; x++) {
			for (var x2 = 0; x2 < self.lines_data[x].stations.length; x2++) {
				station = self.lines_data[x].stations[x2];
				$(".stationlabel[data-sid='"+station.stationId+"']").text(station.stationName);
			}
		}

	}

}
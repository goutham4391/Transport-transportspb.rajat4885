function Auth() {
	var self = this;

	self.init = function () {

		if ($('#show_login_from').length > 0)
			self.showLoginForm();
		if ($('#show_register_from').length > 0)
			self.showRegisterForm();

		// Клик по ссылке регистрация/войти
		$(document).on('click', '.sign__item', function () {
			console.log(".sign__item");
			if ($(this).hasClass('registration__item'))
				self.showRegisterForm();
			else
				self.showLoginForm();
		});


		// Клик по аватарке или имени юзера
		$(document).on('click', '.user', function () {
			console.log('.user click');
			$('.user-popup').addClass('open');
			$('.site').addClass('sign-in-open');
		});

		// Скрываем окошко авторизации по клику на любую область сайта, кроме самой авторизации
		$(document).on('click', '.sign-in-open', function (e) {
			console.log('.sign-in-open click');
			if ($(e.target).parents('.sign').length == 0) {
				self.closeForm();
			}
		});

		$(document).on('click', '.close_sign_form_btn', function (e) {
			e.preventDefault();
			self.closeForm();
		});

	};

	self.showRegisterForm = function () {
		self.initUlogin();
		$('.sign').addClass('open');
		$('.site').addClass('sign-in-open');
		$(".registration_tab_btn").click();
	}

	self.showLoginForm = function () {
		self.initUlogin();
		$('.sign').addClass('open');
		$('.site').addClass('sign-in-open');
		$(".login_tab_btn").click();
	}

	self.closeForm = function () {
		$('.sign').removeClass('open');
		$('.user-popup').removeClass('open');
		$('.site').removeClass('sign-in-open');
	}

	self.initUlogin = function () {
		if( $("#ulogin_js").length < 1 ){
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "https://ulogin.ru/js/ulogin.js";
			s.id = "ulogin_js";
			$("#ulogin_place").append(s);
		}
	}

	self.init();
}

function socialAuth(token) {
	$.ajax({
		type: "POST",
		url: "",
		data: {
			"token": token,
		},
		dataType: "TEXT",
		success: function (msg) {

			if (parseInt(msg) == 1) {
				document.location.reload();
			} else {
				Messenger.show('Не удалось войти');
			}
		},
		error: function (msg) {
			console.log(msg);
			Messenger.show('Не удалось войти');
		}
	});
}

FavManager = {

	init: function () {
		FavManager.checkFav();
		$(document).on('click', '.FavButtonNew.addToFav_E', function () {
			FavManager.addToFav();
		});
		$(document).on('click', '.FavButtonNew.delFromFav_E', function () {
			FavManager.delFromFav();
		});
	},

	addToFav: function () {
		var type = $(".addTOFAVNEW#type").val();
		var id_item = $(".addTOFAVNEW#id_item").val();
		var subType = $(".addTOFAVNEW#subType").val();
		var from = $(".addTOFAVNEW#from").val();
		var to = $(".addTOFAVNEW#to").val();
		var date = $(".addTOFAVNEW#date").val();
		var title = $(".addTOFAVNEW#title").val();
		var url = $(".addTOFAVNEW#url").val();
		$.ajax({
			type: "POST",
			url: "/lk/addObjToFav",
			data: {
				//"h1" : h1
				"type": type,
				"id_item": id_item,
				"subType": subType,
				"from": from,
				"to": to,
				"date": date,
				"title": title,
				"url": url,
			},
			dataType: "TEXT",
			error: function (msg) {
				console.log('error');
				console.log(msg);
			},
			success: function (msg) {
				if (msg == 1) {
					$(".FavButtonNew").removeClass('addToFav_E').addClass('delFromFav_E');
					FavManager.showFilledStar();
					Messenger.show('Добавлено в избранное');
				}
			}
		});
	},
	delFromFav: function () {
		console.log('delFromFav');

		var type = $(".addTOFAVNEW#type").val();
		var id_item = $(".addTOFAVNEW#id_item").val();
		var subType = $(".addTOFAVNEW#subType").val();
		var from = $(".addTOFAVNEW#from").val();
		var to = $(".addTOFAVNEW#to").val();
		var date = $(".addTOFAVNEW#date").val();
		var title = $(".addTOFAVNEW#title").val();
		var subTitle = $(".addTOFAVNEW#subTitle").val();
		var url = $(".addTOFAVNEW#url").val();

		$.ajax({
			type: "POST",
			url: "/lk/delObjFromFav",
			data: {
				//"h1" : h1
				"type": type,
				"id_item": id_item,
				"subType": subType,
				"from": from,
				"to": to,
				"date": date,
				"title": title,
				"subTitle": subTitle,
				"url": url,
			},
			dataType: "TEXT",
			error: function (msg) {
				Messenger.show('Не удалось удалить из избранного');
			},
			success: function (msg) {
				console.log('success');
				console.log(msg);
				if (msg == 1) {
					$(".FavButtonNew").removeClass('delFromFav_E').addClass('addToFav_E');
					FavManager.showEmptyStar();
					Messenger.show('Удалено из избранного');
				}
			}
		});
	},

	checkFav: function () {
		if ($('.FavButtonNew').length && !$(".FavButtonNew").hasClass('SkipCheckFav')) {
			var data = {
				"type": $(".addTOFAVNEW#type").val(),
				"id_item": $(".addTOFAVNEW#id_item").val(),
				"subType": $(".addTOFAVNEW#subType").val(),
				"from": $(".addTOFAVNEW#from").val(),
				"to": $(".addTOFAVNEW#to").val(),
				"date": $(".addTOFAVNEW#date").val(),
				"title": $(".addTOFAVNEW#title").val(),
				"url": $(".addTOFAVNEW#url").val()
			};
			console.log('checkFav');
			console.log(data);

			$.ajax({
				type: "POST",
				url: "/lk/checkFav",
				data: data,
				dataType: "TEXT",
				error: function (msg) {
					console.log('error');
				},
				success: function (msg) {
					console.log('success');
					console.log(msg);
					if (msg == 1) {
						$(".FavButtonNew").removeClass('addToFav_E').addClass('delFromFav_E');
						FavManager.showFilledStar();
					}
					$(".FavButtonNew").show();
				}
			});
		} else {
			//console.log('there are no fav btn');
		}
	},


	showFilledStar: function () {
		html = '<svg viewBox="0 0 22 22" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" width="22px" height="22px">\n' +
			'            <path fill-rule="evenodd"  fill="rgb(254, 204, 53)" d="M11.590,0.352 L14.370,6.981 L21.486,7.598 C21.980,7.640 22.181,8.261 21.806,8.588 L16.408,13.300 L18.026,20.311 C18.138,20.798 17.614,21.181 17.190,20.923 L11.074,17.206 L4.959,20.923 C4.534,21.180 4.011,20.797 4.123,20.311 L5.741,13.300 L0.342,8.586 C-0.033,8.260 0.167,7.639 0.662,7.596 L7.778,6.980 L10.557,0.352 C10.750,-0.110 11.398,-0.110 11.590,0.352 Z"/>\n' +
			'        </svg>';
		$(".FavButtonNew").html(html);
	},
	showEmptyStar: function () {
		html = '<svg viewBox="0 0 22 22" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">\n' +
			'            <path fill-rule="evenodd" d="M11.590,0.352 L14.370,6.981 L21.486,7.598 C21.980,7.640 22.181,8.261 21.806,8.588 L16.408,13.300 L18.026,20.311 C18.138,20.798 17.614,21.181 17.190,20.923 L11.074,17.206 L4.959,20.923 C4.534,21.180 4.011,20.797 4.123,20.311 L5.741,13.300 L0.342,8.586 C-0.033,8.260 0.167,7.639 0.662,7.596 L7.778,6.980 L10.557,0.352 C10.750,-0.110 11.398,-0.110 11.590,0.352 Z"></path>\n' +
			'        </svg>';
		$(".FavButtonNew").html(html);
	},
};

PodorozhnikCardsManager = function(){
	var self = this;
	self.currentRenameID = 0;
	self.currentDeleteID = 0;

	self.init = function () {
		$(document).on('click','.podorozhnik_card',function (e) {
			e.preventDefault();
			$('.podorozhnik_card_number').val($(this).find('.number').text());
			self.checkFav();
		});

        $(document).on('click',".podorozhnik_card_use",function (e) {
            e.preventDefault();
            $('.podorozhnik_card_number').val( $(this).data('card_number') );
            self.checkFav();
        });

		$(document).on('click',".podorozhnik_card_rename",function (e) {
			e.preventDefault();
			var old_title = $(this).parents('.podorozhnik_card_at_panel').find('.podorozhnik_card .title').text();
			self.showRenameDialog( $(this).data('card_id'), old_title );
		});

		$('.podorozhnik_card_number').mask("9999 9999 9999 9999 999?9 9999 99",{autoclear: false});

		$(".podorozhnik_card_number").keyup(function () {
			self.checkFav();
		});

		$(document).on('click',".podorozhnik_add2fav",function(){
			self.SwitchFav();
		});

		$(document).on('click','.podorozhnik_card_delete',function (e) {
		    e.preventDefault();
            var card_id = $(this).data('card_id');
            self.showDeleteDialog(card_id);
        });
		$(document).on('click',".podorozhnik_submit_delete",function () {
			self.deleteFromFav();
			Messenger.close();
		});

		$(document).on('click','.new_podorozhnik_payment',function () {
            $(".podorozhnik_pay_form_result").hide();
            $(".podorozhnik_pay_form").removeClass('hidden').show();
        });

		// Клик по переключателю между прислать чек/не присылать чек
		$(document).on('click', '.toggleSendCheck', function () {
			if($(this).data('sendcheck') == 'yes'){
				$(".email_field").slideDown();
			}else{
				$(".email_field").slideUp();
			}
			$(".sendcheck").val($(this).data('sendcheck'));
		});


		// Выбор чекбокса
		$('.podorozhnik_pay_form .payment_method_check input[type="checkbox"]').change(function () {
			var value = $(this).data('value');
			var id = $(this).attr('id');

			if($(this).is(":checked")){
				$('.podorozhnik_pay_form .payment_method_check input[type="checkbox"]').each(function () {
					if($(this).is(":checked") && $(this).attr('id') !== id){
						$(this).click();
					}
				});
				$(".payment_method").val(value);
			}else{
				$(".payment_method").val('');
			}
		});

		self.HideFavButton();
	};

	self.checkFav = function() {
		var value = $(".podorozhnik_card_number").val();
		value = value.replace(/\s/g, '');
		value = value.replace(/_/g, '');

		if(value.length === 19 || value.length === 26 ){
			if($(".action-buttons__item.favorite").hasClass('loginToFav_E')){
				self.ShowFavButton();
			}else{
				$.ajax({
					type: "POST",
					url: "/podorozhnik/checkFav",
					data: {card_number: value},
					dataType: "TEXT",
					success: function (msg) {
						var json = JSON.parse(msg);

						if(json.result === true){
							self.showFilledStar();
							$(".action-buttons__item.favorite").data('card_id',json.id);
						}else {
							self.showEmptyStar();
							$(".action-buttons__item.favorite").data('card_id',0);
						}

						self.ShowFavButton();
					},
					error: function (msg) { console.log('error'); },
				});
			}

		}else{
			self.HideFavButton();
		}
	};

	self.HideFavButton = function(){
		$('.podorozhnik_add2fav_area').slideUp();
	};

	self.ShowFavButton = function(){
		$('.podorozhnik_add2fav_area').slideDown();
	};

	self.SwitchFav = function(){
		if($(".action-buttons__item.favorite").hasClass('loginToFav_E')){
			return null;
		}
		if($(".action-buttons__item.favorite").hasClass('added2Fav')){
			var card_id = $(".action-buttons__item.favorite").data('card_id');
			self.showDeleteDialog(card_id);
		}else{
			self.addToFav($('.podorozhnik_card_number').val());
		}
	};


	self.deleteFromFav =function(){
		card_id = self.currentDeleteID;
		$.ajax({
			type: "POST",
			url: "/podorozhnik/delFromFav",
			data: {card_id: card_id},
			dataType: "TEXT",
			success: function (msg) {
				var json = JSON.parse(msg);
				console.log(msg);

				if(json.result === true){
					self.showEmptyStar();
					$(".action-buttons__item.favorite").data('card_id',0);
					Messenger.show('Удалено из избранного');

					$('.pcha'+card_id+'').remove();
					$('.pcap'+card_id+'').remove();

				}else {
					Messenger.show('Не удалось удалить из избранного');
				}
				self.ShowFavButton();
			},
			error: function (msg) { console.log('error'); },
		});

	};

	self.addToFav = function(card_number){
		$.ajax({
			type: "POST",
			url: "/podorozhnik/add2Fav",
			data: {card_number: card_number},
			dataType: "TEXT",
			success: function (msg) {
				var json = JSON.parse(msg);
				console.log(json);

				if(json.result === true){
					self.showFilledStar();
					$(".action-buttons__item.favorite").data('card_id',json.id);
					Messenger.show('Добавлено в избранное');

					$('.podorozhnik_card_hints').append(
						'<span class="podorozhnik_card_hint_area pcha'+json.id+'" data-card_id="'+json.id+'">' +
						'<a class="podorozhnik_card"><span class="title"></span> <span class="number">'+card_number+'</span></a>,</span>'
					);

					var dummy = $(".dummy_podorozhnik_card_at_panel .podorozhnik_card_at_panel").clone();

					dummy.addClass('pcap'+json.id);
					dummy.attr('data-card_id',json.id);
					dummy.find('.podorozhnik_card .number').text(card_number);
					dummy.find('.podorozhnik_card_use').attr('data-card_number',card_number);
					dummy.find('.podorozhnik_card_rename').attr('data-card_id',json.id);
					dummy.find('.podorozhnik_card_delete').attr('data-card_id',json.id);

					$(".podorozhnik_cards_panel").append(dummy);


				}else {
					self.showEmptyStar();
					$(".action-buttons__item.favorite").data('card_id',0);
					Messenger.show('Не удалось добавить в избранное');
				}

				self.ShowFavButton();
			},
			error: function (msg) { console.log('error'); },
		});

	};

	self.showDeleteDialog = function(card_id){
		var dummy = $(".dummy_podorozhnik_card_delete_dialog .dialog").clone();
		Messenger.show(dummy,translate('Удалить карту'));

		var card_title = $(".pcha"+card_id+" .title").text();
		card_title += " " + $(".pcha"+card_id+" .number").text();
		console.log(card_title);

		$(".Messenger .podorozhnik_card_at_dialog").text(card_title);

		self.currentDeleteID = card_id;
	};

	self.showRenameDialog = function(card_id,old_title){
		//console.log(old_title);
		self.currentRenameID = card_id;

		var dummy = $(".dummy_podorozhnik_card_rename_dialog .dialog").clone();
		dummy.find('.new_card_title').val(old_title);
		dummy.addClass('podorozhnik_open_dialog');


		Messenger.show(dummy,translate('Переименовать карту'));

		$(document).on('click',".podorozhnik_submit_rename",function () {
			self.renameFav(self.currentRenameID, $('.podorozhnik_open_dialog .new_card_title').val());
		});
	};

	self.renameFav = function(card_id,new_title){
		console.log(card_id + ' to ' + new_title);

		$.ajax({
			type: "POST",
			url: "/podorozhnik/renameFav",
			data: {card_id: card_id, new_title: new_title},
			dataType: "TEXT",
			success: function (msg) {
				$(".pcap"+card_id+" .podorozhnik_card .title").text(new_title);
				$(".podorozhnik_card_hint_area.pcha"+card_id+" .podorozhnik_card .title").text(new_title);
				Messenger.close();
			},
			error: function (msg) {
				Messenger.show('Произошла ошибка при выполнении запрошенного действия');
				console.log('error');
				},
		});
	};


	self.showFilledStar = function () {
		html = '<svg viewBox="0 0 22 22" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" width="22px" height="22px">\n' +
			'            <path fill-rule="evenodd"  fill="rgb(254, 204, 53)" d="M11.590,0.352 L14.370,6.981 L21.486,7.598 C21.980,7.640 22.181,8.261 21.806,8.588 L16.408,13.300 L18.026,20.311 C18.138,20.798 17.614,21.181 17.190,20.923 L11.074,17.206 L4.959,20.923 C4.534,21.180 4.011,20.797 4.123,20.311 L5.741,13.300 L0.342,8.586 C-0.033,8.260 0.167,7.639 0.662,7.596 L7.778,6.980 L10.557,0.352 C10.750,-0.110 11.398,-0.110 11.590,0.352 Z"/>\n' +
			'        </svg>';
		$(".action-buttons__item.favorite").html(html);
		$(".action-buttons__item.favorite").addClass('added2Fav');
		$(".podorozhnik_add2fav span").text(translate('Добавлено в избранное')+':');
	};
	self.showEmptyStar = function () {
		html = '<svg viewBox="0 0 22 22" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">\n' +
			'            <path fill-rule="evenodd" d="M11.590,0.352 L14.370,6.981 L21.486,7.598 C21.980,7.640 22.181,8.261 21.806,8.588 L16.408,13.300 L18.026,20.311 C18.138,20.798 17.614,21.181 17.190,20.923 L11.074,17.206 L4.959,20.923 C4.534,21.180 4.011,20.797 4.123,20.311 L5.741,13.300 L0.342,8.586 C-0.033,8.260 0.167,7.639 0.662,7.596 L7.778,6.980 L10.557,0.352 C10.750,-0.110 11.398,-0.110 11.590,0.352 Z"></path>\n' +
			'        </svg>';
		$(".action-buttons__item.favorite").html(html);
		$(".action-buttons__item.favorite").removeClass('added2Fav');
		$(".podorozhnik_add2fav span").text(translate('Добавить в избранное')+':');
	};

	self.init();
};

ToggleRaspManager = function () {

	this.init = function () {
		ShowCurrentSheduleDaysAndDirection();

		// Клик по переключателю между двумя видами расписаний, например между Будни/Выходные
		$(document).on('click', '.toggleRasp', function () {
			var sheduleDays = $(this).data('sheduledays');
			console.log(sheduleDays);
			$("#rasp_current_sheduleDays").val(sheduleDays);
			ShowCurrentSheduleDaysAndDirection();
		});

		// Смена значения в селекте при выборе вида расписания, например селект со значениями Будни/Суббота/Воскресенье
		$("#sheduleDaysSelect").change(function () {
			$("#rasp_current_sheduleDays").val($(this).val());
			ShowCurrentSheduleDaysAndDirection();
		});


		// Клик по переключателю между расписаниями туда/обратно
		$(document).on('click', '.toggleRaspDirection', function () {
			var directionID = $(this).data('directionindex');
			$("#rasp_current_directionID").val(directionID);
			ShowCurrentSheduleDaysAndDirection();
		});

	};

	// Отобразить выбранный тип расписания
	function ShowCurrentSheduleDaysAndDirection() {
		if (
			$("#PreventShowCurrentSheduleDaysAndDirection") !== undefined &&
			$("#PreventShowCurrentSheduleDaysAndDirection").val() === 'true'
		) return false;
		var sheduleDays = $("#rasp_current_sheduleDays").val();
		var directionID = $("#rasp_current_directionID").val();
		$(".shedule__item").hide();

		// Если directionID == -1, значит у маршрута нет двух направлений, и переключателя туда/обратно
		// Такой маршрут не нужно фильтровать по направлениям. Если directionID !== -1, то фильтруем
		if (directionID == -1) {
			$(".shedule__item[data-sheduledays='" + sheduleDays + "']").show();
		} else {
			$(".shedule__item[data-sheduledays='" + sheduleDays + "'][data-directionid='" + directionID + "']").show();
		}

	};

};

ToggleRaspAjaxManager = function () {

	this.init = function () {

		// Клик по переключателю между двумя видами расписаний, например между Будни/Выходные
		$(document).on('click', '.toggleRasp', function () {
			var sheduleDays = $(this).data('sheduledays');
			console.log(sheduleDays);
			$("#rasp_current_sheduleDays").val(sheduleDays);
			ShowCurrentSheduleDaysAndDirection();
		});

		// Смена значения в селекте при выборе вида расписания, например селект со значениями Будни/Суббота/Воскресенье
		$("#sheduleDaysSelect").change(function () {
			$("#rasp_current_sheduleDays").val($(this).val());
			ShowCurrentSheduleDaysAndDirection();
		});


		// Клик по переключателю между расписаниями туда/обратно
		$(document).on('click', '.toggleRaspDirection', function () {
			var directionID = $(this).data('directionindex');
			$("#rasp_current_directionID").val(directionID);
			ShowCurrentSheduleDaysAndDirection();
		});

	};

	// Отобразить выбранный тип расписания
	function ShowCurrentSheduleDaysAndDirection() {
		if (
			$("#PreventShowCurrentSheduleDaysAndDirection") !== undefined &&
			$("#PreventShowCurrentSheduleDaysAndDirection").val() === 'true'
		) return false;

		$(".sheet__result.route_schedule_table").html($(".loading-dummy").clone().removeClass('dummy'));

		var URLSITE = $("#URLSITE").html();
		var url = URLSITE + '/social/routeSchedule';

		var data = {
			'type' : $("#rasp_transport_type").val(),
			'number' : $("#rasp_route_slug").val(),
			'sheduleDays' : $("#rasp_current_sheduleDays").val(),
			'directionID' : $("#rasp_current_directionID").val(),
		};

		$.ajax({
			url: url,
			type: "GET",
			data: data,
			success: function (data) {
				$(".sheet__result.route_schedule_table").html(data);
			},
			error: function (req, str, exc) {
				// Messenger.show(str);
			}
		});
	};
};


ToggleTransporterRoutesManager = function () {

	this.init = function () {

		ShowCurrentTransporterRoutes();

		// Клик по переключателю между типом транспорта
		$(document).on('click', '.toggleTransporterRoutes', function () {
			var type = $(this).data('type');
			$("#current_type_transporter_routes").val(type);
			ShowCurrentTransporterRoutes();
		});

		// Смена значения в селекте при выборе типа транспорта на странице перевозчика в соц.маршрутах
		$("#TransporterRoutesSelect").change(function () {
			$("#current_type_transporter_routes").val($(this).val());
			ShowCurrentTransporterRoutes();
		});
	};

	// Отобразить маршруты выбранного типа транспорта на странице перевозчика
	function ShowCurrentTransporterRoutes() {
		var type = $("#current_type_transporter_routes").val();
		$(".transporter_route").hide();
		$("." + type + '_transporter_route').show();
		var settings = JSON.parse($("#route_types_settings").val());
		$(".routes__icon img").attr('src', settings[type].icon);
	};
};

FilterRoutesTable = function () {
	var self = this;

	self.hideSent = false;
	self.lightningsOnly = false;

	self.init = function () {

		// Клик по переключателю показывать/не показывать исключительно роуты-молнии
		$(document).on('click', '.lightnings_only_btn', function () {
			if ($('.lightnings_only_btn').hasClass('active')) {
				$('.lightnings_only_btn').removeClass('active');
				$('.lighnings_only_span').show();
				$('.lighnings_not_only_span').hide();
				self.lightningsOnly = false;
			} else {
				$('.lightnings_only_btn').addClass('active');
				$('.lighnings_only_span').hide();
				$('.lighnings_not_only_span').show();
				self.lightningsOnly = true;
			}
			self.ShowFilteredRoutes();
		});


		// Клик по переключателю показывать/скрыть ушедшие
		$(document).on('click', '.hideSentRoutes', function () {
			var type = $(this).data('type');
			if (type === 'hideSent') {
				self.hideSent = true;
			} else {
				self.hideSent = false;
			}
			self.ShowFilteredRoutes();
		});
	};

	self.ShowFilteredRoutes = function () {
		$(".table__row").addClass('showRaspRow').removeClass('hideRaspRow');
		$(".route-table tr").addClass('showRaspRow').removeClass('hideRaspRow');
		//$(".table__row").show();

		if (self.hideSent == true) {
			$(".table__row.sent").removeClass('showRaspRow').addClass('hideRaspRow');
			$(".route-table tr.sent").removeClass('showRaspRow').addClass('hideRaspRow');
			//$(".table__row.sent").hide();
		}
		if (self.lightningsOnly == true) {
			$(".table__row.not_express").removeClass('showRaspRow').addClass('hideRaspRow');
			$(".route-table tr.not_express").removeClass('showRaspRow').addClass('hideRaspRow');
			//$(".table__row.not_express").hide();
		}
	}

};

SocialFormSearchManager = function (newOnly, openInNewWindow) {
	var self = this;
	self.currentType = '';
	self.cache = {};
	self.newOnly = newOnly;
	self.openInNewWindow = openInNewWindow;

	self.init = function () {
		detectCurrentType();

		// Клик по вкладке типа соц.транспорта
		$(document).on('click', "#search_social_route_form .controls-item", function () {

			$(".controls-item").removeClass('active');
			$(this).addClass('active');

			self.type = $(this).data('type');
			var color = $(this).data('color');

			$("#search_social_route_form .form__icon img").hide();
			$("#search_social_route_form .form__icon img[data-type='" + self.type + "']").show();
			$(".search-path").css('background-color', '#' + color + '');

		});

		// Подсказки при вводе номера маршрута в поиск на главной странице раздела соц.транспорта
		$(".search_input").autocomplete({
			source: function (request, response) {
				var dop_url='';
				var val = encodeURIComponent($(".search_input").val());
				var URLSITE = $("#URLSITE").html();
				var lang = $("#LANGUAGE").text();
				if(lang !== 'ru') dop_url = '/'+lang;
				var url = URLSITE + dop_url + '/find/ajaxSearch/' + val + '/' + self.type + '?newOnly='+self.newOnly;
				console.log(url);

				var key = self.type + val;
				if (key in self.cache) {
					response(self.cache[key]);
					return;
				}

				$.ajax({
					url: url,
					success: function (data) {
						data = jQuery.parseJSON(data);
						self.cache[key] = data;
						response(data);
					},
					error: function (req, str, exc) {
						// Messenger.show(str);
					}
				});
			},
			select: function (event, ui) {
				if (self.openInNewWindow) {
					window.open(ui.item.url);
				} else {
					window.location.href = ui.item.url;
				}
				return false;
			},
			minLength: 1
		});

		$('.form_find').submit(function (e) {
			e.preventDefault();

			var search_input = $(".search_input").val();
			var URLSITE = $("#URLSITE").html();
			if (search_input == '') {
				Messenger.show('Задан пустой запрос');
				return '';
			}

			let url = URLSITE + '/find/ajaxSearchSingle/' + encodeURIComponent(search_input) + '/' + self.type;
			$.ajax({
				url: url,
				success: function (data) {
					let route = jQuery.parseJSON(data);
					if (route.url != undefined && route.url !== '') {
						if (self.openInNewWindow) {
							window.open(route.url);
						} else {
							document.location.href = route.url;
						}
					} else {
						let str = translate('К сожалению, запрошенный Вами маршрут не найден в базе');
						Messenger.show(str);
					}
				},
				error: function (req, str, exc) {
					// Messenger.show(str);
				}
			});
		});
	};

	detectCurrentType = function () {
		self.type = $("#search_social_route_form .controls-item.active").data('type');
	}
};

SocialFormSearchChangesManager = function () {
	var self = this;
	self.currentType = '';
	self.cache = {};

	self.init = function () {

		detectCurrentType();

		// Клик по вкладке типа соц.транспорта
		$(document).on('click', "#search_social_route_form .controls-item", function () {

			$(".controls-item").removeClass('active');
			$(this).addClass('active');

			self.type = $(this).data('type');
			var color = $(this).data('color');

			$("#search_social_route_form .form__icon img").hide();
			$("#search_social_route_form .form__icon img[data-type='" + self.type + "']").show();
			$(".search-path").css('background-color', '#' + color + '');

		});


		$(".search_input").autocomplete({
			source: function (request, response) {
				var val = encodeURIComponent($(".search_input").val());
				var URLSITE = $("#URLSITE").html();
				var url = URLSITE + '/find/ajaxSearch/' + val + '/' + self.type;
				console.log(url);

				var key = self.type + val;
				if (key in self.cache) {
					response(self.cache[key]);
					return;
				}

				$.ajax({
					url: url,
					success: function (data) {
						data = jQuery.parseJSON(data);
						console.log(data);
						self.cache[key] = data;
						response(data);
					},
					error: function (req, str, exc) {
						// Messenger.show(str);
					}
				});
			},
			select: function (event, ui) {
				var URLSITE = $("#URLSITE").html();
				window.location.href = URLSITE+'/find/changes?VkNews[filter_transport_id]='+ui.item.id;
				return false;
			},
			minLength: 1

		});


		$('.form_find').submit(function (e) {
			e.preventDefault();

			var search_input = $(".search_input").val();
			var URLSITE = $("#URLSITE").html();
			if (search_input == '') {
				Messenger.show('Задан пустой запрос');
				return '';
			}

			var url = URLSITE + '/find/ajaxSearchSingle/' + encodeURIComponent(search_input) + '/' + self.type;
			$.ajax({
				url: url,
				success: function (data) {
					var route = jQuery.parseJSON(data);
					if (route.id != undefined && route.id !== '') {
						window.location.href = URLSITE+'/find/changes?VkNews[filter_transport_id]='+route.id;
					} else {
						var str = translate('К сожалению, запрошенный Вами маршрут не найден в базе');
						Messenger.show(str);
					}
				},
				error: function (req, str, exc) {
					// Messenger.show(str);
				}
			});


		});

	};

	detectCurrentType = function () {
		self.type = $("#search_social_route_form .controls-item.active").data('type');
	}
};

SocialFormSearchAllStopsManager = function () {
	var self = this;
	self.init = function () {

		$(".search_input")
			.autocomplete({
				source: function (request, response) {
					var search_input = $(".search_input").val();
					var URLSITE = $("#URLSITE").html();
					var lang = $("#LANGUAGE").text();
					var dop_url = '';
					if(lang !== 'ru') dop_url = '/'+lang;

					var url = URLSITE + dop_url + '/find/ajaxSearchStop';
					console.log(url);

					$.ajax({
						url: url,
						type: "POST",
						data: {'text': encodeURIComponent(search_input)},
						success: function (data) {
							response(jQuery.parseJSON(data));
						},
						error: function (req, str, exc) {
							// Messenger.show(str);
						}
					});
				},
				select: function (event, ui) {

					//console.log(ui.item);

					$(".search_input").val(ui.item.value_without_type);
					MapManagerT.showStopAtAllStops(ui.item.id);

					return false;
				},
				minLength: 1
			})
			.focus(function () {
				$(this).select();
			});

		// Клик по кнопке найти
		$('.form_search').submit(function (e) {
			e.preventDefault();

			var search_input = $(".search_input").val();
			if (search_input == '') {
				Messenger.show('Задан пустой запрос');
				return '';
			}

			var URLSITE = $("#URLSITE").html();
			var dop_url = '';
			if(lang !== 'ru') dop_url = '/'+lang;
			var url = URLSITE + dop_url + '/find/ajaxSearchStop';
			console.log(url);

			$.ajax({
				url: url,
				type: "POST",
				data: {'text': encodeURIComponent(search_input)},
				success: function (data) {
					var stops = jQuery.parseJSON(data);
					if (stops[0] !== undefined && stops[0].id !== undefined) {
						for (var i = 0; i < stopsData.length; i++) {
							if (stopsData[i].id === stops[0].id) {
								//console.log(stopsData[i]);
								MapManagerT.showStopAtAllStops(stops[0].id);
							}
						}
					} else
						Messenger.show('Остановка не найдена');
				},
				error: function (req, str, exc) {
					Messenger.show('Произошла ошибка при загрузке данных');
				}
			});
		});
	};
};


CommonSearchManager = function () {
	var self = this;
	self.typeSearch = 'city';
	self.MapManager = '';
	self.selectorSuffix = '';
	self.limit = 10;
	self.cache = {};

	self.init = function (type) {
		//console.log('csm started');
		if (type !== undefined)
			self.typeSearch = type;

		$('.csm-input' + self.selectorSuffix).each(function (index) {

			var input = $(this);
			input.autocomplete({
				source: function (request, response) {
					var URLSITE = $("#URLSITE").html();
					var val = encodeURIComponent(input.val());
					var url = '';
					var dop_url = '';
					var data = {};
					var lang = $("#LANGUAGE").text();
					if(lang !== 'ru') dop_url = '/'+lang;


					if (self.typeSearch === 'social_stop') {
						url = URLSITE + dop_url + '/find/ajaxSearchStop/' + val;
						data = {'text': val};
					}
					if (self.typeSearch === 'metro_station') {
						url = URLSITE + dop_url + '/site/ajaxSearchTipsMetroStations/text/' + val;
					}


					// @deprecated
					if (self.typeSearch === 'city') {
						url = URLSITE + dop_url + '/site/ajaxSearchTips/text/' + val + '/type/c';
					}
					// @deprecated
					if (self.typeSearch === 'mezhgor_station') {
						url = URLSITE + dop_url + '/site/ajaxSearchTips/text/' + val + '/type/s';
					}
					// @deprecated
					if (self.typeSearch === 'city2') {
						url = URLSITE + dop_url + '/site/ajaxSearchTipsWithTypes/text/' + val + '/type/cities';
					}
					// @deprecated
					if (self.typeSearch === 'station') {
						url = URLSITE + dop_url + '/site/ajaxSearchTipsWithTypes/text/' + val + '/type/stations';
					}

					if (url === '') {
						url = URLSITE + dop_url + '/rasp/ajaxSearchTipsNew';
						data = {text: val, transport_type: self.typeSearch, limit: self.limit};
					}

					if (input.attr('name') == 'start-point') {
						$("#HiddenFromID").val('');
					}

					if (input.attr('name') == 'finish-point') {
						$("#HiddenToID").val('');
					}

					var key = self.typeSearch + val;
					if (key in self.cache) {
						response(self.cache[key]);
						return;
					}

					console.log(url);
					console.log(data);

					$.ajax({
						type: "POST",
						data: data,
						url: url,
						success: function (data) {
							data = jQuery.parseJSON(data);
							self.cache[key] = data;
							response(data);
						},
						error: function (req, str, exc) {
						}
					});
				},
				select: function (event, ui) {
					//console.log(ui.item);
					input.val(ui.item.value);

					if (ui.item.code !== undefined) {
						if (input.attr('name') === 'start-point') {
							$("#HiddenFromID").val(ui.item.code);
						} else {
							$("#HiddenToID").val(ui.item.code);
						}
					}
					return false;
				},
				minLength: 1
			})
				.autocomplete("instance")._renderItem = function (ul, item) {
				var html = "<div class='input_hint_item'>" + item.label;
				if (item.desc !== undefined)
					html += "<br><span class='input_hint_item_span'>" + item.desc + "</span>";
				html += "</div>";

				return $("<li>")
					.append(html)
					.appendTo(ul);
			};
		});

		$(".csm-input" + self.selectorSuffix).focus(function () {
			$(this).select();
		});

		$(document).on('click', '.csm-separator' + self.selectorSuffix, function (e) {
			e.preventDefault();
			var val1, val2;
			val1 = $(".csm-input" + self.selectorSuffix + "[name=start-point]").val();
			val2 = $(".csm-input" + self.selectorSuffix + "[name=finish-point]").val();
			$(".csm-input" + self.selectorSuffix + "[name=start-point]").val(val2);
			$(".csm-input" + self.selectorSuffix + "[name=finish-point]").val(val1);

			val1 = $("#HiddenFromID").val();
			val2 = $("#HiddenToID").val();
			$("#HiddenFromID").val(val2);
			$("#HiddenToID").val(val1);

			//if(self.typeSearch === 'metro_station')
			//	self.findMetroScheme();
		});

		$(document).on('click','.today-date',function () {
			var date = new Date();
			console.log('date1');
			$(".date-input").val( formatDate2(date) );
		});

		$(document).on('click','.tomorrow-date',function () {
			var date = new Date();
			date.setDate(date.getDate() + 1);
			console.log('date2');
			$(".date-input").val( formatDate2(date) );
		});

	};

	self.getDate = function () {
		var date = $(".date-input").val();
		if (date === undefined || date === '') return '';
		date = new Date(date.replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
		return formatDate(date);
	}
};


function MessengerO() {
	var self = this;

	self.title = '';
	self.content = '';

	self.BeforeCloseCallback = function () {
		//console.log('BeforeCloseCallback');
	};

	self.init = function () {
		$(document)
			.on('click', '.popup_print_btn', function () {
				self.openPrintDialog();
			})
			.on('click', '.popup__close', function () {
				self.close();
			})
			.on('click', '.popup_opened', function (e) {
				if ($(e.target).parents('.popup__content').length == 0) {
					self.close();
				}
			});
	};

	self.show = function (content, title, mode, BeforeCloseCallback) {
		if (BeforeCloseCallback !== undefined)
			self.BeforeCloseCallback = BeforeCloseCallback;

		if (title === undefined) title = '';
		self.title = translate(title);
		self.content = translate(content);
		self.showModal(mode);
	};

	self.showModal = function (mode) {
		if (mode == 'full')
			$('.Messenger .popup__content').removeClass('popup__halfwidth');
		else $('.Messenger .popup__content').addClass('popup__halfwidth');

		$('.Messenger .popup__title').html(self.title);
		$('.Messenger .popup__content div').html(self.content);
		$(".Messenger").addClass('popup_opened');
	};

	self.close = function () {
		self.BeforeCloseCallback();
		self.BeforeCloseCallback = function () {
		};

		$(".Messenger").removeClass('popup_opened');
		$(".popup_print").removeClass('popup_opened');
	};

	self.openPrintDialog = function () {
		self.close();
		$(".popup_print").toggleClass('popup_opened');
	};

	self.init();
};


LoadRasp = function () {
	var self = this;
	self.type = 'suburbantrain';
	self.typePage = 'station';
	self.currentPage = 1;
	self.stationID = '';
	self.from = '';
	self.to = '';
	self.date = '';
	self.countPages = 1000;

	self.load = function () {

		//console.log('start load rasp');

		if (self.typePage === 'station' && self.stationID === '') return false;
		if (self.currentPage >= self.countPages) {
			self.stopLoad();
			return false;
		}
		if ($(".show-more").hasClass('.inProcess')) return false;

		//console.log('self.load process');

		self.currentPage++;

		if (self.typePage === 'station') {
			var url = '/rasp/getstation/' + self.stationID + '/' + self.type + '/page/' + self.currentPage;
		} else if (self.typePage === 'route') {
			var url = '/rasp/getroute/from/' + self.from + '/to/' + self.to + '/type/' + self.type + '/page/' + self.currentPage;
			if (self.date !== '') url += '/date/' + self.date;
		}

		$(".show-more").html('Идет загрузка...').addClass('inProcess');

		//console.log(url);

		$.ajax({
			type: "GET",
			url: url,
			//data: request,
			dataType: "html",
			success: function (html) {
				//console.log(html);

				if (self.typePage === 'station') {
					self.FillStation(JSON.parse(html));
				} else if (self.typePage === 'route') {
					self.FillRoute(html);
					FilterRoutes.ShowFilteredRoutes();
				}

				setTimeout(function () {
					$(".show-more").html('Загрузить еще').removeClass('inProcess');
				}, 1500);

			},
			error: function () {
				// something wrong. but setInterval will set up connection automatically
				//setTimeout(self.get_feed, 3000);
			}
		});
	};

	self.FillRoute = function (html) {
		$("#table-desktop").append(html);
	};

	self.FillRouteOld = function (json) {
		//console.log(json);

		var schedule = json.threads;
		for (i in schedule) {
			var result = schedule[i];

			var desktop_row = $('.dummy .table__row.desktop').clone();
			desktop_row.addClass(result.status);
			if (result.express !== null) desktop_row.addClass('express');
			else desktop_row.addClass('not_express');
			desktop_row.find('.table__item:nth-child(1)').html('<span class="status">' + result.status_text + '</span>');

			var html = '<div class="flight">';
			if (result.uid == '') {
				html += 'No ' + result.number;
				if (result.reis !== '') html += ' ' + result.reis;
			} else {
				html += 'No <a href="' + result.nitka + '">' + result.number;
				if (result.reis !== '') html += ' ' + result.reis;
				html += '</a>';
			}
			html += '</div>';
			html += '<p>' + result.days + '</p>';
			if (result.express !== null) {
				html += $('.dummy .express_icon').html();
			}
			desktop_row.find('.table__item:nth-child(2)')
				.html(html);

			desktop_row.find('.table__item:nth-child(3)')
				.html(result.departure_html + '<p>' + result.from + '</p>');

			desktop_row.find('.table__item:nth-child(4)')
				.html(result.arrival_html + '<p>' + result.to + '</p>');

			$("#table-desktop").append(desktop_row);


		}

	};

	self.FillStation = function (json) {

		var schedule = json.schedule;
		for (i in schedule) {
			var result = schedule[i];
			var desktop_row = $('.dummy .table__row.desktop').clone();
			//desktop_row.addClass(result.status);
			//desktop_row.find('.table__item:nth-child(1)').html('<span class="status">'+result.status_text+'</span>');
			desktop_row.find('.table__item:nth-child(1)')
				.html('<div class="flight"><a href="' + result.nitka_url + '">' + result.reis + '</a></div>');
			desktop_row.find('.table__item:nth-child(2)')
				.html('<div class="flight"><a href="' + result.nitka_url + '">' + result.thread.number + '</a></div>');
			desktop_row.find('.table__item:nth-child(3)').html(result.arrival_html);
			desktop_row.find('.table__item:nth-child(4)').html(result.departure_html);
			desktop_row.find('.table__item:nth-child(5)').html(result.days);
			$("#table-desktop").append(desktop_row);

			var mobile_row = $('.dummy .table__row.mobile').clone();
			//mobile_row.addClass(result.status);

			var html = '<div class="flight">';
			html += '<a href="' + result.nitka_url + '">' + result.thread.number + ' ' + result.reis;
			if (result.direction != undefined && result.direction != '') {
				html += ', ' + result.direction;
			}
			html += '</div>';
			mobile_row.find('.table__item:nth-child(1)').append(html);
			//mobile_row.find('.table__item:nth-child(2)').append('<span class="status big">'+result.status_text+'</span><span class="black"> / '+result.days+'</span>');
			mobile_row.find('.table__item:nth-child(2)').append('<span class="black"> / ' + result.days + '</span>');
			mobile_row.find('.table__item:nth-child(3)').append(result.arrival_html);
			mobile_row.find('.table__item:nth-child(4)').append(result.departure_html);

			$("#table-mobile").append(mobile_row);
		}
	};

	self.stopLoad = function () {
		$(".show-more").hide();
	};

	self.init = function () {
		if ($('.show-more').offset() === undefined) return false;

		//console.log('init load rasp');

		$(document).on('click', '.show-more', function () {
			self.load();
		});

		$(window).scroll(function () {
			var offset = $('.show-more').offset().top - 550;
			if ($(window).scrollTop() >= offset) {
				self.load();
			}
		});
	};
	self.init();
};


SearchFormHelper = function () {
	var self = this;
	self.transport_type = 'suburbantrain';
	self.form_type = 'route';
	self.selector = '.MainSearchForm';
	self.dop_url = '';
	if(lang !== 'ru') self.dop_url = '/'+lang;

	self.init = function () {
		console.log('SearchFormHelper init');

		if (self.form_type === 'route') {
			self.helpRoute();
		}
		if (self.form_type === 'station') {
			self.helpStation();
		}
		if (self.form_type === 'metro_station') {
			self.helpMetroStation();
		}
	};


	self.helpRoute = function () {
		console.log('helpRoute');
		$(self.selector).submit(function (e) {
			e.preventDefault();

			var from = $("input[name='start-point']").val();
			var fromID = $("#HiddenFromID").val();
			var to = $("input[name='finish-point']").val();
			var toID = $("#HiddenToID").val();
			var date = $(".date-input").val();

			if (from == '' || from == undefined) {
				Messenger.show('Введите пункт отправления');
				return false;
			}
			if (to == '' || to == undefined) {
				Messenger.show('Введите пункт прибытия');
				return false;
			}

			var request = {
				'from': from,
				'fromID': fromID,
				'to': to,
				'toID': toID,
				'transport_type': self.transport_type,
				'date': date
			};
			console.log(request);

			$.ajax({
				type: "post",
				url: self.dop_url + "/rasp/ajaxGetRouteLink",
				data: request,
				dataType: "json",
				success: function (json) {

					if (json.url == undefined || json.url == '') {
						Messenger.show('Не найдено');
						return false;
					}
					//console.log(json);
					document.location.href = json.url;
				},
				error: function () {
					Messenger.show('Произошла ошибка при поиске');
				}
			});
		});
	};

	self.helpStation = function () {
		//console.log('helpStation');
		$(self.selector).submit(function (e) {
			e.preventDefault();

			var station = $("input[name='station']").val();
			var stationID = $("#HiddenStationID").val();
			if (station == '' || station == undefined) {
				Messenger.show('Введите название');
				return false;
			}

			$.ajax({
				type: "post",
				url: self.dop_url + "/rasp/ajaxGetStationLink",
				data: {
					'station': station,
					'stationID': stationID,
					'transport_type': self.transport_type,
				},
				dataType: "json",
				success: function (json) {
					console.log('ajaxGetStationLink');
					//console.log(json); return false;
					//console.log(json.url);

					if (json.url == undefined || json.url == '') {
						Messenger.show('Не найдено');
						return false;
					}

					document.location.href = json.url;
				},
				error: function () {
					Messenger.show('Произошла ошибка при поиске');
				}
			});
		});
	};

	self.helpMetroStation = function () {
		$(self.selector).submit(function (e) {
			e.preventDefault();

			var station = $("input[name='station']").val();
			if (station == '' || station == undefined) {
				Messenger.show('Введите название');
				return false;
			}

			$.ajax({
				type: "post",
				url: self.dop_url + "/rezhim-raboty-metro/ajaxGetStationLink",
				data: {
					'station': station
				},
				dataType: "json",
				success: function (json) {
					console.log('ajaxGetStationLink');
					//console.log(json); return false;
					//console.log(json.url);

					if (json.url == undefined || json.url == '') {
						Messenger.show('Не найдено');
						return false;
					}

					document.location.href = json.url;
				},
				error: function () {
					Messenger.show('Произошла ошибка при поиске');
				}
			});
		});
	}
};

function formatDate(date) {
	var dd = date.getDate();
	if (dd < 10) dd = '0' + dd;

	var mm = date.getMonth() + 1;
	if (mm < 10) mm = '0' + mm;

	return date.getFullYear() + '-' + mm + '-' + dd;
	//return dd + '.' + mm + '.' + date.getFullYear();
}

function formatDate2(date) {
	var dd = date.getDate();
	if (dd < 10) dd = '0' + dd;

	var mm = date.getMonth() + 1;
	if (mm < 10) mm = '0' + mm;

	return dd + '.' + mm + '.' + date.getFullYear();
}

function JSfunc(el) {

	if (!el || el == "") {
		return;
	}

	new_str = "";
	el = el.replace(/\//g, "");
	A = new Array();
	A["Ш"] = "SH";
	A["Щ"] = "SCH";
	A["Ъ"] = "##";
	A["Ы"] = "YI";
	A["Ч"] = "CH";
	A["Ё"] = "J'O";
	A["ё"] = "j'o";
	A["Э"] = "J'E";
	A["Ю"] = "YU";
	A["Я"] = "YA";
	A["ш"] = "sh";
	A["щ"] = "sch";
	A["ч"] = "ch";
	A["ы"] = "yi";
	A["э"] = "j'e";
	A["ю"] = "yu";
	A["я"] = "ya";
	A["А"] = "A";
	A["Б"] = "B";
	A["В"] = "V";
	A["Г"] = "G";
	A["У"] = "U";
	A["Ф"] = "F";
	A["Х"] = "H";
	A["а"] = "a";
	A["б"] = "b";
	A["ъ"] = "#";
	A["Ц"] = "C";
	A["ц"] = "c";
	A["Д"] = "D";
	A["Е"] = "E";
	A["Ж"] = "J";
	A["З"] = "Z";
	A["И"] = "I";
	A["Й"] = "Y";
	A["К"] = "K";
	A["Л"] = "L";
	A["М"] = "M";
	A["Н"] = "N";
	A["О"] = "O";
	A["П"] = "P";
	A["Р"] = "R";
	A["С"] = "S";
	A["Т"] = "T";
	A["в"] = "v";
	A["г"] = "g";
	A["д"] = "d";
	A["е"] = "e";
	A["ж"] = "j";
	A["з"] = "z";
	A["и"] = "i";
	A["й"] = "y";
	A["к"] = "k";
	A["л"] = "l";
	A["м"] = "m";
	A["н"] = "n";
	A["о"] = "o";
	A["п"] = "p";
	A["р"] = "r";
	A["с"] = "s";
	A["т"] = "t";
	A["у"] = "u";
	A["ф"] = "f";
	A["х"] = "h";
	A[" "] = "_";
	A["ь"] = "*";
	A["Ш"] = "SH";
	A["Щ"] = "SCH";
	A["Ъ"] = "##";
	A["Ы"] = "YI";
	A["Ч"] = "CH";
	A["Ё"] = "J'O";
	A["ё"] = "j'o";
	A["Э"] = "J'E";
	A["Ю"] = "YU";
	A["Я"] = "YA";
	A["ш"] = "sh";
	A["щ"] = "sch";
	A["ч"] = "ch";
	A["ы"] = "yi";
	A["э"] = "j'e";
	A["ю"] = "yu";
	A["я"] = "ya";
	A["А"] = "A";
	A["Б"] = "B";
	A["В"] = "V";
	A["Г"] = "G";
	A["У"] = "U";
	A["Ф"] = "F";
	A["Х"] = "H";
	A["а"] = "a";
	A["б"] = "b";
	A["ъ"] = "#";
	A["Ц"] = "C";
	A["ц"] = "c";
	A["Д"] = "D";
	A["Е"] = "E";
	A["Ж"] = "J";
	A["З"] = "Z";
	A["И"] = "I";
	A["Й"] = "Y";
	A["К"] = "K";
	A["Л"] = "L";
	A["М"] = "M";
	A["Н"] = "N";
	A["О"] = "O";
	A["П"] = "P";
	A["Р"] = "R";
	A["С"] = "S";
	A["Т"] = "T";
	A["в"] = "v";
	A["г"] = "g";
	A["д"] = "d";
	A["е"] = "e";
	A["ж"] = "j";
	A["з"] = "z";
	A["и"] = "i";
	A["й"] = "y";
	A["к"] = "k";
	A["л"] = "l";
	A["м"] = "m";
	A["н"] = "n";
	A["о"] = "o";
	A["п"] = "p";
	A["р"] = "r";
	A["с"] = "s";
	A["т"] = "t";
	A["у"] = "u";
	A["ф"] = "f";
	A["х"] = "h";
	A[" "] = "_";
	A["ь"] = "*";
	A["Ш"] = "SH";
	A["Щ"] = "SCH";
	A["Ъ"] = "##";
	A["Ы"] = "YI";
	A["Ч"] = "CH";
	A["Ё"] = "J'O";
	A["ё"] = "j'o";
	A["Э"] = "J'E";
	A["Ю"] = "YU";
	A["Я"] = "YA";
	A["ш"] = "sh";
	A["щ"] = "sch";
	A["ч"] = "ch";
	A["ы"] = "yi";
	A["э"] = "j'e";
	A["ю"] = "yu";
	A["я"] = "ya";
	A["А"] = "A";
	A["Б"] = "B";
	A["В"] = "V";
	A["Г"] = "G";
	A["У"] = "U";
	A["Ф"] = "F";
	A["Х"] = "H";
	A["а"] = "a";
	A["б"] = "b";
	A["ъ"] = "#";
	A["Ц"] = "C";
	A["ц"] = "c";
	A["Д"] = "D";
	A["Е"] = "E";
	A["Ж"] = "J";
	A["З"] = "Z";
	A["И"] = "I";
	A["Й"] = "Y";
	A["К"] = "K";
	A["Л"] = "L";
	A["М"] = "M";
	A["Н"] = "N";
	A["О"] = "O";
	A["П"] = "P";
	A["Р"] = "R";
	A["С"] = "S";
	A["Т"] = "T";
	A["в"] = "v";
	A["г"] = "g";
	A["д"] = "d";
	A["е"] = "e";
	A["ж"] = "j";
	A["з"] = "z";
	A["и"] = "i";
	A["й"] = "y";
	A["к"] = "k";
	A["л"] = "l";
	A["м"] = "m";
	A["н"] = "n";
	A["о"] = "o";
	A["п"] = "p";
	A["р"] = "r";
	A["с"] = "s";
	A["т"] = "t";
	A["у"] = "u";
	A["ф"] = "f";
	A["х"] = "h";
	A[" "] = "_";
	A["ь"] = "*";
	new_str = el.replace(/([\u0410-\u0451])/g,
		function (str, p1, offset, s) {
			if (A[str] != 'undefined') {
				return A[str];
			}
		}
	);
	return new_str;
}

function TransportListNiceScroll() {
	//console.log('TransportListNiceScroll');
	$('.transport__list').niceScroll({
		cursorcolor: 'rgb(217, 217, 217)',
		cursoropacitymin: 1,
		cursorwidth: '6px',
		cursorborderradius: '3px',
		cursorborder: '0'
	});
	$('.transport__list').getNiceScroll().resize();
}


function translate(string,replaces){
	//console.log(translate_obj[lang][string]);
	var result = string;
	if(lang !== undefined && lang!=='ru'){
		if(translate_obj[lang][string]!==undefined && translate_obj[lang][string] !==''){
			result = translate_obj[lang][string];
		}
	}
	if(replaces !== undefined){
		for(var i in replaces){
			result = result.replace(new RegExp("{"+i+"}",'g'),replaces[i]);
		}
	}

	return result;
}
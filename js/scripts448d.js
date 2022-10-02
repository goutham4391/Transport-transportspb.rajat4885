
$(document).ready(function () {

    translate_obj = JSON.parse($("#js_translate").text());
    lang = $("#LANGUAGE").text();

    Messenger = new MessengerO();
    FavManager.init();

    ToggleRasp = new ToggleRaspAjaxManager;
    ToggleRasp.init();

    FilterRoutes = new FilterRoutesTable;
    FilterRoutes.init();

    new Auth();

    // Перестаем лимитировать высоту блока по клику на "Читать польностью"
    $(document).on('click','.read_full_btnarea',function () {
        $(this).parent('.read_full_area').find('.read_full_target').toggleClass('read_full_target_opened');
        $(this).hide();
    });

    // Отображаем всех перевозчиков по клику на "Развернуть список" в соц. транспорте
    $(document).on('click','.show_full_carriers_btn',function () {
        $('.carriers__column').removeClass('on-desktop');
        $(this).hide();
    });

    // Отображаем фул временного изменения по клику на него
    $(document).on('click','.temporary_change_preview',function () {
        var id = $(this).data('id');
        Messenger.show( $("#"+id+"tcf").html(), $(this).html() );
    });

    $(document).on('click', '.loginToFav_E', function () {
        Messenger.show('Добавлять в избранное могут только авторизованные пользователи');
        if( $('#mobile_detect_spb').text() !== 'mobile')
            $(".sign__item").click();
    });

    $(document).on('click','.print_page',function () {
        var print_options = $("#print_options").html();
        if(print_options == undefined){
            print(); return true;
        }
        print_options = JSON.parse(print_options);
        var print_form = $(".dummy .print_dummy").clone();

        for(var x = 0; x < print_options.length; x++){
            var option = print_options[x];
            var option_item = $(".dummy .print_option_dummy").clone();
            option_item.find('input[type="checkbox"]').attr('id','print'+x);
            option_item.find('label').attr('for','print'+x).text(option.desc);
            option_item.find('input[type="checkbox"]').addClass('print_option_checkbox').attr('data-id',x);
            print_form.find(".print_options").append(option_item);
        }

        $('.map_area').addClass('wide');
        if(window.myMap !== undefined) myMap.container.fitToViewport();

        Messenger.show(print_form,'Печать','short',function () {
            $('.map_area').removeClass('wide');
            if(window.myMap !== undefined) myMap.container.fitToViewport();
        });
    });

    $(document).on('click','.custom_print_button',function (e) {
        e.preventDefault();
        var option;
        var print_options = $("#print_options").html();
        if(print_options == undefined){
            print(); return true;
        }
        print_options = JSON.parse(print_options);

        $(".print_option_checkbox").each(function () {
            option = print_options[$(this).data('id')];
            $(option.selector).addClass('noprint');
        });
        $(".print_option_checkbox:checked").each(function () {
            option = print_options[$(this).data('id')];
            $(option.selector).removeClass('noprint');
        });
        print();
    });

    $(document)
        .on('click','.shedule__item',function () {
            $(this).toggleClass('open');
        })
        .on('click','.show-on-map-btn',function () {
            if($(this).hasClass('active')){
                $(this).removeClass('active').text('Показать на карте');
                $(".map").hide();
            }else{
                $(this).addClass('active').text('Скрыть карту');
                $(".map").show();
            }
        })
        .on('click','.bottom_ribbon',function () {
            $(".bottom_ribbon").slideUp();
            $(".uscl-slide-open").show();
        });

    // показываем bottom_ribbon в зависимости от того, сколько прокрутили страницы
    bottom_ribbon_shown = 0;
    $(window).scroll(function () {
        if($("#bottom_ribbon_start_from").val() != undefined && bottom_ribbon_shown == 0){
            if( $(window).scrollTop() >= $("#bottom_ribbon_start_from").val() ){
                bottom_ribbon_shown = 1;
                $(".bottom_ribbon").slideDown();
                $(".uscl-slide-open").hide();

                setTimeout(function(){
                    $(".bottom_ribbon .popup__close").show();
                },$("#bottom_ribbon_close_from").val());
            }
        }
    });
    var poezdRU = new PoezdRu();

});


PoezdRu = function () {
    var self = this;
    self.datepicker = null;
    self.d = null;

    self.init = function () {
        $(document).on('click','.poezdRu',function (e) {
            e.preventDefault();
            self.d = $(this);
            if($(this).hasClass('select_date')){
                //console.log('.poezdRu.select_date');
                self.SelectDate();
            }else{
                //console.log('.poezdRu.go');
                var url = self.Go();
                window.open(url, '_blank');
            }
        });
    };

    self.SelectDate = function () {
        //console.log('.poezdRu.select_date');
        Messenger.show('<div class="margin-center w100">Вы выбрали поезд. Теперь выберите желаемую дату поездки.<div id="dp" class="relative w100"><input type="hidden" id="choosedatepoezdru"></div></div>','Выберите дату поездки','short',function () {
            $(".datepickers-container").appendTo('body');
            $(".popup__content").css('height','auto').css( 'overflow-y','auto' );
        });
        self.datepicker = $('#choosedatepoezdru').datepicker({
            onSelect: function(formattedDate){
                self.UpdateLinks(formattedDate);
            }
        }).data('datepicker');
        self.datepicker.show();
        var h = $(".datepicker.active").height()+80;
        $(".popup__content").height( h + 'px' ).css( 'overflow-y','hidden' );
        $(".datepickers-container").appendTo('#dp');
    };

    self.Go = function () {
        var slug = self.d.data('slug');
        var href = self.d.attr('href');
        href = href.replace( '{numberTrain}', slug );
        return href;
    };

    self.UpdateLinks = function (formattedDate) {
        var data = {
            'fromName' : self.d.data('fromname'),
            'toName' : self.d.data('toname'),
            'date' : formattedDate
        };
        //console.log('update Links');
        //console.log(data);
        $.ajax({
            type: "GET",
            url: '/integrations/poezdru',
            data: data,
            dataType: "json",
            async: false,
            success: function(json){
                $('.poezdRu').attr('href',json.link);
                Messenger.close();
                //return self.Go();
                window.open(self.Go(), '_blank');
            },
            error: function () {
            }
        });
    };

    self.init();
};
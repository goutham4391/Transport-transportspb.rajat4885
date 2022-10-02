( function(){
    //////////
    // Global variables
    //////////

    var _window = $(window);
    var _document = $(document);

    function pageReady(){
      legacySupport();

    }

    pageReady();

    function legacySupport(){
      // svg support for IE
      svg4everybody();

      // Viewport units buggyfill
      /*window.viewportUnitsBuggyfill.init({
        force: false,
        refreshDebounceWait: 150,
        appendToBody: true
      });*/

    }

    // Prevent # behavior
    _document.on('click', '[href="#"]', function(e) {
      e.preventDefault();
    });



    $(function () {

        if ($('.scroll-content').length) {
            $('.scroll-content').niceScroll({
                cursorcolor: 'rgb(217, 217, 217)',
                cursoropacitymin: 1,
                cursorwidth: '6px',
                cursorborderradius: '3px',
                cursorborder: '0'
            });
        }

        if ($('.transport__list').length) {
			TransportListNiceScroll();
        }

        $('.metro-line').each(function () {
            new MetroLine($(this));
        });

        $('.site > .sidebar').each(function () {
            new Sidebar($(this));
        });

        $('.tab').each(function () {
            new Tab($(this));
        });

        $('.transport').each(function () {
            new TransportLK($(this));
        });

        $('.dropdown').each(function () {
            new Dropdown($(this));
        });

        $('.header').each(function () {
            new Header($(this));
        });



        $('.nice-toggle').each(function () {
            new NiceToggle($(this));
        });



        $('.form').each(function () {
            new Form($(this));
        });

        $('.datepicker-here').each(function () {
			$(this).datepicker()
        });

    });

    var Tab = function(obj) {

        //private properties
        var _self = this,
            _obj = obj,
            _controlsItem = _obj.find('.tab__controls-item'),
            _contentItem = _obj.find('.tab__content-item');

        //private methods
        var _onEvents = function()  {

                _controlsItem.on( {
                    click: function() {
                        var curElem = $(this),
                            curIndex = curElem.index();

                        _controlsItem.each(function (i) {
                            _controlsItem.eq(i).removeClass('active');
                            _contentItem.eq(i).removeClass('active');
                        });

                        curElem.addClass('active');
                        _contentItem.eq(curIndex).addClass('active');

						TransportListNiceScroll();

                        return false;
                    }
                } );

            },
            _init = function() {
                _obj[0].obj = _self;
                _onEvents();
            };

        //public properties

        //public methods
        _self.setActive = function (index) {
            _controlsItem.eq(index).trigger('click');
        };

        _init();
    };

    var TransportLK = function(obj) {

        //private properties
        var _obj = obj,
            _controlsItem = _obj.find('.transport__count'),
            _contentItem = _obj.find('.transport__list-content');

        //private methods
        var _onEvents = function()  {

                _controlsItem.on( {
                    click: function() {
                        var curElem = $(this),
                            curIndex = curElem.index();

                        _controlsItem.each(function (i) {
                            _controlsItem.eq(i).removeClass('active');
                            _contentItem.eq(i).removeClass('active');
                        });

                        curElem.addClass('active');
                        _contentItem.eq(curIndex).addClass('active');

						TransportListNiceScroll();

                        return false;
                    }
                } );

            },
            _setFirstActive = function() {
                var firstElem = _controlsItem.eq(0);
                firstElem.trigger('click');
            },
            _init = function() {
                _onEvents();
                _setFirstActive();
            };

        //public properties

        //public methods

        _init();
    };

    var Sidebar = function(obj) {

        //private properties
        var _obj = obj,
            _item = _obj.find('.sidebar__item'),
            _cloneWrap = $('<div class="sidebar sidebar_clone"></div>');

        //private methods
        var _onEvents = function()  {

                _item.on( {
                    mouseenter: function() {
                        var curElem = $(this),
                            curIndex = curElem.index(),
                            cloneElem = _cloneWrap.find('.sidebar__item').eq(curIndex);

                        _cloneWrap.find('.sidebar__item').removeClass('hover');
                        _item.removeClass('hover');

                        cloneElem.addClass('hover');
                        curElem.addClass('hover');
                    }
                } );

                $(window).on( {
                    resize: function() {
                        _obj.getNiceScroll().resize();
                        _setSidebarHeight();
                        _setTopSubmenu();
                    },
                    mousemove: function(e) {
                        var cloneItems = _cloneWrap.find('.sidebar__item');

                        if (!_checkTarget(e.target, 'submenu')) {
                            if (!_checkTarget(e.target, 'sidebar__item')) {
                                cloneItems.removeClass('hover');
                                _item.removeClass('hover');
                            }
                        }
                    }
                } );

                _obj.on( {
                    scroll: function() {
                        _setTopSubmenu();
                    }
                } );

            },
            _checkTarget = function(target, className) {

                if ($(target).hasClass(className)) {
                    return true;
                } else {
                    if (target.parentNode) {
                        return _checkTarget(target.parentNode, className);
                    } else {
                        return false;
                    }
                }
            },
            _cloneSidebar = function() {

                _item.each(function () {
                    var curElem = $(this);

                   _cloneWrap.append(curElem.clone());
                });

                $('.site').prepend(_cloneWrap);
            },
            _setTopSubmenu = function() {

                _item.each(function () {
                    var curElem = $(this),
                        curSubmenu = curElem.find(' > .submenu'),
                        cloneCurElem = _cloneWrap.find('.sidebar__item').eq(curElem.index()),
                        cloneSubmenu = cloneCurElem.find(' > .submenu');

                    if (curSubmenu.length) {
                        cloneSubmenu.css({ 'top': curElem.offset().top - $(window).scrollTop() + 'px' });
                    }
                });
            },
            _setSidebarHeight = function() {
                _obj.css({ 'height': 'auto' });
                var curHeight = $(window).outerHeight(),
                    elem = _obj.outerHeight();

                if ((curHeight - elem - 92) < 0) {
                    _obj.css({ 'height': (curHeight - 92) + 'px' });
                }

            },
            _init = function() {
                _cloneSidebar();
                _onEvents();
                _setSidebarHeight();
                _setTopSubmenu();
                if (!_obj.hasClass('sidebar_clone')) {
                    _obj.niceScroll({
                        autohidemode: true,
                        railalign: 'left',
                        cursorcolor: 'rgb(217, 217, 217)',
                        background: 'rgb(182, 180, 180)',
                        cursoropacitymin: 1,
                        cursorwidth: '6px',
                        cursorborderradius: '3px',
                        cursorborder: '0'
                    });
                }
            };

        _init();
    };


    var Dropdown = function(obj) {

        //private properties
        var _obj = obj,
            _item = _obj.find('> .dropdown__title');

        //private methods
        var _onEvents = function()  {

                _item.on( {
                    click: function() {

                        _obj.toggleClass('open');

                    }
                } );

            },
            _init = function() {
                _onEvents();
            };

        _init();
    };



    var Header = function(obj) {

        //private properties
        var _obj = obj,
            _btn = _obj.find('.header__btn');

        //private methods
        var _onEvents = function()  {

                _btn.on( {
                    click: function() {
                        _obj.toggleClass('active');
                    }
                } );

            },
            _init = function() {
                _onEvents();
            };

        _init();
    };



    var NiceToggle = function(obj) {

        //private properties
        var _obj = obj,
            _inputs = _obj.find('input[type=radio]'),
            _slider = _obj.find('.nice-toggle__slider');

        //private methods
        var _onEvents = function()  {

                _slider.on( {
                    click: function() {

                        _inputs.each(function () {
                            var curItem = $(this);

                            if (!curItem.prop('checked')) {
                                curItem.trigger('click');
                                return false;
                            }
                        });

                    }
                } );

            },
            _init = function() {
                _onEvents();
            };

        _init();
    };

    var Form = function(obj) {

        //private properties
        var _obj = obj,
            _inputs = _obj.find('input');

        //private methods
        var _onEvents = function()  {

                _inputs.on( {
                    focus: function() {
                        var curParent = $(this).parent();

                        if (curParent.data('placeholder')) curParent.addClass('in-focus');
                    },
                    blur: function() {
                        var curParent = $(this).parent();

                        if (curParent.hasClass('in-focus')) curParent.removeClass('in-focus');
                    }
                } );

            },
            _init = function() {
                _onEvents();
            };

        _init();
    };

    var MetroLine = function(obj) {

        //private properties
        var _obj = obj,
            _btn = _obj.find('.plus-minus-btn');

        //private methods
        var _onEvents = function()  {

                _obj.find('.metro-line__head').on( {
                    'click': function() {
                        _obj.toggleClass('open');
                        _btn.toggleClass('opened');
                    }
                } );

            },
            _init = function() {
                _onEvents();
            };

        _init();
    };

} )();


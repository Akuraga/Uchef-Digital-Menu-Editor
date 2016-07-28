EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.canvas = {
        zoom: 100,
        displayZoom :0,
        zoomGap : 0,
        canvasWidth: '',
        canvasHeight: '',
        snap: 1,
        zoomUnit: 5,
        pageLeftMargin: 17,
        pageTopMargin : 17,

        //jquey object
        $ruller: '',
        $canvas: '',
        $rulerSelector: '',
        $cavasSelector: '',
        $sanpSelector: '',
        $zoomValueSelector: '',
        $zoomUpSelector: '',
        $soomDownSelectr: '',

        
       

        init: function () {

            this.initializeSnapEventHandler();
            this.initializeZoomEventHandler();
            this.initCanvas();  // 해상도에 맞게 초기 canvas 조절 
            this.adjustCanvas();  // 현재 확대 축소 비율에 따라 canvas 확대 축소 
            this.adjustRuler();   // 현재 확대 비율에 따라 ruller 조절 
        },

        initCanvas: function () {
            this.findZooomOnWindowSize();
            $(EggbonEditor.holder).css('left', '17px');
            $(EggbonEditor.holder).css('top', '17px');
        },

        initializeSnapEventHandler: function () {
            this.$snapSelector = $("#snap_select");
            this.$snapSelector.val("1");
            var context = this;
            this.$snapSelector.change(function (e) {
                context.snapValue = parseInt($(this).val());
            });
            
        },

        initializeZoomEventHandler: function () {
            var context = this;
            $('.zoomout').click(function (e) {
                context.displayZoom  = parseInt($('.zoomvalue').val()) - context.zoomUnit;
                context.zoom  = context.zoom - context.zoomUnit;
                
                $('#project_real_zoom').html(context.zoom);
                $('.zoomvalue').val(context.displayZoom + "%");
                
                context.adjustCanvas();
                context.adjustRuler();
                return;

            });

            $('.zoomin').click(function (e) {
                context.displayZoom = parseInt($('.zoomvalue').val()) + context.zoomUnit;
                context.zoom = context.zoom + context.zoomUnit;
                
                $('#project_real_zoom').html(context.zoom);
                $('.zoomvalue').val(context.displayZoom+ "%");
                
                context.adjustCanvas();
                context.adjustRuler();
                return;
            });
        },

        findZooomOnWindowSize : function(){
            this.windowWidth = $(window).innerWidth();
            this.windowHeight = $(window).innerHeight();;

            var resolutionHeight = EggbonEditor.project.resolutionHeight;
            var properZoom = 100;
            var propertHeight = 0;
            var targetHeight = parseInt($('.content_container').innerHeight());
            //console.log("container height", targetHeight)
			
            for (var zoom = 100; zoom > 10 ; zoom = zoom - this.zoomUnit) {
                propertHeight = resolutionHeight * (zoom / 100);
                if (resolutionHeight * (zoom / 100) < targetHeight  - 70) {
                    this.zoom = zoom;
                    if (this.zoom !=100) {
                    	this.displayZoom = 100;
                    }else {
                    	this.displayZoom = this.zoom;
                    }
                    break;
                }
            }
            //상단에 실제 줌을 임시적으로 표시 
            $('#project_real_zoom').html(this.zoom);
            this.canvasWidth = EggbonEditor.project.resolutionWidth * (this.zoom / 100);
            this.canvasHeight= EggbonEditor.project.resolutionHeight* (this.zoom / 100);
            $('.zoomvalue').val(this.displayZoom + "%");
        },

        adjustCanvas: function () {
            var scale = this.zoom / 100;
            //console.log("canvasWidth", this.canvasWidth);
            //console.log("canvasHeight", this.canvasHeight);
            //console.log("실제 넓이",$(EggbonEditor.holder).css('width'));
            //console.log("실제 높이",$(EggbonEditor.holder).css('height'));
        
            var origin = "0% 0%";
            $(EggbonEditor.holder).css(
                {
                    '-moz-transform-origin': origin,
                    'transform-origin': origin,
                    '-ms-transform-origin': origin,
                    '-webkit-transform-origin': origin,
                });
            $(EggbonEditor.holder).css({ transform: 'scale(' + scale + ',' + scale + ' )' });
        },

        adjustComponentSize: function () {
            var context = this;
            $.each(EggbonEditor.project.pages, function (index, page) {
                $.each(page.childs, function (inx, component) {
                    var ox = component.x;
                    var oy = component.y;
                    var owidth = component.width;
                    var oheight = component.height;

                    var tx = parseInt(ox * (context.zoom / 100)) - component.cornerActionTriggerRadius;
                    var ty = parseInt(oy * (context.zoom / 100)) - component.cornerActionTriggerRadius;

                    var twidth = parseInt(owidth * (context.zoom / 100));
                    var theight = parseInt(oheight * (context.zoom / 100));
                    $(component.externalWrapperQueryStr).css('left', tx + "px");
                    $(component.externalWrapperQueryStr).css('top', ty + "px");
                    $(component.originalElement).css('width', twidth + "px");
                    $(component.originalElement).css('height', theight + "px");
                    component.adjustWrapper();
                    //component.adjustResizingBorder();
                });
            });
        },

        adjustRuler: function () {
            var scale = this.zoom / 100;
            var rstartX = 0;
            var rstartY = 0;
            if (scale < 0) {
                rstartX = this.rulerTopStartX - (this.rulerTopStartX * (1 - scale));
                rstartY = this.rulerLeftStartY - (this.rulerLeftStartY * (1 - scale));
            }

            if (scale == 1) {
                rstartX = this.rulerTopStartX;
                rstartY = this.rulerLeftStartY;
            }

            if (scale > 1) {
                rstartX = this.rulerTopStartX + (this.rulerTopStartX * (scale - 1));
                rstartY = this.rulerLeftStartY + (this.rulerLeftStartY * (scale - 1));
            }

            $('.content_container').ruler({
                startX: -0,
                startY: -0,
                showLabel: true,
                arrowStyle: 'arrow',
                ratio: scale
            }).ruler('refresh');
        }
    };
});

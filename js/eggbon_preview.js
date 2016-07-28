EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.preview = {
        windowWidth: 0,
        widnowHeight: 0,
        isShowing : false,
        $previewContainer: "",
        $preview: "",
        $previewWrapper: "",
        curPageInx : -1,
	    clonePages : [],
	    previewWidth : 0,
	    previewHeight : 0,
	    prevewProject : '',
		
        init: function () {
            this.windowWidth = $(window).width();
            this.windowHeight = $(window).height();
            this.curPageInx = -1;
        },
        
        initializeCloseEventHandler: function () {
            var context = this;
            $('.preClose').click(function () {
                context.clonePages.length = 0;
                context.clonePagesLength = 0;
                context.$preview.empty();
                context.curPageInx = -1;
                context.$previewContainer.hide();
				context.$previewContainer.remove();

				context.isShowing = false;
				if (EggbonEditor.newPageWindow.isShown){
					EggbonEditor.newPageWindow.showTemporary();
				}
            });
        },

        initializeNextPreEventHandler: function () {
            var context = this;
            $('.btpre').click(function () {
                var showIndex = context.curPageInx - 1;
                if (showIndex < 0) {
                    return;
                } else {
                    context.showPage(showIndex,'right');
                }
            });
            $('.btnex').click(function () {
                var showIndex  = context.curPageInx + 1;
                if (showIndex  == context.clonePages.length) {
                    return;
                } else {
                    context.showPage(showIndex,'left');
                }
            });
        },

        initializeWindowSizeChangeEventHandler : function(){
            var context = this;
            $(window).resize(function (e) {
                if (context.isShowing) {
                    context.adjustPreviewPosition();
                    context.adjustPreviewSize();
                }
            });
        },
        
        findPreviewZoomOnWindowSize : function(){
            var windowWidth = $(window).innerWidth();
            var windowHeight = $(window).innerHeight();;

            var targetZoom = 0;
			var offsetWidth = 200;
            
            for (var zoom = 100; zoom > 10 ; zoom = zoom - 5) {
                if (this.previewHeight * (zoom / 100)  + offsetWidth<  windowHeight) {
                    targetZoom = zoom;
                    break;
                }
            }
            return targetZoom;
        },

		adjustPreviewPosition : function() {
			var previewCenterX = parseInt(this.previewWidth / 2);
			var previewCenterY = parseInt(this.previewHeight / 2);

			var windowWidth = $(window).innerWidth();
			var windowHeight = $(window).innerHeight();
			
			var windowCenterX = parseInt(windowWidth / 2);
			var windowCenterY = parseInt(windowHeight / 2);

			this.$previewWrapper.css('left', (windowCenterX - (this.previewWidth/2)) + 'px');
			this.$previewWrapper.css('top', 50 + 'px');

			this.$previewWrapper.css('width', (this.previewWidth) + 'px');
			this.$previewWrapper.css('height', (this.previewHeight + 50) + 'px');

			this.$preview.css('width', this.previewWidth + 'px');
			this.$preview.css('height', this.previewHeight + 'px');
		},
		
		 adjustPreviewSize: function () {
			var scale = this.findPreviewZoomOnWindowSize() / 100;
			var origin = "50% 0%";
			this.$previewWrapper.css({'-moz-transform-origin' : origin,'transform-origin' : origin,'-ms-transform-origin' : origin,'-webkit-transform-origin' : origin});
			this.$previewWrapper.css({transform : 'scale(' + scale + ',' + scale + ' )'});
		},
		
		showPage: function (index, animDirection) {
            var pageStr = (index + 1) + " of " + this.clonePages.length;
            $('.prePage').html(pageStr);
            //처음 실행하는 경우 
            if (this.curPageInx == -1) {
                $(this.clonePages[index]).show();
                this.curPageInx = index;
                return;
            }

            if (this.curPageInx != -1) {
                if (animDirection == 'left') {
                    $(this.clonePages[this.curPageInx]).animate({ 'left': '-' + this.$preview.width() + 'px'}, 200);
                    $(this.clonePages[index]).show();
                    $(this.clonePages[index]).css('left', parseInt(this.$preview.width()) + "px");
                    $(this.clonePages[index]).css('top', "0px");
                    $(this.clonePages[index]).animate({ 'left' : '0px'}, 200);
                    this.curPageInx = index;
                }

                if (animDirection == 'right') {
                    $(this.clonePages[this.curPageInx]).animate({'left': this.$preview.width() + 'px'}, 200);
                    $(this.clonePages[index]).show();
                    $(this.clonePages[index]).css('left', '-' + parseInt(this.$preview.width()) + "px");
                    $(this.clonePages[index]).css('top', "0px");
                    $(this.clonePages[index]).animate({'left': '0px'}, 200);
                    this.curPageInx = index;
                }
            }
        },
        
		
		startPreview: function () {
            if ($('.editor-page').length < 1) {
                alert("현재 페이지가 존재하지 않아 Preview 를 할 수 없습니다");
                return;
            }
			
			this.previewWidth =  EggbonEditor.project.resolutionWidth;
            this.previewHeight= EggbonEditor.project.resolutionHeight;
			
			this.$previewContainer = $(EggbonEditor.previewWindowHTML);
			this.$previewContainer.prependTo($('body'));
			this.$preview = this.$previewContainer.find('.preview_content');
			this.$previewWrapper = this.$previewContainer.find('.preWrap'),

			this.initializeNextPreEventHandler();
            this.initializeCloseEventHandler();
            this.initializeWindowSizeChangeEventHandler();

            this.clonePages = $('.editor-page').clone();
            this.clonePagesLength = this.clonePages.length;

            this.$preview.append(this.clonePages);
            this.initCloneDom();

            this.addKeyEventHandler();
            this.adjustPreviewPosition();
            this.adjustPreviewSize();
            this.$previewContainer.show(this.curPageInx);
            this.showPage(0, 'left');
            this.isShowing = true;
        },
		
		/*
		 * 외부에서 프리뷰 생성을 위한 외부 호출 인터페이스
		 * (프로젝트도 생성을 하기위해서는 별도의 함수를 작성) 
		*/
		callExternalPreview : function(memberSeq, projectSeq){
			if (!memberSeq || !projectSeq) {
				alert("Error occured in calling a function preview : wroing parameter");
				return;
			}
			
			console.log('### 로트할 템플릿 정보');
			console.log(memberSeq + " :" + projectSeq);

			var context = this;
			EggbonEditor.api.callRemoteApi('loadTemplate', {member_seq : memberSeq, project_seq : projectSeq}, function(result){
				if (result.resultCode != 0 || !result.searchResult || result.searchResult == ''){
					alert("There is no project");
					return;
				}
				console.log("#### [callExternalPreview] 프로젝트 원본 정보 (json)");
				console.log(result);
				context.startPreviewFromJsonObject(result.searchResult); 
			});	
		},

		/*
		 * Json 데이타로 부터 preview 를 위한 dom 구조 생성 혹은 프로젝트 구조를 생성하기 위한 실제 작업 함수 
		 * params 
		*/
		startPreviewFromJsonObject : function(project){
           	/* Proejct resolution for adjusting canvas size*/
           	this.previewProject = project; 
			this.previewWidth =  project.width_size;
            this.previewHeight = project.height_size;
            console.log(" ############  프로젝트 해상도 #############" );
			console.log(this.resolutionWidth+ ' : ' + this.projectHeight );
			
			this.$previewContainer = $(EggbonEditor.previewWindowHTML);
			this.$previewContainer.prependTo($('body'));
			this.$preview = this.$previewContainer.find('.preview_content');
			this.$previewWrapper = this.$previewContainer.find('.preWrap');
			
			if (EggbonEditor.newPageWindow){
				if (EggbonEditor.newPageWindow.isShown) EggbonEditor.newPageWindow.hideTemporary();
			}
			
			this.initializeNextPreEventHandler();
            this.initializeCloseEventHandler();
            this.initializeWindowSizeChangeEventHandler();

            this.createProjectDomStructure(project);
            this.clonePagesLength = this.clonePages.length;
            this.$preview.append(this.clonePages);

            this.addKeyEventHandler();
            this.adjustPreviewPosition();
            this.adjustPreviewSize();
           
           	this.$previewContainer.show();
            this.showPage(0, 'left');
            this.isShowing = true;
		},

		createProjectDomStructure : function(project){
			console.log('선택 템플릿 : ' + project.prj_name);
	
			var context = this;
			console.log('## 변환되기 전의 프로젝트 정보' );
			console.log(JSON.parse(project.menu_json));
			
			var pageInfo =  EggbonEditor.convertScreenData(JSON.parse(project.menu_json));
			console.log('## 변환된 후의  프로젝트 정보' );
			console.log(pageInfo);
			
			this.header = pageInfo.HEADER;
			var pageId = pageInfo.PAGELIST.id;
			var pages = pageInfo.PAGELIST.PAGE;
			var tempClonePages = [];
			
			$.each(pages, function(index, page){
				var pageYpos = page.ypos; 
				var pageYpos= page.xpos;
				var pageWidth = page.width;
				var pageHeight= page.height; 
				var pageName = page.name;
				var pageId = page.id;
				
				var $page = $('<div></div>').addClass('editor-page').addClass("page").addClass('page-border').addClass(pageId)
					.css({'left' : pageYpos + "px",	'top' : pageYpos + "px",'width' : pageWidth + 'px',	'height' : pageHeight+ 'px', 'position' : 'absolute','display':'none'});
				
				if (page.IMAGECOMP){
					$.each(page.IMAGECOMP, function(inx, comp) {
						context.createDomAndAppend($page, comp, 'image');
					}); 
				}
				
				if (page.LINKBUTTONCOMP){
					$.each(page.LINKBUTTONCOMP, function(inx, comp) {
						context.createDomAndAppend($page, comp, 'link');
					}); 
				}
				
				if (page.ORDERBUTTONCOMP){
					$.each(page.ORDERBUTTONCOMP, function(inx, comp) {
						context.createDomAndAppend($page, comp, 'order');
					}); 
				}
				
				if (page.LISTCOMP) context.createListComponent($page, page.LISTCOMP , 'list');
				//if (page.POPUPPAGE) context.createPopupComponent($page, page.POPUPPAGE ,'popup');
				
				if (page.TEXTCOMP){
					$.each(page.TEXTCOMP, function(inx, comp) {
						context.createDomAndAppend($page, comp, 'text');
					}); 
				}
				tempClonePages.push($page);	
			});	
			
			this.clonePages = tempClonePages;
		},
		
		createListComponent : function($container, listComponentArr) {
			var context = this;
			if (listComponentArr && listComponentArr.length > 0) {
				$.each(listComponentArr, function(index, list) {
					var $list = context.createDomAndAppend($container, list, 'list');
					if (list.LISTROW && list.LISTROW.length > 0) {
						$.each(list.LISTROW, function(inx, listRow) {
							var $listRow = context.createDomAndAppend($list, listRow, 'listrow');
							
							if (listRow.IMAGECOMP){
								$.each(listRow.IMAGECOMP, function(inx, comp) {
									context.createDomAndAppend($listRow, comp, 'image');
								}); 
							}
							
							if (listRow.LINKBUTTONCOMP){
								$.each(listRow.LINKBUTTONCOMP, function(inx, comp) {
									context.createDomAndAppend($listRow, comp, 'link');
								}); 
							}
							
							if (listRow.ORDERBUTTONCOMP){
								$.each(listRow.ORDERBUTTONCOMP, function(inx, comp) {
									context.createDomAndAppend($listRow, comp, 'order');
								}); 
							}
							
							if (listRow.TEXTCOMP){
								$.each(listRow.TEXTCOMP, function(inx, comp) {
									context.createDomAndAppend($listRow, comp, 'text');
								}); 
							}
						});
					}
				});
			}
		},

		createPopupComponent : function($container, popupArr) {
			var context = this;
			if (popupArr || popupArr.length > 0) {
				$.each(popupArr, function(index, popup) {
					var $poupup = context.createDomAndAppend($container, popup, 'popup');
					
					if (popup.IMAGECOMP){
						$.each(popup.IMAGECOMP, function(inx, comp) {
							context.createDomAndAppend($poupup, comp, 'image');
						}); 
					}
					
					if (popup.LINKBUTTONCOMP){
						$.each(popup.LINKBUTTONCOMP, function(inx, comp) {
							context.createDomAndAppend($poupup, comp, 'link');
						}); 
					}
					
					if (popup.ORDERBUTTONCOMP){
						$.each(popup.ORDERBUTTONCOMP, function(inx, comp) {
							context.createDomAndAppend($poupup, comp, 'order');
						}); 
					}
					
					if (popup.LISTCOMP) context.createListComponent($poupup, popup.LISTCOMP , 'list');
					
					if (popup.TEXTCOMP){
						$.each(popup.TEXTCOMP, function(inx, comp) {
							context.createDomAndAppend($poupup, comp, 'text');
						}); 
					}		
				});
			}
		},
		
		createDomAndAppend : function($container, component, componentType) {
			if (componentType == 'image') {
				var $img = $("<img/>");
				$img.addClass("component").addClass("component-image").data('component', 'image')
					.attr('src', EggbonEditor.resource.getImageResourcePathByBasePath(this.header.base_path, component.src, 'image'));
				$img.css({'left' : component.xpos + "px",'top' : component.ypos + "px",'width' : component.width + 'px','height' : component.height + 'px','position' : 'absolute'});
				$container.append($img);
				if ($img.attr('src') == '' || 
             		$img.attr('src') == 'undefined' || 
             		$img.attr('src') == 'none' ||  
             		$img.attr('src' )== EggbonEditor.resource.getDefaultResourcePath('image')){
             		$img.css('opacity', 0);
             	} 
				return $img;
			}
			
			if (componentType == 'order') {
				var $order = $("<img/>");
				$order.addClass("component").addClass("component-order").data('component', 'order')
					.attr('src', EggbonEditor.resource.getImageResourcePathByBasePath(this.header.base_path, component.src,'order'));
				$order.css({'left' : component.xpos + "px",'top' : component.ypos + "px",'width' : component.width + 'px','height' : component.height + 'px','position' : 'absolute'});
				$order.attr('menu', this.isNullOrUndefined(component.menutitle)) ? '' : component.menutitle;
				$order.attr('price', this.isNullOrUndefined(component.price)) ? '' : component.price;
				$container.append($order);
				if ($order.attr('src') == '' || 
             		$order.attr('src') == 'undefined' || 
             		$order.attr('src') == 'none' ||  
             		$order.attr('src' )== EggbonEditor.resource.getDefaultResourcePath('order')){
             		$order.css('opacity', 0);
             	} 
				return $order;
			}
			
			if (componentType == 'link') {
				if (component.linktype == "YouTube"){
					var $youTubeElem  = $('<iframe frameborder="0" allowfullscreen></iframe>');
					$youTubeElem.addClass("component").addClass("component-link").data('component', 'link');
             		$youTubeElem.css({'left' : component.xpos + "px",'top' : component.ypos + "px",'width' : component.width + 'px','height' : component.height + 'px','position' : 'absolute'});
             		$youTubeElem.attr('linktype', this.isNullOrUndefined(component.linktype)) ? "" : component.linktype;
					$youTubeElem.attr('position', component.target);
             		$youTubeElem.attr('src', EggbonEditor.resource.createYoutubeLInk(component.target));
             		$container.append($youTubeElem);
					return $youTubeElem;
				}else {
					var $link = $("<img/>");
					$link.addClass("component").addClass("component-link").data('component', 'link')
						.attr('src', EggbonEditor.resource.getImageResourcePathByBasePath(this.header.base_path, component.src,  'link'));
					$link.css({'left' : component.xpos + "px",'top' : component.ypos + "px",'width' : component.width + 'px','height' : component.height + 'px','position' : 'absolute'});
					$link.attr('linktype', this.isNullOrUndefined(component.linktype)) ? "" : component.linktype;
					$link.attr('position', component.target);
					$container.append($link);
					if ($link.attr('src') == '' || 
             			$link.attr('src') == 'undefined' || 
             			$link.attr('src') == 'none' ||  
             			$link.attr('src' )== EggbonEditor.resource.getDefaultResourcePath('link')){
             			$link.css('opacity', 0);
             		} 
					return $link;
				}
			}

			if (componentType == 'text') {
				var $text = $("<div></div>");
				$text.addClass("component").addClass("component-text").addClass("component-text-area").data('component', 'text');
				$text.css({
					'background-color' : 'rgba(255,255,255,0)','border' : '0',
					'left' : component.xpos + "px",'top' : component.ypos + "px",'width' : component.width + 'px',
					'height' : component.height + 'px','position' : 'absolute','font-size' : component.font_size,'color' : component.color,'font-family' : component.font_family
				});
				$text.html(decodeURIComponent(component.content_text));
				$container.append($text);
				return $text;
			}
			
			if (componentType == "list") {
				var $list = $("<div></div>");
				$list.addClass("component").addClass("component-list").data('component', 'list');
				$list.css({ 
					'left' : component.xpos + 'px',
					'top' : component.ypos + 'px', 
					'width' : component.width + 'px', 
					'height' : component.height + 'px',
					'position' : 'absolute',
					'overflow-y' : 'auto',
					'overflow-x' : 'hidden'
				});
				$container.append($list);
				return $list;
			}

			if (componentType == "listrow") {
				var $listrow = $("<div></div>");
				$listrow.addClass("component").addClass("component-listrow").data('component', 'listrow');
				$listrow.css({
					'left' : component.xpos + 'px',
					'top' : component.ypos + 'px',
					'width' : $container.width(),
					'height' : component.height + 'px',
					'position' : 'absolute'
				});
				$container.append($listrow);
				return $listrow;
			}

			if (componentType == "popup") {
				var $popup = $("<div></div>");
				$popup.addClass("component").addClass("component-popup").data('component', 'popup');
				$popup.css({'left' : component.xpos + "px",'top' : component.ypos + "px",'width' : component.width + 'px','height' : component.height + 'px','position' : 'absolute'});
				$container.append($popup);
				return $popup;
			}
		},
		
		isNullOrUndefined : function(str){
			if (!str || str == '' || str=="undefined") return true;
			else return false;
		},

        initCloneDom: function () {
            var context = this;
            $('.preview_content .editor-page').css({"position" : 'absolute' , 'cursor' : 'default'});
            $('.preview_content .editor-page').hide();  // first hide all page 
            $('.preview_content .editor-page').removeClass('cross_grid_line');   // remove grid line
            $('.preview_content .component_border').remove(); //remove gray panels for popup  in editing mode
            $('.preview_content .component').css({'cursor' : 'default'});
            $('.preview_content .gray_panel').remove(); //remove gray panels for popup  in editing mode
            $('.preview_content .component-list').css({
                'background-color': '#FFFFFF',
            });

            //add buttons for closing popups
            $('.preview_content .component-popup').append(
                   $('<i style ="color : #34a7c1" class ="fa fa-close fa-2x"></i>')
                   	.css({'position': 'absolute','top': '5px','right': '5px','cursor':'pointer'})
					.bind('click', function (event) {
                       $(this).parent().parent().parent().fadeOut(100);
                  })
             );
            $('.preview_content .component-popup').css({'border' : '1px solid #bbbbbb', 'cursor' : 'default'});
            $('.preview_content .component-list').css({'background-color' : 'rgba(255,255,255,0)', 'overflow' :  'auto'});
            $('.preview_content .component-listrow').css({'background-color' : 'rgb(255,255,255,0)'});
            $('.preview_content .component-link').each(function(index){
             	var linktype  = $(this).attr('linktype');
             	var position  = $(this).attr('position');
             	
             	if (linktype == 'YouTube'){
             		var $youTubeElem  = $('<iframe frameborder="0" allowfullscreen></iframe>');
             		$youTubeElem.width($(this).parent().width());
             		$youTubeElem.height($(this).parent().height());
             		$youTubeElem.attr('src', EggbonEditor.resource.createYoutubeLInk(position));
             		$(this).replaceWith($youTubeElem);
             	}else {
             		if ($(this).attr('src') == '' || 
             			$(this).attr('src') == 'undefined' || 
             			$(this).attr('src') == 'none' ||  
             			$(this).attr('src' )== EggbonEditor.resource.getDefaultResourcePath('link')){
             			$(this).css('opacity', 0);
             		} 
             	}
             });
            
            $('.preview_content .component-order').css('cursor', 'pointer').bind('click', function (e) {context.handleOrder(this);});
            $('.preview_content .component-link').css('cursor', 'pointer').bind('click', function (e) {
                	var linktype  = $(this).attr('linktype');
             		var position  = $(this).attr('position');
             		if (linktype !='YouTube') context.handleLink(this);
            });
			
			 $('.preview_content .component-image').each(function(event){
			 		if ($(this).attr('src') == '' || $(this).attr('src') == 'undefined' || 
             			$(this).attr('src') == 'none' ||  $(this).attr('src' )== EggbonEditor.resource.getDefaultResourcePath('image')){
             			$(this).css('opacity', 0);
             		} 
			 });
            
             $('.preview_content .component-order').each(function(index){
             		if ($(this).attr('src') == '' || $(this).attr('src') == 'undefined' || 
             			$(this).attr('src') == 'none' ||  $(this).attr('src' )== EggbonEditor.resource.getDefaultResourcePath('order')){
             			$(this).css('opacity', 0);
             		} 
             });
             $('.preview_content .component-text').each(function(index){if ($(this).text() =='') $(this).attr('placeholder', '');});
        },

        handleLink : function(eventSource){
            var linkType = $(eventSource).attr('linktype');
            var position = $(eventSource).attr('position');
            if (!position || position == '') {
                alert("the position of the link component not defined!!");
                return;
            }

            switch (linkType) {
                case "PageLink":
                    var linkPageIndex = -1;
                    $('.preview_content .editor-page').each(function (index) {
                        if ($(this).hasClass(position)) {
                            linkPageIndex = index;
                            return;
                        }
                    });
                    this.showPage(linkPageIndex, "right");
                    break;
                case "Web":
                    alert("Open the the specified web [" +  position  + "]");
                    break;
                case "Popup":
                    $('#' + position).fadeIn(100);
                    break;
                case "Phonenumber":
                    alert("calling " + position);
                    break;
                 case "Email":
                    alert("send a E-mail to  " + position);
                    break;
                 case "Map":
                    alert("Map   " + position);
                    break;
                case "MallInMall":
                    alert("redirect to a mall of  " + position);
                    break;
            }
        },

        handleOrder : function(eventSource){
            var menu = $(eventSource).attr('menu');
            var price = $(eventSource).attr('price');
            alert(" Order : " + menu + " (  " + price + " )"); 
        },

        addKeyEventHandler: function () {
            var context = this;
            this.$previewContainer.keydown(function (e) {
                if (e.keyCode == 27) {
                    context.close();
                }
                
                if (e.keyCode == 37) { // left
                    var showIndex = context.curPageInx - 1;
                    if (showIndex < 0) {
                        return;
                    } else {
                        context.showPage(showIndex);
                    }
                }
                
                if (e.keyCode == 39) { // right
                    var showIndex = context.curPageInx + 1;
                    if (showIndex == context.clonePages.length) {
                        return;
                    } else {
                        context.showPage(showIndex);
                    }
                }
            });
        },

        close: function () {
            this.clonePages.length = 0;
            this.clonePagesLength = 0;
            this.$preview.empty();
            this.curPageInx = -1;
            this.$previewContainer.hide();
            this.isShowing = false;
            this.previewWidth = 0;
            this.previewHeight = 0; 
            this.prevewProject = null;
	
        },
    };
    EggbonEditor.preview.init();
});


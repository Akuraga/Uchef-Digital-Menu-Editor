EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.contextMenu= {
    	requestActionEnums : {'PAGE' : 1, 'COMPONENT' : 2, 'NONE' : 3},
        isShown: false,
        selector : $(EggbonEditor.contextHTML),
        
        initControl: function () {
            this.selector.appendTo($('body'));
            this.selector.css('position', 'absolute');
            this.selectorZIndex = this.selector.css('zIndex');
            this.initializeEventHandlers();
            this.selector.hide();
        },

        initializeEventHandlers : function(){
            var context  = this;
            this.selector.find('.action').bind('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var action = $(this).data('action');
                context.handleEvent(action);
                context.close();
            });

            this.addShortCutEventHandler();  // 단축 키 이벤트 핸들러 등록 
        },
        
        addShortCutEventHandler : function () {
            var context = this;
            $(document).bind('keydown', function (e) {
                var action = "";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'c'))  action = "copy";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'x'))  action = "cut";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'v'))  action = "paste";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'd'))  action = "delete";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'f'))   action = "front";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'b'))  action = "back";
                if (e.ctrlKey && (String.fromCharCode(e.which).toLowerCase() === 'n'))  action = "new page";
          		if (action != "") {
                	e.preventDefault();
                	e.stopPropagation();
                	var node = EggbonEditor.controller.$tree.tree("getSelectedNode");
                	context.requestType = node.data.type == 'page' ? context.requestActionEnums.PAGE : context.requestActionEnums.COMPONENT;
                    context.handleEvent.call(context, action);
                 	context.close();
                }
            });
        },

        show: function (propertyType, x, y) {
            this.requestType = propertyType;
            if (this.isShown) this.close();
            
            var selectedComponent = EggbonEditor.getSelectedComponent();
            var childButtons = EggbonEditor.controller.getMenuSet(selectedComponent);

            EggbonEditor.controller.applyToolButtonChange(selectedComponent);
            this.showComponentInContext(childButtons);
            
			var windowX = window.screenX;
			var windowY = window.screenY;
			var windowWidth = $(window).width();
			var windowHeight = $(window).height();
			var windowRigth  = windowX + windowWidth;
			var windowHeight = windowY + windowHeight;
			
            this.isShown = true;
            this.selector.show();

           	x = x + this.selector.width()  + 15 >= windowWidth ?  x  - this.selector.width()  -15  : x+ 5;  
			y = y + this.selector.height() + 15 >= windowHeight ? y - this.selector.height() - 15 : y;  
            
            this.selector.css('left', x);
            this.selector.css('top', y);
            this.selector.css('zIndex', '99999');
        },

        //컨텍스트 메뉴에 사용될 수 있는 컴포넌트 삽입 메뉴 
        showComponentInContext: function (childButtons) {
            $('li .rbtn').hide();
            $.each(childButtons, function (i, childButton) {
                $("li button." + childButton + "_btn").show();
            });
        },

        close: function () {
            if (!this.isShown) return;
            $('li .rbtn').show();
            $("li.buttonmenu").show();
            this.selector.hide();
            this.isShown = false;
            this.selector.css('zIndex', this.selectorZIndex);
            //this.removeShortCutEventHandler();  // 단축키 이벤트 핸들러 해제 
        },
		
        canContextAction : function(actionName){
            if (EggbonEditor.multiSelectionRect.getMultiSelectedComponentCount() > 1){
                alert("현재 다중 선택상의 " + actionName + " 액션은 지원하지 않습니다");
                return false;
            }else {
                return true;
            }
        },

        handleEvent: function (action) {
            var cType = null;
            var selectedPage = EggbonEditor.getSelectedPage();
            var selectedComponent = EggbonEditor.getSelectedComponent();

            switch (action) {
            	//해당 페이지의 모든 컴포넌트 제거
                case "clear_all":
                    selectedPage.clearAll();
                    return;
                case "toggle_grid_line":
                    if (selectedPage.$pageHolderSelector.hasClass("cross_grid_line")) {
                        selectedPage.$pageHolderSelector.removeClass("cross_grid_line");
                        $(".toggle_grid_text").html("Show Grid");
                    } else {
                        selectedPage.$pageHolderSelector.addClass("cross_grid_line");
                        $(".toggle_grid_text").html("Hide Grid");
                    }
                    return;
                    
                case "copy":
                    if (!this.canContextAction(action)) return;
                    if (selectedComponent != null) EggbonEditor.clipBoard.set(selectedComponent);
                    return;
                    
                case "cut":
                    if (!this.canContextAction(action)) return;
                    if (selectedComponent.type == "popup") EggbonEditor.controller.enableBeforeGrayPanel(false, null);

                    if (selectedComponent != null) {
                        selectedPage.removeComponent(selectedComponent);
                        EggbonEditor.setSelectedComponent(null);
						EggbonEditor.clipBoard.set(selectedComponent);
                        if (selectedPage.childs.length == 0) EggbonEditor.controller.applyToolButtonChange( EggbonEditor.getSelectedPage());
                        EggbonEditor.controller.enableBeforeGrayPanel(false, null);
                    }
                    return;
                
                case "paste":
                    if (!this.canContextAction(action)) return;
                    var sourceComponent  = EggbonEditor.clipBoard.get();
                    if (!sourceComponent) return;
                    
					var  container = null; 
					var selectedComponent = EggbonEditor.getSelectedComponent();
					
					if (!selectedComponent){
						if (sourceCompoent.type == 'listrow') {
							alert('listrow can`t be add to any components except listcomponent' );
							container = null;
						}else {
							container = EggbonEditor.getSelectedPage();
						}
					}else {
						if (sourceComponent.type == "listrow"){
							if  (selectedComponent.type !='list'){
								alert('listrow can`t be add to any components except listcomponent' );
								container = null;
							}else container = selectedComponent;
						}else if ( selectedComponent.type == 'listrow' || selectedComponent.type == 'popup'){
							container = selectedComponent;
						}else {
							container = selectedComponent.parent;
						} 
					}
					
					if (container){
						var pasteComponent = container.createComponent(sourceComponent.type, false, false);
						EggbonEditor.cloneComponentForContextAction(pasteComponent , sourceComponent);
						pasteComponent.parent.addComponent(pasteComponent);
                    	EggbonEditor.attchComponentForContextAction(pasteComponent);
                    	
                    	pasteComponent.setSelectStatus(true);
                   		pasteComponent.selectStatus = true;
                    	EggbonEditor.setSelectedComponent(pasteComponent);
                    	/*
                    	 *복사된 컴포넌트의 부모가 리스트 로우 일경우, 리스트 로우에서 안보이는 영역에 위치할 수 있기 때문에 컴포넌트의 위치를 조정 
                    	 */
                    	if (selectedComponent.type == 'listrow'){
                    		pasteComponent.setPositionAndWidth(
                    			10,10, pasteComponent.width,pasteComponent.height
                    		);
                    	}
	                   
					} 
					EggbonEditor.clipBoard.reset();                   
                    return;

                case "delete":
                    if (!this.canContextAction(action)) return;
                    if (this.requestType == this.requestActionEnums.PAGE) {
                    	if (confirm("페이지내의 모든 컴포넌트도 삭제가 됩니다. 진행하시겠습니까") == true) {
							EggbonEditor.removePage(selectedPage);
                        	EggbonEditor.setSelectedComponent(null);
							EggbonEditor.setSelectedPage(null);
						}
                       
                    } else if (this.requestType == this.requestActionEnums.COMPONENT){
                    	if (selectedComponent){
		                    if (selectedComponent.type == "popup") EggbonEditor.controller.enableBeforeGrayPanel(false, null);
                    		selectedComponent.parent.removeComponent(selectedComponent);
                        	
                        	if (selectedPage.childs.length == 0)  EggbonEditor.controller.applyToolButtonChange(EggbonEditor.getSelectedPage());
                        	EggbonEditor.setSelectedComponent(null);
                       }
                    }
                    return;
                    
                case "front":return;
                case "back":return;
                case "new_page":EggbonEditor.project.createPage();break;
                case "in_img":cType = "image";break;
                case "in_txt":cType = "text";break;
                case "in_link":cType = "link";break;
                case "in_order":cType = "order";break;
                case "in_popup":cType = "popup";break;
                case "in_list":cType = "list";break;
                case "in_listrow":cType = "listrow";break;
            }

            if (cType) {
                var selectedPage = EggbonEditor.getSelectedPage();
                var selectedComponent = EggbonEditor.getSelectedComponent();
                var component = "";
                if (selectedComponent) {
                    if (selectedComponent.parent.type == "listrow" || selectedComponent.parent.type == "list" || selectedComponent.parent.type == "popup") {
                        component = selectedComponent.parent.createComponent(cType, true);
                        component.attach();
                        component.setSelectStatus(true);
                        component.selectStatus = true;
                        EggbonEditor.setSelectedComponent(component);
                    }

                    else if (selectedComponent.type == "listrow" || selectedComponent.type == "list" || selectedComponent.type == "popup") {
                        component = selectedComponent.createComponent(cType, true);
                        component.parent = selectedComponent;
                        component.attach();
                        component.setSelectStatus(true);
                        component.selectStatus = true;
                        EggbonEditor.setSelectedComponent(component);
                    } else {
                        component = selectedPage.createComponent(cType, true);
                        component.attach();
                        component.setSelectStatus(true);
                        component.selectStatus = true;
                        EggbonEditor.setSelectedComponent(component);
                    }
                } else {
                    component = selectedPage.createComponent(cType, true);
                    component.attach();
                    component.setSelectStatus(true);
                    component.selectStatus = true;
                    EggbonEditor.setSelectedComponent(component);
                }
                EggbonEditor.controller.applyToolButtonChange(component);
                event.stopPropagation();
            }
        },
        
        removeShortCutEventHandler: function () {
            $('.shortcut').off('keydown', function (e) { });
        },
        
        copyPopupChilds: function (copy, original) {
            $.each(original.childs, function (index, child) {
                var component = copy.createComponent(child.type);
                component.x = child.x;
                component.y = child.y;
                component.width = child.width;
                component.height = child.height;
                component.fixRatio = child.fixRatio;

                switch (component.type) {
                    case "image":
                        component.imgPath = child.imgPath;
                        break;
                    case "text":
                        component.text = child.text;
                        component.fontFamily = child.fontFamily;
                        component.fontSize = child.fontSize;
                        component.color = child.color;
                        break;
                    case "link":
                        component.imgPath = child.imgPath;
                        component.linkType = child.linkType;
                        component.position = child.position;
                        break;
                    case "order":
                        component.imgPath = child.imgPath;
                        component.menu = child.menu;
                        component.price = child.price;
                        component.menuId = child.menuId;
                        component.unit = child.unit;
                        component.stock = child.stock;
                        break;
                }
            });
        },

        copyListChilds: function(copyList, originalList){
            $.each(originalList.childs, function (index, child) {
                var component = copyList.createComponent(child.type);
                component.x = child.x;
                component.y = child.y;
                component.width = child.width;
                component.height = child.height;
                component.fixRatio = child.fixRatio;

                $.each(child.childs, function (index, child) {
                    var childComponent = component.createComponent(child.type);
                    switch (component.type) {
                        case "image":
                            component.imgPath = child.imgPath;
                            break;
                        case "text":
                            component.text = child.text;
                            component.fontFamily = child.fontFamily;
                            component.fontSize = child.fontSize;
                            component.color = child.color;
                            break;
                        case "link":
                            component.imgPath = child.imgPath;
                            component.linkType = child.linkType;
                            component.position = child.position;
                            break;
                        case "order":
                             component.imgPath = child.imgPath;
                       		component.menu = child.menu;
                        	component.price = child.price;
                        	component.menuId = child.menuId;
                        	component.unit = child.unit;
                        	component.stock = child.stock;
                            break;
                     }
                });
            });
        },

        clone: function (copy, original) {
            copy.x = original.x;
            copy.y = original.y;
            copy.width = original.width;
            copy.height = original.height;
            copy.fixRatio = original.fixRatio;
            
            switch (original.type) {
                case "image":
                    copy.imgPath = original.imgPath;
                    break;
                case "text":
                    copy.text = original.text;
                    copy.fontFamily = original.fontFamily;
                    copy.fontSize = original.fontSize;
                    copy.color = original.color;
                    break;
                case "link":
                    copy.imgPath = original.imgPath;
                    copy.linkType = original.linkType;
                    copy.position = original.position;
                    break;
                case "order":
                    copy.imgPath = original.imgPath;
                    copy.menu = original.menu;
                    copy.price = original.price;
                    copy.menuId = original.menuId;
                    copy.stock = original.stock;
                    copy.unit = original.unit;
                    break;
                case "popup":
                    if (original.childs.length > 0) {
                        this.copyPopupChilds(copy, original);
                    }
                    copy.permitComponents = original.permitComponents.slice(0);
                    break;
                case "list":
                    if (original.childs.length > 0) {
                        this.copyListChilds(copy, original);
                    }
                    break;
                case "listrow":
                    copy.childs = original.childs.slice(0);
                    copy.permitComponents = original.permitComponents.slice(0);
            }
        }
    };
    EggbonEditor.contextMenu.initControl();
});


EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.controller = {
        selectTooButtonContainer: '',
        curZoom: 100,
        canvasWidth: 0,
        canvasHeight: 0,
        scale: 1,
        snapValue: 1,
        $snap: "",
        rulerTopStartX: 0,
        rulerLeftStartY: 0,
        tool_buttons: [
             { sel: '#tool_image', type: 'image', fn: this.clickSelect, evt: 'click', key: ['I', true], childButtons: []},
             { sel: '#tool_text', type: 'text', fn: this.clickSelect, evt: 'click', key: ['T', true], childButtons: []},
             { sel: '#tool_link', type: 'link', fn: this.clickSelect, evt: 'click', key: ['L', true], childButtons: []},
             { sel: '#tool_popup', type: 'popup', fn: this.clickSelect, evt: 'click', key: ['N', true], childButtons: ['image', 'text', 'link', 'order', 'list'] },
             { sel: '#tool_order', type: 'order', fn: this.clickSelect, evt: 'click', key: ['O', true], childButtons: [] },
             { sel: '#tool_list', type: 'list', fn: this.clickSelect, evt: 'click', key: ['L', true], childButtons: ['listrow'] },
             { sel: '#tool_listrow', type: 'listrow', fn: this.clickSelect, evt: 'click', key: ['R', true], childButtons: ['image', 'text', 'link', 'order'] }
        ],

        getMenuSet : function(component){
            var childButtons = this.findChildButtons(component);
            if (childButtons.length < 1) {
                childButtons = this.findChildButtons(component.parent);
                return childButtons;
                
            } else {
                return childButtons;
            }
        },

        findChildButtons: function (component) {
            var childButtons = '';
            if (!component || component.type == "page") {
                return ['image', 'text', 'link', 'order', 'popup', 'list'];
            }
            
            $.each(this.tool_buttons, function (inx, button) {
                if (button.type == component.type) {
                    childButtons = button.childButtons;
                    return;
                }
            });
            return childButtons;
        },

        applyToolButtonChange: function (component) {
            var showToolButtons = '';
            if (!component ||  component.type == 'page') {
                showToolButtons = ['image', 'text', 'link', 'order', 'popup', 'list'];
            } else {
                showToolButtons = this.getMenuSet(component);
            }
            $.each(this.tool_buttons, function (i, tool_button) {
                   $(tool_button.sel).hide();
             });

            $.each(showToolButtons, function (i, childButton) {
                $("#tool_" + childButton).show();
            });
        },
        
        get: function (key) {return this[key];},
        set: function (key, value) {this[key] = value;},

        setComCount: function (pageSelector, count) {
            $(pageSelector + ' ' + '.com_count').html("&nbsp;(" + count + ")");
        },

        init: function () {
            this.initializeContextMenuEventHandler();
            this.initializePreviewEventHandler();
            this.initializeDocumentClickHandler();
            this.setProjectInfo();
            this.initTree();
            this.initializeAlignBtnEventHandler();

            this.initializeToolButtonEvent();
            $('#logo_btn').click(function () {$(EggbonEditor.holder).width(800); });
            this.initailizeAddPageEventHandler();
            this.initailizecreateProejctEventHandler();
            this.initailizeSaveProejctEventHandler();
            this.initailizeSnapEventHandler();
            //this.initializeEscEventHandler();
            this.initailizeKeyEventHandler();
            //this.initailizeFullScreenEventHandler();
            //this.intializeTransferToImgEventHandler();
        },
        
        initailizeKeyEventHandler : function () {
            var context = this;
            $(document).bind('keydown', function (e) {
            	//Reset editor  by ESC key 
            	if (e.keyCode == 27) { 
            	  	context.resetEditor();
            	  	return; 
                }
            });
        },
        
        initailizeFullScreenEventHandler : function(){
        	  var context = this;
        	  $(".btn_full_screen").click(function(){
        	  	$(document).fullScreen(true);
        	  });
        	  
        	  $(document).bind("fullscreenchange", function() {
        	  	if ($(document).fullScreen()){
        	  		context.propertyWindowCss = {
        	  			'left' : EggbonEditor.propertyWindow.positionX, 
        	  			'top' : EggbonEditor.propertyWindow.positionY, 
        	  		};
        	  		
					context.contentContainerCss = {
        	  			'left' : $('.content_container').css('left'),
        	  			'top' : $('.content_container').css('top'),
        	  			'background-color' : $('.content_container').css('background-color'),
        	  			'width' : $('.content_container').css('width'),
        	  			'height' : $('.content_container').css('height')
        	  		}; 
        	  		context.verticalTableCss = {'background-color' : $('.vertical_table').css('background-color')};
        	  	
        	  		$('.content_container').css({'left' : '0px', 'top' : '0px','background-color' : '#000','width' : screen.width + 'px', 'height' : screen.height + 'px'});
        	  		$('.vertical_table').css({'background-color' : '#000'});
        	  		EggbonEditor.propertyWindow.setPropertyWindowPos(25,25);        	  	
        	  		
        	  		var offsetX = 10;
        	  		var offsetY = 10;
        	  		$.each(EggbonEditor.project.pages, function(inx, page){
        	  			page.$pageHolderSelector.css({'position' : 'absolute', /*'width' : '100px', 'height' : '500px', */ 'display':'block', 'left' : offsetX + 'px', 'top' : offsetY + 'px'});
						offsetX += 40;        
						//offsetY +=50;        
        	  		});
        	  			
        	  	}else {
        	  		$('.content_container').css(context.contentContainerCss);
			    	$('.vertical_table').css(context.verticalTableCss);
			    		$.each(EggbonEditor.project.pages, function(inx, page){
        	  			page.$pageHolderSelector.css({'position' : 'relative','display':'none', 'left' : '0px', 'top' : '0px'});
        	  		});
        	  		EggbonEditor.showPage(EggbonEditor.getSelectedPage().UUID,EggbonEditor.getSelectedPage().name );
        	  		EggbonEditor.propertyWindow.setPropertyWindowPos(context.propertyWindowCss.left,context.propertyWindowCss.top);        	  		
        	  	}
			});
			
			$(document).bind("fullscreenerror", function() {
   				 alert("Browser rejected fullscreen change");
			});
        },
		

		// html 을 이미지로 변환
		intializeTransferToImgEventHandler : function() {
			$('.btn_html2canvas').click(function(event) {
				html2canvas($('.page'), {
					allowTaint : true,
					logging : true,
					background : '#FF0000',
					timeout : 0, 
					proxy : "html2canvasproxy.ashx",      
					onrendered : function(canvas) {
						var imgData = canvas.toDataURL("image/png");
						console.log(imgData);
						//window.open(imgData);
						console.log(canvas.width + " : "  + canvas.height);
						var imageWin = window.open("", "imageWin", "width=" + 1000 + ",height=" + canvas.height);
						imageWin.document.write("<html><body style='margin:0'>");
						imageWin.document.write("</body><html>");
						imageWin.document.title = "html2Canvas";
						imageWin.document.body.appendChild(canvas);
						
					}
				});
			});
		},
		
		initailizeSaveProejctEventHandler : function(){
			$('div.btn_save').click(function(e){
				EggbonEditor.project.saveProject();
			});
		},

        initailizecreateProejctEventHandler : function(){
            $('.btn_create_project').click(function (event) {
                EggbonEditor.projectWindow.show();
            });
        },
        initializeEscEventHandler: function () {
            var context = this;
            $(document).keydown(function (e) {
                if (e.keyCode == 27) {
                    context.resetEditor();
                }
            });
        },

        initializeDocumentClickHandler: function () {
            var context = this;
            $(EggbonEditor.holder).bind('mousedown', function (event) {
                if (!event.ctrlKey) {
                    context.resetEditor();
                }else {
                }
            });
        },

        initializeAlignBtnEventHandler : function(){
            $('.aligntoolbar .align').click(function (event) {
                EggbonEditor.multiSelectionRect.handleAlignAction(this);
            });
        },

        resetEditor : function(){
        	var selectedPage = EggbonEditor.getSelectedPage();
            EggbonEditor.changeAllComponentSelectStatus(selectedPage, false);
        	var pageNode = EggbonEditor.controller.$tree.tree("getNodeById", selectedPage.UUID);
            EggbonEditor.controller.$tree.tree("selectNode", pageNode );
            EggbonEditor.contextMenu.close();
            EggbonEditor.controller.applyToolButtonChange(selectedPage);
            EggbonEditor.setSelectedComponent(null);
            this.enableBeforeGrayPanel(false, null);
            
            EggbonEditor.propertyWindow.closePropertyWindow();
            EggbonEditor.multiSelectionRect.resetSelection();
            EggbonEditor.project.isComponentAction = false;
        },

        initializeContextMenuEventHandler: function () {
            var context = this;
            $(EggbonEditor.holder).bind("contextmenu", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.ctrlKey) {
	                EggbonEditor.contextMenu.close();
	                return;
                }
                EggbonEditor.contextMenu.show(
                	EggbonEditor.contextMenu.requestActionEnums.COMPONENT, event.pageX, event.pageY);
            });
        },

        initializePreviewEventHandler: function () {
            var context = this;
            $('.btn_preview').click(function (e) {
                e.preventDefault();
                EggbonEditor.changeAllComponentSelectStatus(EggbonEditor.getSelectedPage(),false);
                EggbonEditor.multiSelectionRect.resetSelection();
                EggbonEditor.preview.startPreview();
            });
        },

    

        initializeContextMenuEventHandler2: function () {
            var context = this;
            $(EggbonEditor.editorPane).bind("mosedown", function (event) {
            	if (event.ctrl){
            		return;
            	}
            	if (event.which == 3) {
            		event.stopPropagation();
                	event.preventDefault();
                	EggbonEditor.contextMenu.close();
            	}
            });
        },

        initializeWindowSizeChangeEventHandler: function () {
            var context = this;
            $(window).resize(function (e) {
                EggbonEditor.canvas.findZooomOnWindowSize();
                EggbonEditor.canvas.initCanvas();
                EggbonEditor.canvas.adjustCanvas();
                EggbonEditor.canvas.adjustRuler();
            });
        },

        initTree: function () {
            var context = this;
            //project root node 생성
            var data = [
               {
                    label: EggbonEditor.project.projectName,
                    id: EggbonEditor.project.projectName,
                    type: "root",
                    data: {
                        fullName: "proejct",
                        name: "proejct"
                    }
                },
            ];

            this.$tree = $('#page_sidebar');
            var rootNode = this.$tree.tree(
                {
                    onCreateLi: function (node, li) {
                        if (node.type != 'root') {
                            var nodeAlertId = ['alert', node.data.UUID].join('_');
                            li.find('.jqtree-title').after(
                                $('<span class = "fa fa-question-circle-o" style ="margin-left : 40px;color:#FF0000;margin-left : 5px" id ="' + nodeAlertId + '"></span>').hide()
                            );
                            var iconClass = "";
                            switch (node.data.type) {
                                case "image": iconClass = "fa-file-image-o"; break;
                                case "text": iconClass = "fa-font"; break;
                                case "order": iconClass = "fa-shopping-cart"; break;
                                case "link": iconClass = "fa-link"; break;
                                case "list": iconClass = "fa-list-alt"; break;
                                case "listrow": iconClass = "fa-list-alt"; break;
                                case "popup": iconClass = "fa-clipboard"; break;
                                case "page": iconClass = "fa-file-o"; break;
                            }

                            li.find('.jqtree-title').before($('<span></span>').addClass('fa').addClass(iconClass)).css('margin-left', '10px');
                            if (node.type == 'page') {
                                li.find('.' + iconClass).parent().addClass('component_page');
                                if (li.find('.' + iconClass).prev().length >0 ) {
                                    li.find('.' + iconClass).parent().css('padding-left', (node.getLevel() * 10 + 20) + 'px');
                                } else {
                                    li.find('.' + iconClass).parent().css('padding-left', (node.getLevel() * 10 + 40) + 'px');
                                }
                            } else {
                                if (li.find('.' + iconClass).prev().length > 0) {
                                    li.find('.' + iconClass).parent().css('padding-left', (node.getLevel() * 10 + 20) + 'px');
                                } else {
                                    li.find('.' + iconClass).parent().css('padding-left', (node.getLevel() * 10 + 40 ) + 'px');
                                }
                            }
                        }
                    },
                    dragAndDrop: true,
                    autoOpen: false,
                    keyboardSupport: false ,
                    data: data
                });
          
            this.$tree.bind('tree.click', function (event) {
                EggbonEditor.contextMenu.close();
                var node = event.node;
                var name = node.name;
                var UUID = node.id;
                var nodeType =node.type; 
                var component = node.data;
       		
                
                //for (var name in node.element){
                //    console.log(name);
                //}

                if (context.$tree.tree('isNodeSelected', node)) {
                	EggbonEditor.contextMenu.close();
                    var nodeX = $(node.element).offset().left;
                    var nodeY = $(node.element).offset().top;
                    var updateTextDiv = $('<div class ="updateTextDiv" style ="position:absolute"></div>');
                    
                    var adjustWidth = $(node.element).width();
                    var adjustHeight = $(node.element).height();
                    
                    if (context.IsNodeOpen(node.id)) {
                        adjustHeight = adjustHeight / (node.children.length + 1);
                    }

                    var updateText = $("<input></input>").attr(
                        {
                            type: "text",
                            name: "updateText",
                            id: "updateText",
                            value: node.name,
                        })
                        .addClass('updateText')
                        .css(
                        {
                            border: '1px 1 #DDDDDD',
                            width: adjustWidth,
                            height: adjustHeight
                        })
                        .appendTo(updateTextDiv);
                    updateTextDiv.appendTo('body');
                    updateTextDiv.css({ left: nodeX, top: nodeY});
                    //updateText.select();
                    updateText.bind('keydown', function (e) {
                        if (e.which == 13) {
                            if ($(this).val().length == 0 || $(this).val() == '') {
                                alert("이름은 공백이 될 수 없습니다");
                                updateText.val(name);
                                $(this).focus();
                                return;
                            }
                            
                            var pageNode = null ; 
                            if (nodeType != 'page'){
                            	var parentArr = [];
                            	EggbonEditor.findParentsRecursive(parentArr, node.data);
                            	pageNode = context.$tree.tree('getNodeById',parentArr[0].UUID ); 
                            }
                            
                            if (node.name != $(this).val()){
                            	//부모 pageNode 가 없다면 본인지 페이지 , 이 경우 페이지 타이틀 중복 쳌 
                     		 	//부모 pageNode 가 있다면 특정 페이지내의 컴포넌트로, 해당 페이지의 같은 컴포넌트의 이름 중복 조사
                            	var result = context.isResiteredNodeIdOrName(pageNode, nodeType, $(this).val());
								if (result){
									alert("already name or id");
									updateText.val(name);
									$(this).focus();
									return;
								}
							}
							if (node.type == 'page'){
								console.log("node");
								console.log(node.data);
								 node.data.displayName = $(this).val();
							}else {
								 node.data.displayName = node.data.name = $(this).val(); 
							}
                            if (node.type != "page" && node.type != "root") {
                                node.data.enablePropertyWindow(true);
                            }
                            context.$tree.tree('updateNode', node, $(this).val());
                            updateText.unbind('keydown');
                            updateTextDiv.remove();
                        }
                    }).
                       bind('focusout', function (e) {
                            if ($(this).val().length == 0 || $(this).val() == '') {
                                alert("이름은 공백이 될 수 없습니다");
                                updateText.val(name); 
                                $(this).focus();
                                return;
                            }
                            
                            var pageNode = null ; 
                            if (nodeType != 'page'){
                            	var parentArr = [];
                            	EggbonEditor.findParentsRecursive(parentArr, node.data);
                            	pageNode = context.$tree.tree('getNodeById',parentArr[0].UUID ); 
                            }
                            
                     		 if (node.name != $(this).val()){
                     		 	//부모 pageNode 가 없다면 본인지 페이지 , 이 경우 페이지 타이틀 중복 쳌 
                     		 	//부모 pageNode 가 있다면 특정 페이지내의 컴포넌트로, 해당 페이지의 같은 컴포넌트의 이름 중복 조사
                            	var result = context.isResiteredNodeIdOrName(pageNode, nodeType, $(this).val());
								if (result){
									alert("already name or id");
									updateText.val(name);
									$(this).focus();
									return;
								}
							}
							if (node.type == 'page'){
								 node.data.displayName = $(this).val();
								 console.log("node");
								console.log(node.data);
							}else {
								 node.data.displayName = node.data.name = $(this).val(); 
							}
							
                            if (node.type != "page" && node.type != "root") {
                                node.data.enablePropertyWindow(true);
                            }
							context.$tree.tree('updateNode', node, $(this).val());
                            updateText.unbind('focusout');
                            updateTextDiv.remove();
                        });
                    updateText.focus();
                    return;
                }

                $('.updateText').trigger('blur');
                context.enableBeforeGrayPanel(false);
                EggbonEditor.changeAllComponentSelectStatus(EggbonEditor.getSelectedPage(),false);

                if (event.node.type && event.node.type == "root") {
                    /* can't select a root node*/
                    event.preventDefault();
                    return;
                }

                if (component.type == "page") {
                    EggbonEditor.setSelectedPage(node.data);
                    EggbonEditor.showPage(UUID, name);
                } else {
                    var parentArr = [];
                    EggbonEditor.findParentsRecursive(parentArr, component);
                    EggbonEditor.setSelectedPage(parentArr[0]);
                    EggbonEditor.showPage(parentArr[0].UUID, name);
                    component.setSelectStatus(true);
                    var parentNode = context.$tree.tree("getNodeById", parentArr[0].UUID);
                    context.$tree.tree('selectNode', parentNode);
                }
                EggbonEditor.controller.applyToolButtonChange(component);
            });
            
            this.$tree.bind('tree.move', function (event) {context.handleTreeMoveEvent(event);});
            this.$tree.bind('tree.contextmenu', function (event) {
                var node = context.$tree.tree("getNodeById", event.node.data.UUID);
                context.$tree.tree('selectNode', node);
                var type = event.node.data.type;
                if (type == 'page') {
                    EggbonEditor.setSelectedPage(event.node.data);
                    EggbonEditor.setSelectedComponent(null);
                } else {
                	var parentArr = [];
                	 EggbonEditor.findParentsRecursive(parentArr, event.node.data);
                     EggbonEditor.setSelectedPage(parentArr[0]);
                     EggbonEditor.setSelectedComponent(event.node.data);
                }
                
                EggbonEditor.contextMenu.show(
                	event.node.data.type == 'page' ? 
                		EggbonEditor.contextMenu.requestActionEnums.PAGE : EggbonEditor.contextMenu.requestActionEnums.COMPONENT, 
                	event.click_event.pageX, 
                	event.click_event.pageY
                );
            });

            $('.btn-tree-expand').click(function (event) {
                if ($(this).hasClass("expand")) {
                    $(this).removeClass("expand");
                    $(this).addClass("collapse");
                    $('.fa-sort-desc').show();
                    $('.fa-sort-asc').hide();
                    var rootNode = context.$tree.tree('getTree');
                    for (var i = 0; i < rootNode.children.length; i++) {
                        var child = rootNode.children[i];
                        context.$tree.tree("openNode", child);
                    }
                } else {
                    $(this).removeClass("collapse");
                    $(this).addClass("expand");
                    $('.fa-sort-desc').hide();
                    $('.fa-sort-asc').show();
                    var rootNode = context.$tree.tree('getTree');
                    for (var i = 0; i < rootNode.children.length; i++) {
                        var child = rootNode.children[i];
                        context.$tree.tree("closeNode", child);
                    }
                }
            });
            
            $(document).on('mouseover', 'ul.jqtree-tree .component_page', function(event){
            	//$(this).css({'background-color': '#84DCC8'});
            	$(this).parent().css({'background-color': '#F0F4F7'});
            });
            
            $(document).on('mouseout', 'ul.jqtree-tree .component_page', function(event){
            	$(this).parent().css({'background-color': '#ffffff'});
            });
        },
		
		isResiteredNodeIdOrName : function(pageNode, nodeType, name) {
			var result = false;
			console.log(pageNode);
			var tree = !pageNode || pageNode == null ? this.$tree.tree('getTree') : pageNode;
			
			tree.iterate(function(node) {
				if (node.type == nodeType) {
					if  (node.name == name || node.fullName == name){
					result = true;
					return false;
					// stop iterating
					}
				} else {
					return true;
					// continue iterating
				}
			});
			return result;
		},
		
        initailizeSnapEventHandler : function(){
            var context = this;
            this.$snap = $('#snap_select');
            this.$snap.val(this.snapValue);
            this.$snap.change(function (event) {
                context.snapValue = parseInt($(this).val());
            });
        },

        canDroppable: function (dropType, dragType) {
            var permittables = EggbonEditor.componentType[dropType].permittableChildComps;
            var permit = false;
            for (var i = 0; i < permittables.length ; i++) {
                if (permittables[i] == dragType) {
                    permit = true;
                    break;
                }
            }
            return permit;
        },

        canMovable: function (dropNode, dragNode) { return true;},

        handleTreeMoveEvent: function (event) {
            event.preventDefault();
            console.log('moved_node : ', event.move_info.moved_node.data.name);
            console.log('target_node : ', event.move_info.target_node.data.name);
            console.log('position', event.move_info.position);
            console.log("-------------------------------------");

            var moved_node = event.move_info.moved_node;
            var target_node = event.move_info.target_node;
            
            var moved_comp = moved_node.data;
            var target_comp = target_node.data;
            var position = event.move_info.position;
      		
            switch (position) {
                case 'inside':
                    //이동 노드가 페이지이거나  혹은 이동할 수  없는 root 노드 일경우, 최상위 레벨이므로 인덱스 변경으로 조정
                    if (target_node.type == "root" && moved_node.type == "page") {
                    	console.log("1");
                        this.moveComponentAfter(event, target_node, moved_node);
                        return;
                    }

                    //inside 라고 할지라도 해당 노드가 열려 있으면, 인덱스 변경으로 조정
                    if (this.IsNodeOpen(target_node.id)) {
                        this.moveComponentAfter(event, target_node, moved_node);
                        console.log("2");
                        return;
                    };

                    if (!this.canDroppable(target_node.type, moved_node.type)) return;
                    this.moveComponentInside(event, target_node, moved_node);
                    console.log("3");
                    break;
                    
                case 'after':
                    if (!this.canMovable(target_node, moved_node)) return;
                    this.moveComponentAfter(event, target_node, moved_node);
                    console.log("4");
                    break;
                case "before":
                	if(target_node.type == 'root') return;
                break;
            }
        },
        
        isNodeSelected: function (UUID) {
            var isSelected = false;
            var treeStats = this.$tree.tree('getState');
            $.each(treeStats.selected_node, function (index, nodeId) {
                if (UUID == nodeId)
                    isSelected = true;
                return;
            });
            return isSelected;
        },

        IsNodeOpen: function (UUID) {
            var isOpen = false;
            var treeStats = this.$tree.tree('getState');
            $.each(treeStats.open_nodes, function (index, nodeId) {
                if (UUID == nodeId)
                    isOpen = true;
                return;
            });
            return isOpen;
        },

        moveComponentInside: function (treeMoveEvent, target_node, moved_node) {
            treeMoveEvent.move_info.do_move();
            var newComponent = EggbonEditor.cloneComponent(target_node.data, moved_node.data,true,true);
            newComponent.setSelectStatus(true);
            newComponent.selectStatus = true;
            EggbonEditor.showPageFromChild(newComponent);
            EggbonEditor.setSelectedComponent(newComponent);
            moved_node.data.parent.removeComponent(moved_node.data);
        },

        moveComponentAfter: function (treeMoveEvent, target_node, moved_node) {
            var context = this;

            //페이지는 프로젝트 루트 및 페이지 after 로만 이동이 가능
            if (moved_node.type == "page") {
                //가장 첫번째 인덱스로 페이지 조정
                if (target_node.type == 'root') {
                    //Dom object 위치 변경
                    treeMoveEvent.move_info.do_move();
                    this.$tree.tree('selectNode', moved_node);
                    var target_page1 = "";
                    
                    EggbonEditor.project.pages.splice(0,0,moved_node.data);
                    $(target_page1.pageHolderSelectorStr).before($(moved_node.data.pageHolderSelectorStr));
                    EggbonEditor.showPage(moved_node.data.UUID, moved_node.data.name);
                    return;
                }

                if (target_node.type == 'page') {
                    treeMoveEvent.move_info.do_move();
                    this.$tree.tree('selectNode', moved_node);
                    var index = -1;
                    $.each(EggbonEditor.project.pages, function(inx, page){
                    	if (page.UUID == target_node.data.UUID){
                    		index = inx;
                    	}
                    });
                    
                    if (index != -1){
                   		EggbonEditor.project.pages.splice(index,0,moved_node.data);
                    }
                    
                    $(target_node.data.pageHolderSelectorStr).after($(moved_node.data.pageHolderSelectorStr));
                    EggbonEditor.showPage(moved_node.data.UUID, moved_node.data.name);
                    return;
                }
            }

            //드래그 컴포넌트가 page 가 아닌 일반 컴포넌트의 경우
            //when a drag component is a common component except a page component 
            if (moved_node.type != 'page') {
                if (moved_node.type == "listrow") {
                    if (target_node.type != 'list' && target_node.type != 'listrow') return;
                }

                //일반 컴포넌트는 page와 root 등과 같은 레벨에 존재할 수 없음.
                if (target_node.type == 'root') return;
                if (target_node.type == 'page') {
                    if (!this.IsNodeOpen(target_node.id)) return;
                }

                var dropComp = target_node.data;
                var dragComp = moved_node.data;

                //컨테이너 컴포넌트의 경우, 컨테이너 컴포넌의 첫번째 자식 컴포넌트 앞으로 이동
                if (dropComp.type == 'page' || dropComp.type == 'list' || dropComp.type == 'popup' || dropComp.type == 'listrow') {
                    dropComp = target_node.children[0].data;
                    $(dropComp.externalWrapperQueryStr).before($(dragComp.externalWrapperQueryStr));
                }
                else {
                    //컨테이너 컴포넌트가 아닐 경우, 해당 컴포넌트의 앞으로 이동
                    $(dropComp.externalWrapperQueryStr).after($(dragComp.externalWrapperQueryStr));
                }
                //move the source component
                treeMoveEvent.move_info.do_move();
                //show the page of the moved component 
                EggbonEditor.showPageFromChild(dropComp);
            }
        },
        
        enableBeforeGrayPanel: function (enable, component) {
            if (enable) {
                var grayPanel = $(EggbonEditor.grayPanelstr).css("background-color", "#000000").css('opacity', 0.3);
                $(component.externalWrapperQueryStr).before(grayPanel);
            } else {
                $(".gray_panel").remove();
            }
        },

        treeContextmenuClicked: function (event) {
            var node = event.node;
            var name = node.name;  // 노드 등록시 설정한 label property
            var id = node.id;
        },

        setProjectInfo: function () {
        	var project_des = EggbonEditor.project.projectName + 
        		'  ('+ EggbonEditor.project.resolutionWidth + ' X '+ EggbonEditor.project.resolutionHeight +  ')';
            $('#project_name').html(project_des);
        },

        initializeToolButtonEvent: function () {
            var context = this;
            $.each(context.tool_buttons, function (i, opts) {
                var btn;
                if (opts.sel) {
                    btn = $(opts.sel);
                    if (btn.length == 0) {
                        //console.log("there is not a selctor");
                        return;
                    } else {
                        //console.log("there is a selctor")
                    }
                    if (opts.evt) {
                        //if (eggbonEditop.browser.isTouch() && opts.evt === 'click') {
                        //    opts.evt = 'mousedown';
                        //}
                        btn[opts.evt](context.toolButtonEventClosure());
                        // btn[opts.evt](opts.fn);
                    }
                }
            });
        },

        initailizeAddPageEventHandler: function () {
            var context = this;
            $('.btn_addpage').click(function (e) {
                e.preventDefault();
                EggbonEditor.newPageWindow.show();
            });
        },

        genPageTreeJsonData: function (page) {
            return {label: page.pageName,id: page.pageName};
        },

        toolButtonEventClosure: function () {
            var context = this;
            return function (e) {
                var target = $(e.target);
                var cType = target.attr('data-comp');
                var project = EggbonEditor.getProject();
                var selectedPage = EggbonEditor.getSelectedPage();
                var selectedComponent = EggbonEditor.getSelectedComponent();
                var newComponent= '';
                var container;
                var menusetComponent;

                if (selectedPage) {
                    if (selectedComponent) {
                        var componentInfo= selectedComponent.isContainer();
                        if (componentInfo.isContainer) {
                            container = selectedComponent;
                        } else {
                            container = selectedComponent.parent;
                        }

                        newComponent = container.createComponent(cType, true, true);
                        newComponent.attach();
                        newComponent.setSelectStatus(true);
                        menusetComponent = newComponent;

                        if (newComponent.type == "list") {
                            var listrow = newComponent.createComponent('listrow', true, true);
                            listrow.attach();
                            EggbonEditor.setSelectedComponent(listrow);
                            listrow.setSelectStatus(true);
                            menusetComponent = listrow;
                        }
                    } else {
                        newComponent = selectedPage.createComponent(cType, true, true);
                        newComponent.attach();
                        newComponent.setSelectStatus(true);
                        menusetComponent = newComponent;

                        if (newComponent.type == "list") {
                            var listrow = newComponent.createComponent('listrow', true, true);
                            listrow.attach();
                            EggbonEditor.setSelectedComponent(listrow);
                            listrow.setSelectStatus(true);
                            menusetComponent = listrow;
                        }
                    }
                 
                } else {
                    alert("선택한 페이지가 없습니다. 페이지를 선택하시거나 페이지를 새로 생성하세요");
                    return;
                }
                context.applyToolButtonChange(menusetComponent);
                event.stopPropagation();
                if (context.toolButtonClick()) {
                } else {
                    return;
                }
            };
        },

        getToolButtonContainer: function () {
            selectedComponent = EggbonEditor.getSelectedComponent();
            if (!selectedComponent) {
                return "page";
            }
            if (selectedComponent) {
                if (selectedComponent.parent.type == 'list' ||
                    selectedComponent.parent.type == 'listrow' ||
                    selectedComponent.parent.type == 'popup') {

                    return selectedComponent.parent.type;
                } else {
                    return selectedComponent.type;
                }
            } else {
                return "page";
            }
        },

        toolButtonClick: function (button, noHiding) {
            return true;
        },
    };
    //EggbonEditor.controller.applyToolButtonChange('image');
});
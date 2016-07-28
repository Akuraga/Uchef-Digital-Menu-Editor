EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.multiSelectionRect= {
        mouseX: 0,
        mouseY: 0,
        $multiSelectRect  : "",
        // 드래그 관련 변수, 0이면 아무런 상태 아님, 1이면 드래그 상태, 3이면 복수 객체 선택 상태
        selectionActionEnum : {
            none : 0,
            drag : 1,
            dragSelect: 2,
            ctrlSelect : 3,
        },

        selectionDirectionEnum: {
            topLeft : -1,
            bottomRight: 1,
            topRight : 2,
            bottomLeft : -2
        },
        curSelectionAction: "",
        $alignActionDialog: "",
        $$multiSelectRect: "",
        selectionComponentArr: [],
        selectionDirection: 0,
        selectionContainer :'',

        isComponentSelected : function(){return this.selectionComponentArr.length > 0 ? true : false;},
         

        init: function () {
            this.curSelectionAction = this.selectionActionEnum.none;
            this.initializeSelectionRectEventHandler();
            this.initializeAlignDialogEventHandler();
        },

        //특정 영역에서 셀렉션 이벤트를 생성 
        //addSelectionEventHanderInContainer : function(selector){
        //    this.resetSelection();
        //    this.initializeSelectionRectEventHandler(selector);
        //    this.selectionContainer = selector;
        //},

        
        //셀렉션 초기화 함수, 기본으로 body 실렉션 이벤트를 생성 
        initializeSelectionRectEventHandler: function (selector) {
            var targetContainer = selector ? selector : "body";
            var context = this;
            $(EggbonEditor.multiSelectStr).appendTo(targetContainer);
            this.$multiSelectRect = $('.multi_select').width(0).height(0).hide();
            
            /*컨테이너 영역에서도  선택 기능이 가능하도록 하려면  selector 를 EggbonEditor.holder 로 변경 
             EggbonEditor.page
             #vertical_table
             * */
            $(document).on('mousedown', '#vertical_table', /*EggbonEditor.holder*/  function (event) {
                if (event.ctrlKey) {
                	//console.log("## Multi Selection started");
                    if (context.curSelectionAction == context.selectionActionEnum.none) {
                        context.curSelectionAction = context.selectionActionEnum.drag;
                        context.mouseX = event.pageX;
                        context.mouseY = event.pageY;
                        context.$multiSelectRect.css('left', context.mouseX);
                        context.$multiSelectRect.css('top', context.mouseY);
                    };
                }
            })
            .bind('mousemove', function (event) {
                if (context.curSelectionAction  == context.selectionActionEnum.drag) {
                	//console.log("## Multi Selection Drag started");
                    var x= event.pageX - context.mouseX;
                    var y = event.pageY - context.mouseY;
     
                    if (x > 0 && y > 0) 
                        context.selectionDirection = context.selectionDirectionEnum.bottomRight;

                    if (x > 0 && y < 0) {
                        var mouseYY = event.pageY - 1;
                        context.$multiSelectRect.css("top", mouseYY);
                        context.selectionDirection = context.selectionDirectionEnum.topRight;
                    }

                    if (x < 0 && y < 0) {
                        var mouseXX = event.pageX - 1;
                        var mouseYY = event.pageY - 1;
                        context.$multiSelectRect.css("left", mouseXX);
                        context.$multiSelectRect.css("top", mouseYY);
                        context.selectionDirection = context.selectionDirectionEnum.topLeft;
                    }

                    if (x < 0 && y > 0) {
                        var mouseXX = event.pageX - 1;
                        context.$multiSelectRect.css("left", mouseXX);
                        context.selectionDirection = context.selectionDirectionEnum.bottomLeft;
                    }

                    x = Math.abs(event.pageX - context.mouseX);
                    y = Math.abs(event.pageY - context.mouseY);

                    context.$multiSelectRect.width(x).height(y);
                    context.$multiSelectRect.show();
                } 
            })
            .bind('mouseup', function (event) {
                if (context.curSelectionAction == context.selectionActionEnum.drag) {
                    var x1 = 0, y1 = 0, x2= 0 ,y2 = 0;
                    if (context.selectionDirection == context.selectionDirectionEnum.topLeft) {
                        x1 = event.pageX;
                        y1 = event.pageY;
                        x2 = event.pageX + (context.mouseX - event.pageX);
                        y2 = event.pageY + (context.mouseY - event.pageY);
                    }
                    else if (context.selectionDirection == context.selectionDirectionEnum.bottomRight) {
                        x1 = context.mouseX;
                        y1 = context.mouseY;
                        x2 = event.pageX;
                        y2 = event.pageY;
                    }
                    else if (context.selectionDirection == context.selectionDirectionEnum.topRight) {
                        x1 = context.mouseX;
                        y1 = context.mouseY - (context.mouseY - event.pageY);
                        x2 = context.mouseX + (event.pageX - context.mouseX);
                        y2 = context.mouseY;
                    }

                    else if (context.selectionDirection == context.selectionDirectionEnum.bottomLeft) {
                        x1 = context.mouseX - (context.mouseX - event.pageX);
                        y1 = context.mouseY;
                        x2 = context.mouseX;
                        y2 = context.mouseY + (event.pageY - context.mouseY);
                    }
                    else {
                        context.resetSelection();
                        return;
                    }
					
                    context.getComponentsInSelectionRect(
                    	x1,//context.getAdjustValueByZoom(x1), 
                    	y1,//context.getAdjustValueByZoom(y1), 
                    	x2,//context.getAdjustValueByZoom(x2),
                    	y2//context.getAdjustValueByZoom(y2)
                    );
                    
                    //1개의 컴포넌트도 드래그로 선택할 수 있도록 변경함 
                    if (context.selectionComponentArr.length > 0) {
                        if (EggbonEditor.getSelectedComponent()) EggbonEditor.getSelectedComponent().setSelectStatus(false);
                        $.each(context.selectionComponentArr, function (index, com) {
                       	
                            $(com.componentBorder)
                                .removeClass('component_border_common')
                                .addClass("component_border_multi_select")
                                .show();
                        });
                        //상단에 정렬툴바가 있으므로, 마우스 위치에 생기는 정렬 액션 레이어 삭제
                        //context.showAlignDialog(event.pageX - 10, event.pageY-40);
                        context.curSelectionAction = context.selectionActionEnum.dragSelect;
                        context.mouseX = 0;
                        context.mouseY = 0;
                        context.$multiSelectRect = $('.multi_select').width(0).height(0).hide();

                    } else {
                        context.resetSelection();
                    }
                }
            });
        },

        addComponentToSelection: function (component) {
            if (!this.isComponentContained(component)) {
                this.selectionComponentArr.push(component);
                component.showBorderSelect();
                component.hideGripTool();
                this.curSelectionAction = this.selectionActionEnum.ctrlSelect;
            }
        },
        
       removeComponentToSelection: function (component) {
            var index = -1;
            $.each(this.selectionComponentArr, function (inx, com) {
                if (com.UUID == component.UUID) {
                    index = inx;
                    return;
                }
            });
            
            if (index != -1) {
            	this.selectionComponentArr.splice(index, 1);
            	component.hideBorderTool();
            	component.hideGripTool();
            }
        },
        
        isMultiSelected : function(){
            return this.curSelectionAction == this.selectionActionEnum.dragSelect ||
                this.curSelectionAction == this.selectionActionEnum.ctrlSelect;
        },

        isComponentContained: function (component) {
            if (this.selectionComponentArr.length < 1) return false;
            var isContained = false;
            $.each(this.selectionComponentArr, function (inx, com) {
                if (com.UUID == component.UUID) {
                    isContained = true;
                    return;
                }
            });
            return isContained;
        },

		getAdjustValueByZoom : function (value) {
			var curZoom = EggbonEditor.canvas.zoom;
			if (curZoom == 100)
				return value;

			var adjustValue = 0;
			if (curZoom < 100)
				adjustValue = parseInt(value / (EggbonEditor.canvas.zoom / 100));
			else
				adjustValue = parseInt((100 * value) / EggbonEditor.canvas.zoom);
			return adjustValue;
		},

        moveMultiSelectedComponent : function(){
            com.setPositionAndWidth(com.x, (sCom.y + sCom.height) - com.height, com.width, com.height);
        },
		
		getMultiSelectedComponentCount : function(){
			return this.selectionComponentArr.length;
		},
		
        getComponentsInSelectionRect: function (x, y, right, bottom) {
			//console.log(' ## selecttino start' );           
			//console.log( x + " : " + y + " : " + right + " : " + bottom  );           
            
            this.selectionComponentArr.length = 0;
            var context = this;
            var searchContainer = EggbonEditor.getSelectedPage();
            var selectedComponent = EggbonEditor.getSelectedComponent();

            if (!selectedComponent) {

            }

            else if (selectedComponent.type == "listrow" || selectedComponent.type == "popup" || selectedComponent.type == "list") {
                searchContainer = selectedComponent;
            }

            //console.log('## 실제 컴포넌트 좌표');
            $.each(searchContainer.childs, function (index, component) {
                var $com = $(component.externalWrapperQueryStr);
            	//console.log( $com.offset().left +  ' : ' + $com.offset().top +  ' : ' + $com.width() +   ' : ' + $com.height());
                if ($com.offset().left >= x && $com.offset().top >= y && $com.offset().left + parseInt($com.width()) <=  right && $com.offset().top + parseInt($com.height()) <= bottom) {
                    context.selectionComponentArr.push(component);
                }
            });
        },

        initializeAlignDialogEventHandler: function () {
            $(EggbonEditor.selectionAfterSelectionStr).appendTo('body');
            this.$alignActionDialog = $('.align_container');
            this.$alignActionDialog.hide();
            this.initializeAlignActionEventHandler();
        },

        initializeAlignActionEventHandler : function(){
            var context = this;
            $('.align_action').click(function () {
                context.handleAlignAction(this);
            });
        },

        handleAlignAction : function(eventSource){
            if (!this.isComponentSelected() ||   
                (this.curSelectionAction != this.selectionActionEnum.dragSelect && this.curSelectionAction != this.selectionActionEnum.ctrlSelect )) {
                this.resetSelection();
                return;
            }
			
            var action = $(eventSource).data('action');
            switch (action) {
                case 'left-most':
                    this.alignLeftMost();
                    break;
                case 'top-most':
                    this.alignTopMost();
                    break;
                case 'bottom-most':
                    this.alignBottomMost();
                    break;
                case 'right-most':
                    this.alignRightMost();
                    break;
                case 'align-h-offset':
                    this.alignHorizontalOffset();
                    break;
                case 'align-v-offset':
                    this.alignVerticalOffset();
                    break;
                case 'align-close':
                    break;
                case 'fill':
                	this.fillContainerWithComponent();
                    break;
            }
            this.resetSelection();
        },
        
        resetSelection: function () {
            $.each(this.selectionComponentArr, function (index, com) {
                com.hideBorderSelect();
            });

            this.selectionComponentArr.length = 0;
            this.curSelectionAction = this.selectionActionEnum.none;
            this.mouseX = 0;
            this.mouseY = 0;
            this.$multiSelectRect.width(0).height(0).hide();
            this.closeAlignDialog();
            this.selectionDirection = 0;
        },

        alignLeftMost : function (){
            this.selectionComponentArr.sort(function (a, b) {
                return a.x - b.x;
            });
            var sCom = "";
            $.each(this.selectionComponentArr, function (index, com) {
                if (index == 0) {
                    sCom = com;
                } else {
                    com.setPositionAndWidth(sCom.x, com.y, com.width, com.height);
                }
            });
        },

        alignTopMost: function () {
            this.selectionComponentArr.sort(function (a, b) {
                return a.y- b.y;
            });
            var sCom = "";
            $.each(this.selectionComponentArr, function (index, com) {
                if (index == 0) {
                    sCom = com;
                } else {
                    com.setPositionAndWidth(com.x, sCom.y, com.width, com.height);
                }
            });
        },

        alignBottomMost: function () {
            this.selectionComponentArr.sort(function (a, b) {
                return (b.y + b.height) - (a.y + a.height);
            });

            var sCom = "";
            $.each(this.selectionComponentArr, function (index, com) {
                if (index == 0) {
                    sCom = com;
                } else {
                    com.setPositionAndWidth(com.x, (sCom.y + sCom.height) - com.height, com.width, com.height);
                }
            });
        },

        alignRightMost: function () {
            this.selectionComponentArr.sort(function (a, b) {
                return (b.x + b.width) - (a.x + a.width);
            });

            var sCom = "";
            $.each(this.selectionComponentArr, function (index, com) {
                if (index == 0) {
                    sCom = com;
                } else {
                    com.setPositionAndWidth((sCom.x + sCom.width) - com.width,  com.y, com.width, com.height);
                }
            });
        },

        //가로 간격 맞춤 
        alignHorizontalOffset: function () {
            /* 2개 이상 정렬*/
            if (this.selectionComponentArr.length < 3) return;
            //x 좌표를 기준으로 오름차순 정렬 
            this.selectionComponentArr.sort(function (a, b) {
                return a.x - b.x;
            });
            
            var firstCom = this.selectionComponentArr[0];
            var lastCom = this.selectionComponentArr[this.selectionComponentArr.length - 1];
            var startX = firstCom.x + (firstCom.width/ 2);
            var endX = lastCom.x + (lastCom.width / 2);
            var offset = parseInt((endX - startX) / (this.selectionComponentArr.length - 1));
            $.each(this.selectionComponentArr, function (inx, com) {
                com.setPositionAndWidth(
                    (startX + (offset * inx)) - (com.width/ 2),
                    com.y,
                    com.width,
                    com.height);
            });
        },

        //세로 간격 맞춤        
        alignVerticalOffset: function () {
            /* 2개 이상 정렬*/
            if (this.selectionComponentArr.length < 3) return;
            //y 좌표를 기준으로 오름차순 정렬
            this.selectionComponentArr.sort(function (a, b) {
                return a.y - b.y;
            });

            var firstCom = this.selectionComponentArr[0];
            var lastCom = this.selectionComponentArr[this.selectionComponentArr.length - 1];
            var startY = firstCom.y + (firstCom.height / 2)  ;
            var endY = lastCom.y + (lastCom.height / 2);
            var offset = parseInt((endY - startY) / (this.selectionComponentArr.length -1));
            $.each(this.selectionComponentArr, function (inx, com) {
                com.setPositionAndWidth(
                    com.x,  
                    (startY + (offset * inx))- (com.height/2),
                    com.width,
                    com.height);
            });
        },

		//부모 컨테이너에 꽉 차게 확대
		fillContainerWithComponent : function(){
			if (this.selectionComponentArr.length > 1) {
				alert('fill action은 단일 컴포넌트만 가능합니다');
				return;
			}
			$.each(this.selectionComponentArr, function (inx, com) {
				var parentContainer = com.parent;
				 var x = 0;
				 var y = 0;
				 
				 //console.log('## >>>> fillContainerWithComponent');
				 //console.log(x + ' : ' + y + ' : ' + parentContainer.width + ' : ' + parentContainer.height  );
				 
				 var width = parentContainer.width;
				 var height = parentContainer.height;
				 //부모 컨테이너이 크기를 꽉 차게 할 때는 .고정 종횡비 기능 off
				 com.fixRatio = false;
				 com.setPositionAndWidth( x, y, x + width, y + height);
            });
		},

        showAlignDialog: function (x, y) {
            this.$alignActionDialog.css("left", x - 10 + "px");
            this.$alignActionDialog.css("top", y - 5 + "px");
            this.$alignActionDialog.show();
        },

        closeAlignDialog: function () {
            this.$alignActionDialog.hide();
        }
    };
});


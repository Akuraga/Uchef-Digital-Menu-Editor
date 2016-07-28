EggbonEditor = EggbonEditor || {};

EggbonEditor.Component = {};

var comInx = 1;
EggbonEditor.Component.build = function (parent, type, options) {
    var com = "";
    switch (type) {
        case "image": com = new EggbonEditor.Component.ImageComponent(parent,options); break;
        case "text": com = new EggbonEditor.Component.TextComponent(parent,options); break;
        case "link": com = new EggbonEditor.Component.LinkComponent(parent,options); break;
        case "order": com = new EggbonEditor.Component.OrderComponent(parent,options); break;
        case "popup": com = new EggbonEditor.Component.PopupComponent(parent,options); break;
        case "list":com = new EggbonEditor.Component.ListComponent(parent,options); break;
        case "listrow": com = new EggbonEditor.Component.ListRowComponent(parent,options); break;
    }
    return com;
};

EggbonEditor.Component.Base = function (componentInx, type, options) {
    if (type) {
        this.selectType = 
        this.isValid = false; 
        this.validationErrorMessages = []; 
        this.type = type;
        this.cornerActionTriggerRadius = this.type == "listrow" ? 0 : 8;
        this.no = componentInx;

        //var baseDefaultOptions = { x: 100, y: 100, width: 100, height: 100, fixRatio: true, name: ""};
        //$.extend(baseDefaultOptions, options);
       // this.extract(baseDefaultOptions);
        this.extract(options);

        //component id format 
        //ex ) component_image_10
        //comInx 는 테스트를 위한 인덱스로 컴포넌트 타입별 인덱스트를 구하는 page 클래스의 createComponentInx 함수를 사용해야 함
        //테스트를 위해서 임시 사용
        
        this.initComponent();
        this.buildDomOject();

        if (this.type == 'listrow') {
            var totalRowHeight = 0;
            if (this.parent.childs.length < 1) {
                this.y = 0;

            } else {
                $.each(this.parent.childs, function (inx, listRow) {
                    totalRowHeight = totalRowHeight + listRow.height;
                });
                this.y = totalRowHeight;
            }
        }

        if (typeof this.parent != 'undefined') {
            var wrapper = this;
            wrapper.resizingBorderStr = EggbonEditor.resizingBorderStr;
            //기존에 보더 라인을 class 로 처리했으나, 이는 보더 두께를 차지 하여, 부자연 스러음
            // --> 그래서 컴포넌트안에 보더 div 를 배치하여 해결
            wrapper.componentBorderLine = EggbonEditor.componentBorderLine;
        }
    }
};

EggbonEditor.Component.Base.prototype.selectEnum = {
    common: 0,
    drag_ctrl_select: 1,
    Move: 9
};

EggbonEditor.Component.Base.prototype.get = function (key) {
    return this[key];
};

EggbonEditor.Component.Base.prototype.setData = function (data) {
    for(var property in data){
    	this[property] = data[property];
    }
    this.refresh();
};

EggbonEditor.Component.Base.prototype.set = function (key, value) {
    this[key] = value;
};

EggbonEditor.Component.Base.prototype.initComponent = function () {
    this.no = this.parent.createComponentNo(this.type);
    
    var parentArr = [];
    var fullNameArr = [];
    EggbonEditor.findParentsRecursive(parentArr, this);
    
    $.each(parentArr, function (index, parent) {
        fullNameArr.push(parent.shortId);
    });
    this.shortId = this.type + this.no;
    fullNameArr.push(this.type + this.no);
    this.id = this.componentId = this.wrapperId = this.fullName = fullNameArr.join('_');
    this.UUID = this.genUUID();
	
	if (!this.name){
		this.name = this.displayName = this.type + this.no;
	}else {
		this.displayName = this.name;
	}    
    
    var currentAction = this.ActionsEnum.None;
    this.isShown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.selectStatus = false;
};

EggbonEditor.Component.Base.prototype.buildDomOject = function () {
    this.wrapperStr =
            '<div  class ="moveActionTrigger eggbon_com" style="cursor : move;position:absolute" id="' + this.wrapperId + '">' +
                '<div  style="position:absolute" class="internalWrapper"></div>' +
            '</div>';
    this.externalWrapperQueryStr = '#' + this.wrapperId;
    this.internalWrapperQueryStr = this.externalWrapperQueryStr + ' .internalWrapper';
    this.originalElementQueryStr =   this.internalWrapperQueryStr  + " .component";

    //action  
    this.moveActionTriggerQueryStr = this.externalWrapperQueryStr ;    // 드래그 액션
    this.topActionTriggerQueryStr = this.externalWrapperQueryStr + ' .topActionTrigger';          // 상단 리사이즈 
    this.bottomActionTriggerQueryStr = this.externalWrapperQueryStr + ' .bottomActionTrigger';  //하단 리사이즈 
    this.leftActionTriggerQueryStr = this.externalWrapperQueryStr + ' .leftActionTrigger';   //좌측 리사이즈 
    this.rightActionTriggerQueryStr = this.externalWrapperQueryStr + ' .rightActionTrigger';  //우측 리사이즈

    this.topLeftActionTriggerQueryStr = this.externalWrapperQueryStr + ' .topLeftActionTrigger';  // 좌측상단 리사이즈
    this.topRightActionTriggerQueryStr = this.externalWrapperQueryStr + ' .topRightActionTrigger';  //우측 상단 리사이즈
    this.bottomLeftActionTriggerQueryStr = this.externalWrapperQueryStr + ' .bottomLeftActionTrigger';  //좌측 하단 리사이즈
    this.bottomRightActionTriggerQueryStr = this.externalWrapperQueryStr + ' .bottomRightActionTrigger';  //우측 하단 리사이즈 

    this.topMiddleActionTriggerQueryStr = this.externalWrapperQueryStr + ' .topMiddleActionTrigger';
    this.leftMiddleActionTriggerQueryStr = this.externalWrapperQueryStr + ' .leftMiddleActionTrigger';
    this.rightMiddleActionTriggerQueryStr = this.externalWrapperQueryStr + ' .rightMiddleActionTrigger';
    this.bottomMiddleActionTriggerQueryStr = this.externalWrapperQueryStr + ' .bottomMiddleActionTrigger';
    this.bottomActionTriggerQueryStr = this.externalWrapperQueryStr + ' .bottomActionTrigger';

    //this.borderDrawingStr = this.externalWrapperQueryStr + " .border_drawing";
    this.resizingGripStr = this.externalWrapperQueryStr + " .resizing_grip";
    this.componentBorder = this.externalWrapperQueryStr + " > .component_border";
    this.resizingGripStrDirectChild = this.externalWrapperQueryStr + "> .resizing_grip";
    this.resizingGropActionStr = this.externalWrapperQueryStr + " .resizing_grip_action";

    // border  및 grip 툴 
    this.topDrawingQueryStr = this.externalWrapperQueryStr + ' .topDrawing';
    this.bottomDrawingQueryStr = this.externalWrapperQueryStr + ' .bottomDrawing';
    this.leftDrawingQueryStr = this.externalWrapperQueryStr + ' .leftDrawing';
    this.rightDrawingQueryStr = this.externalWrapperQueryStr + ' .rightDrawing';
    this.topLeftDrawingQueryStr = this.externalWrapperQueryStr + ' .topLeftDrawing';
    this.topRightDrawingQueryStr = this.externalWrapperQueryStr + ' .topRightDrawing';
    this.bottomLeftDrawingQueryStr = this.externalWrapperQueryStr + ' .bottomLeftDrawing';
    this.bottomRightDrawingQueryStr = this.externalWrapperQueryStr + ' .bottomRightDrawing';
    this.topMiddleDrawingQueryStr = this.externalWrapperQueryStr + ' .topMiddleDrawing';
    this.leftMiddleDrawingQueryStr = this.externalWrapperQueryStr + ' .leftMiddleDrawing';
    this.rightMiddleDrawingQueryStr = this.externalWrapperQueryStr + ' .rightMiddleDrawing';
    this.bottomDrawingQueryStr = this.externalWrapperQueryStr + ' .bottomDrawing';
    this.bottomMiddleDrawingQueryStr = this.externalWrapperQueryStr + ' .bottomMiddleDrawing';

    this.textActionTriggerQueryStr = this.externalWrapperQueryStr + " .text_action_trigger";

    //property window
    this.propertyContainerQueryStr = "#property_container";
};

EggbonEditor.Component.Base.prototype.generateExternalContainerId = function () {

    return 'external_component_' + this.fullName;
};


EggbonEditor.Component.Base.prototype.attach = function () {
    this.createOriginElementByType(this.type);
    
    if (this.parent instanceof EggbonEditor.Page) 
    	this.parent.$pageHolderSelector.append(this.originalElement);
    else 
        $(this.parent.originalElement).append(this.originalElement);
    
    this.createWrapperElement();

    if (this.type == "listrow") 
    	$(this.gripBottomLineStr).show();
    else 
        $(this.gripBottomLineStr).remove();
    
    if (this.type == "popup") $(this.externalWrapperQueryStr).css('z-index', 10000);
};

EggbonEditor.Component.Base.prototype.detach = function () {
    $(this.externalWrapperQueryStr).remove();
    EggbonEditor.propertyWindow.closePropertyWindow();
};

EggbonEditor.Component.Base.prototype.remove= function () {
    this.detach();
};


EggbonEditor.Component.Base.prototype.createWrapperElement = function () {
    this.addWrapperElements();
    this.initializeEventHandlers();
    this.adjustWrapper();
};


//component 타입에 맞는 svg ,jquery 객체를 생성 
EggbonEditor.Component.Base.prototype.createOriginElementByType = function (type) {

    // 현재 캔버스 축소 확대 비율에 맞게 생성 컴포넌트의 위치 및 사이즈 조정 
    var rX = this.x;
    var rY =  this.y;
    var rWidth = this.width;
    var rHeight =this.height;
    //console.log("컴포넌트 : " + this.type);
    //console.log(rX + " : " + rY + " : " + rWidth + " : " + rHeight);

    switch (type) {
        case "image":
            this.originalElementStr = '<img  class ="component component-image" data-component ="image" src =\"' + this.imgPath + '\" style="left:' + rX + 'px;top:' + rY + 'px;width:' + rWidth + 'px;height:' + rHeight + 'px;position:absolute" ></img>';
            this.originalElement = $(this.originalElementStr);
            break;
        case "text":
            this.originalElementStr =
                    '<div style="left:' + rX + 'px;top:' + rY + 'px;width:' + rWidth+ 'px;height:' + rHeight+ 'px;position:absolute;overflow:hidden;text-overflow:hidden" >' +
                      //  '<span class ="text_action_trigger" style ="width : 100%">' + this.placeHolder + '</span>' +
                        '<textarea data-component ="text" placeholder="Insert Text" class ="component component-text text_input_area" style ="outline: none;width:100%;height:100%;border-color: Transparent;font-size :' + this.fontSize + ';font-family : ' + this.fontFamily + ';color : ' + this.color + ';background-color: rgba(0,0,0,0);overflow:visible">' + this.text + '</textarea>' +
                    '</div>';
            //'<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" style="left:' + this.x + 'px;top:' + this.y + 'px;width:' + this.width + 'px;height:' + this.height + 'px;position:absolute" class="mySvgs">' +
            //    ' <rect x="0" y="0" width="100%" height="100%"  fill="#DDDDDD" rx="10" ry="10" stroke-width="5"/>' +
            //'</svg>';
            this.originalElement = $(this.originalElementStr);
            break;
        case "link":
            this.originalElementStr =
                '<img  class ="component component-link" data-component ="link" position ="' + this.position + '" linktype = "' + this.linkType + '" src =\"' + this.imgPath + '\" style="left:' + rX + 'px;top:' + rY + 'px;width:' + rWidth + 'px;height:' + rHeight + 'px;position:absolute" ></img>';
            this.originalElement = $(this.originalElementStr);
            break;
        case "order":
            this.originalElementStr = '<img  class ="component component-order" data-component ="order" menuId ="'+ this.menuId+ '" price ="' + this.price + '" menu ="' + this.menu + '"src =\"' + this.imgPath + '\" style="left:' + rX + 'px;top:' + rY + 'px;width:' + rWidth + 'px;height:' + rHeight + 'px;position:absolute" ></img>';
            this.originalElement = $(this.originalElementStr);
            break;
        case "popup":
            this.width = rWidth = EggbonEditor.project.resolutionWidth - (this.x * 2);
            this.height = rHeight = EggbonEditor.project.resolutionHeight - (this.y *2);
            this.originalElementStr =
                '<div class ="component component-popup" data-component ="popup" style="left:' + rX + 'px;top:' + rY + 'px;width:' + rWidth + 'px;height:' + rHeight + 'px;position:absolute;overflow:hidden;text-overflow:hidden;background:#FFFFFF" >' +
                    //'<rect x="0" y="0" width="100%" height="100%"  fill="#eee"  stroke-width="5"/>' +
                    //'<text x="27%" y="47%" fill="green" font-size="55">Pop Up</text>' +
                '</div>';
            this.originalElement = $(this.originalElementStr);
            break;
        case "list":
        	/*
        	 * 페이지 템플릿에 의해 컴포넌트가 생성될 수 있기 때문에 아래 자동 위치, 및 사이즈 조정 구문은 제거
        	 * 즉 모든 컴포넌트는 생성되면서 위치와 사이즈가 정해지며, 이떠한 변경도 가하지 않는다. 
            if (this.parent.type == 'page') {
                this.width = rWidth = EggbonEditor.project.resolutionWidth - (this.x * 2);
                this.height = rHeight= parseInt(EggbonEditor.project.resolutionHeight/2); 
            } else {
                this.width = rWidth = this.parent.width - (this.x * 2);;
                this.height = rHeight= parseInt(this.parent.height / 2);
            
            }
            */
            this.originalElementStr =
                   '<div class ="component component-list" data-component ="list" class ="transparent_scroll" style="left:' + rX + 'px;top:' + rY + 'px;width:' + (rWidth + EggbonEditor.scrollBarWidth + 2) + 'px;height:' + rHeight + 'px;position:absolute;background-color:rgba(200,200,200,.5);overflow: scroll;overflow-x:hidden" ></div>';
            this.originalElement = $(this.originalElementStr);
            break;
        case "listrow":
            this.width = this.parent.width;
            this.originalElementStr =
                  '<div class ="component component-listrow" data-component ="listrow" style="width:100%;height:' + this.height + 'px;position:absolute;background-color:#fff;margin:0px;color:#000;overflow:hidden" ></div>';
            this.originalElement = $(this.originalElementStr);
            break;
    }
};

EggbonEditor.Component.Base.prototype.addWrapperElements = function () {
    if (!this.type) return;
    $(this.originalElement).wrap(this.wrapperStr);
    $(this.internalWrapperQueryStr).after(this.resizingBorderStr);
    $(this.internalWrapperQueryStr).after(this.componentBorderLine);

    var elemLeft = parseInt($(this.originalElement).css('left'));
    var elemTop = parseInt($(this.originalElement).css('top'));
    //var wrapperLeft = (elemLeft - this.cornerActionTriggerRadius) + 'px';
    //var wrapperTop = (elemTop - this.cornerActionTriggerRadius) + 'px';

    $(this.externalWrapperQueryStr).css('left', elemLeft);
    $(this.externalWrapperQueryStr).css('top', elemTop);

    $(this.originalElement).css('left', 0);
    $(this.originalElement).css('top', 0);

};

EggbonEditor.Component.Base.prototype.adjustWrapper = function () {
    var elemWidth = parseInt($(this.originalElement).width());
    var elemHeight = parseInt($(this.originalElement).height());
    var externalWrapperWidth = (elemWidth + this.cornerActionTriggerRadius * 2) + 'px';
    var externalWrapperHeight = (elemHeight + this.cornerActionTriggerRadius * 2) + 'px';

    $(this.internalWrapperQueryStr).width($(this.originalElement).width());
    $(this.internalWrapperQueryStr).height($(this.originalElement).height());
    
    $(this.externalWrapperQueryStr).width($(this.originalElement).width());
    $(this.externalWrapperQueryStr).height($(this.originalElement).height());

    //if (this.type == 'list'){
    	//$.each(this.childs, function(index, listrow){
    		//$(listrow.originalElementQueryStr).css('width' , elemWidth-15);
    		
    	//});
   // }
    //listrow 일 경우 순차 배치함
    if (this.type == 'listrow') {
        $(this.externalWrapperQueryStr).css('position', 'relative');
        var widthPercent = (this.parent.width / (this.parent.width + EggbonEditor.scrollBarWidth)) * 100;
        $(this.externalWrapperQueryStr).css('width', this.parent.width - 15);
        $(this.internalWrapperQueryStr + ' .component-listrow').css('width', this.parent.width - 15);
    }
};

EggbonEditor.Component.Base.prototype.calcValueByZoom = function (type, value) {
    var resolutionWidth = EggbonEditor.project.resolutionWidth;
    var resolutionHeight = EggbonEditor.project.resolutionHeight;
    var canvasWidth = EggbonEditor.controller.canvasWidth;
    var canvasHeight = EggbonEditor.controller.canvasHeight;

    if (type == "left" || type == "width") {
        return (value * canvasWidth) / resolutionWidth;
    }
    if (type == "top" || type == "height") {
        return (value * canvasHeight) / resolutionHeight;
    }
};

EggbonEditor.Component.Base.prototype.displayComponentInfo = function (selector) {
    if (this.selectStatus == true) {
        var displayText = "x : " + this.x + " ,  ";
        displayText += "y : " +this.y + "  ,  ";
        displayText += "width: " + this.width + "  , ";
        displayText += "height : " + this.height +"   ";
        $('#position').text(displayText);
    }
};

EggbonEditor.Component.Base.prototype.enablePropertyWindow = function (shown) {
    //console.log("[enablePropertyWindow caller]  : " + arguments.callee.caller.toString());
    if (shown) {
        //pass default infos to property window
        EggbonEditor.propertyWindow.setInitInfo({ 
        	name: this.displayName, 
        	x: this.x, 
        	y: this.y, 
        	width: this.width, 
        	height: this.height, 
        	fixRatio: this.fixRatio 
        	});
        EggbonEditor.propertyWindow.showPropertyWindow(
            this.type,this.originalElement.offset().left + this.width + 10, this.originalElement.offset().top
        );
    } else {
        EggbonEditor.propertyWindow.closePropertyWindow();
    }
};

EggbonEditor.Component.Base.prototype.isContainer = function () {
    var containerInfo = {isContainer : false, type : this.type};
    if (this.type == "list" || this.type == 'listrow' || this.type == 'popup') {
        containerInfo.isContainer = true;
    }
    return containerInfo;
};


EggbonEditor.Component.Base.prototype.destroy = function (shown) {
    this.selectStatus = false;
    this.detach();
    EggbonEditor.setSelectedComponent(null);
};

EggbonEditor.Component.Base.prototype.setSelectStatus = function (selectStatus) {
	//var nStart = new Date().getTime();
    if (selectStatus == true) {
    	var parentArr = [];
        EggbonEditor.findParentsRecursive(parentArr, this);
        EggbonEditor.controller.enableBeforeGrayPanel(false, null);
        EggbonEditor.changeAllComponentSelectStatus(EggbonEditor.getSelectedPage(), false);
   		
   		EggbonEditor.controller.applyToolButtonChange(this);
        var node = EggbonEditor.controller.$tree.tree('getNodeById', this.UUID);
        EggbonEditor.controller.$tree.tree('selectNode', node);
		
		$.each(parentArr, function(inx, parent){
			node  = EggbonEditor.controller.$tree.tree('getNodeById', parent.UUID);
			EggbonEditor.controller.$tree.tree('openNode', node);
		});
		
        EggbonEditor.setSelectedComponent(this);
        this.enablePropertyWindow(true);
        this.showBorderTool();
        this.showGripTool();

        if (parentArr.length == 1 && parentArr[0].type == "page") {
            if (this.type == "popup") EggbonEditor.controller.enableBeforeGrayPanel(true, this);
            $(this.externalWrapperQueryStr).show();
        }

        if (parentArr.length > 1) {
            if (parentArr[1].type == "popup") EggbonEditor.controller.enableBeforeGrayPanel(true, parentArr[1]);
            $(parentArr[1].externalWrapperQueryStr).show();
        }
        
    } else {
    	$('.attributes_center span.top_x_pos').html('');
    	$('.attributes_center span.top_y_pos').html('');
        this.enablePropertyWindow(false);
        this.hideBorderTool();
        this.hideGripTool();
        EggbonEditor.controller.$tree.tree('selectNode', null);
    }
   this.selectStatus = selectStatus;
   //var nEnd =  new Date().getTime();      //종료시간 체크(단위 ms)
   //var nDiff = nEnd - nStart;      //두 시간차 계산(단위 ms)
   //console.log("#### setSelectStatus Profiling start");
   //console.error('execution time = %O', nDiff + " ms");
   //console.log("#### setSelectStatus Profiling end");
};

EggbonEditor.Component.Base.prototype.hideBorderTool = function () {
        $(this.componentBorder).hide();
    //$(this.borderDrawingStr).hide();
    //$(this.moveActionTriggerQueryStr).removeClass('obj_over_border');
};


EggbonEditor.Component.Base.prototype.showBorderTool = function () {
    $(this.componentBorder)
        .removeClass("component_border_multi_select")
        .addClass('component_border_common')
        .show();
    //$(this.borderDrawingStr).show();
    //$(this.moveActionTriggerQueryStr).addClass('obj_over_border');
};

EggbonEditor.Component.Base.prototype.showBorderSelect= function () {
    $(this.componentBorder)
        .removeClass("component_border_common")
        .addClass('component_border_multi_select')
        .show();
    //$(this.borderDrawingStr).show();
    //$(this.moveActionTriggerQueryStr).addClass('obj_over_border');
};

EggbonEditor.Component.Base.prototype.hideBorderSelect = function () {
    $(this.componentBorder)
        .removeClass("component_border_multi_select")
        .addClass('component_border_common')
        .hide();
    //$(this.borderDrawingStr).show();
    //$(this.moveActionTriggerQueryStr).addClass('obj_over_border');
};

EggbonEditor.Component.Base.prototype.show= function () {
    //$(this.borderDrawingStr).show();
    $(this.moveActionTriggerQueryStr).hide();
};

EggbonEditor.Component.Base.prototype.hide = function () {
    //$(this.borderDrawingStr).show();
    $(this.moveActionTriggerQueryStr).show();
};

EggbonEditor.Component.Base.prototype.hideGripTool = function () {
    $(this.resizingGripStr).hide();
    if (this.type == "listrow") {
        $(this.gripBottomLineStr).hide();
    }
};

EggbonEditor.Component.Base.prototype.showGripTool = function () {
    if (this.type == "popup" || this.type == "listrow" || this.type == "list") {
        $(this.resizingGripStrDirectChild).show();
    } else {
        $(this.resizingGripStr).show();
    }

    if (this.type == "listrow") {
        this.hideGripTool();
        $(this.gripBottomLineStr).show();
    }
};


EggbonEditor.Component.Base.prototype.createComponent = function (type, childAdd, treeAdd, options) {
    // 컨테이너 컴포넌트가 아닐 경우 자식 컴포넌트 생성 불가 
    if (!this instanceof EggbonEditor.Component.ListComponent &&
        !this instanceof EggbonEditor.Component.PopupComponent &&
        !this instanceof EggbonEditor.Component.ListRowComponent) throw "invalid container";

    var childAdd = typeof childAdd !== 'undefined' ? childAdd : true;
    var treeAdd  = typeof treeAdd !== 'undefined' ? treeAdd : true;

    //컨테이어에 요청 컴포넌트를 올릴 수 있는 지 체크 
    var permit = this.checkPermittable(type);
    if (!permit) throw "can`t a component in this container [" + this.type + "]";
    var component = EggbonEditor.Component.build(this, type, options);

    if (childAdd) {
        this.addComponent(component);
    }
    if (treeAdd) {
        this.addComponentToTree(component);
    }
   // console.log("childs length : " + this.childs.length);
    return component;
};

EggbonEditor.Component.Base.prototype.removeComponent = function (component) {
    //컨테이너 컴포넌트가 아닐 경우  액션 불가 
    if (!this instanceof EggbonEditor.Component.ListComponent &&
        !this instanceof EggbonEditor.Component.PopupComponent &&
        !this instanceof EggbonEditor.Component.ListRowComponent) throw "invalid container";

    var index = -1;
    $.each(this.childs, function (inx, child) {
        if (component.getProperty('UUID') == child.getProperty('UUID')) {
            index = inx;
            return;
        }
    });

    if (index != -1) {
        this.childs.splice(index, 1);
    }
    
    this.removeCompoentToTree(component);
    component.selectStatus = false;
    component.detach();
};

EggbonEditor.Component.Base.prototype.removeCompoentToTree = function (component) {
    var node = EggbonEditor.controller.$tree.tree("getNodeById", component.UUID);
    EggbonEditor.controller.$tree.tree('removeNode', node);
};


EggbonEditor.Component.Base.prototype.addComponent = function (addComp) {
    if (!this instanceof EggbonEditor.Component.ListComponent &&
            !this instanceof EggbonEditor.Component.PopupComponent &&
            !this instanceof EggbonEditor.Component.ListRowComponent) return false;
    this.childs.push(addComp);
};

EggbonEditor.Component.Base.prototype.addComponentToTree = function (component) {
    var parentNode = EggbonEditor.controller.$tree.tree("getNodeById", component.parent.UUID);
    EggbonEditor.controller.$tree.tree(
        'appendNode',
        {
            label: component.displayName,  //name
            id: component.UUID,
            fullName : component.fullName,  // id 
            type: component.type,
            data: component
        },
      parentNode
  );
};

EggbonEditor.Component.Base.prototype.checkPermittable = function (type) {
    var permittables = EggbonEditor.componentType[this.type].permittableChildComps;
    var permit = false;
    for (var i = 0; i < permittables.length ; i++) {
        if (permittables[i] == type) permit = true;
    }
    return permit;
};

//컨테이너 객체일 경우, 
EggbonEditor.Component.Base.prototype.createComponentNo = function (type) {
    var index = 0;
    var matchChilds = $.map(this.childs, function (comp) {
        if (comp.type == type) {
            return comp;
        } else {
            return null;
        }
    });

    if (Array.isArray(matchChilds)) {
        if (matchChilds.length == 0) {
            index = 1;
        } else {
            index = matchChilds[matchChilds.length - 1].no + 1;
        }
        return index;
    }
};


EggbonEditor.Component.Base.prototype.extract = function (options) {
    var context = this;
    $.each(options, function (key, value) {
        context.setProperty(key, value);
    });
};

//getter 
EggbonEditor.Component.Base.prototype.getProperty = function (key) {
    if (this.hasOwnProperty(key)) {
        return this[key];
    } else {
        return false;
    }
};

//setter 
EggbonEditor.Component.Base.prototype.setProperty = function (key, value) {
    this[key] = value;
};

//고유 아이디를 생성
EggbonEditor.Component.Base.prototype.genUUID = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};

//이벤트 액션 상수 
EggbonEditor.Component.Base.prototype.ActionsEnum = {
    None: 0,
    LeftResize: 1,
    TopResize: 2,
    RightResize: 3,
    BottomResize: 4,
    TopLeftResize: 5,
    BottomLeftResize: 6,
    TopRightResize: 7,
    BottomRightResize: 8,
    Move: 9
};

EggbonEditor.Component.Base.prototype.cornerActionTriggerRadius = 8;

EggbonEditor.Component.Base.prototype.showWrapper = function () {
    this.addWrapperElements();
    this.initializeEventHandlers();
    if (this.type == "listrow") {
      //  $(this.externalWrapperQueryStr).css("z-index", '9999999');
    }
    if (this.type == "listrow") {
        $(this.moveActionTriggerQueryStr).remove();
    }
};

EggbonEditor.Component.Base.prototype.hideWrapper = function () {
    var wrapperLeft = parseInt($(this.externalWrapperQueryStr).css('left'));
    var wrapperTop = parseInt($(this.externalWrapperQueryStr).css('top'));
    var elemLeft = (wrapperLeft + this.cornerActionTriggerRadius) + 'px';
    var elemTop = (wrapperTop + this.cornerActionTriggerRadius) + 'px';
    $(this.originalElement).css('left', elemLeft);
    $(this.originalElement).css('top', elemTop);
    $(this.originalElement).css('position', $(this.externalWrapperQueryStr).css('position'));

    $(this.externalWrapperQueryStr).replaceWith(this.originalElement);
};


EggbonEditor.Component.Base.prototype.initializeEventHandlers = function () {
    var wrapper = this;
    if (this.type == "listrow") {
        $(this.gripBottomLineStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.BottomResize;
            EggbonEditor.project.isComponentAction = true;
        });
    } else {
        $(this.topMiddleActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.stopPropagation();
            event.preventDefault();
            wrapper.currentAction = wrapper.ActionsEnum.TopResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.leftMiddleActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.stopPropagation();
            event.preventDefault();
            wrapper.currentAction = wrapper.ActionsEnum.LeftResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.rightMiddleActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.RightResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.bottomMiddleActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.BottomResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.bottomActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.BottomResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.gripBottomLineStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.BottomResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.topLeftActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.TopLeftResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.topRightActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            wrapper.currentAction = wrapper.ActionsEnum.TopRightResize;
            EggbonEditor.project.isComponentAction = true;
        });

        $(this.bottomLeftActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            EggbonEditor.project.isComponentAction = true;
            wrapper.currentAction = wrapper.ActionsEnum.BottomLeftResize;
        });

        $(this.bottomRightActionTriggerQueryStr).mousedown(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            EggbonEditor.project.isComponentAction = true;
            wrapper.currentAction = wrapper.ActionsEnum.BottomRightResize;
        });

        $(this.moveActionTriggerQueryStr).dblclick(function (event) {
            EggbonEditor.multiSelectionRect.resetSelection();
            event.preventDefault();
            event.stopPropagation();
            if (wrapper.type == "text") {
                $(wrapper.textInputAreaQueryStr).select();
                $(wrapper.textInputAreaQueryStr).focus();
            }
        });


        if (this.type == "text") {
            $(wrapper.textInputAreaQueryStr).focusout(function () {
                event.preventDefault();
                wrapper.text = $(this).val();
            });
        }
    }
    // -------> if end 
    

	$(this.moveActionTriggerQueryStr).mousedown(function(event) {
		event.stopPropagation();
		event.preventDefault();
		if (EggbonEditor.propertyWindow.isUploading) {
			alert("now is uploading..please wait");
			return;
		}

		if (event.ctrlKey) {
			/* listrow 와 popup는 개별 선택을 할 수 없음*/
			if (wrapper.type == "popup" || wrapper.type == "listrow") {
				wrapper.setSelectStatus(false);
				return;
			} 
				
			if (EggbonEditor.multiSelectionRect.isComponentContained(wrapper)) {
				EggbonEditor.multiSelectionRect.removeComponentToSelection(wrapper);
			} else {
				if (EggbonEditor.multiSelectionRect.getMultiSelectedComponentCount() < 1){
					var selectedComponent = EggbonEditor.getSelectedComponent();
					if (selectedComponent ) selectedComponent .setSelectStatus(false);	
				}
				EggbonEditor.multiSelectionRect.addComponentToSelection(wrapper);
			}
			return;
		} else {
			if (!EggbonEditor.multiSelectionRect.isComponentContained(wrapper)) {
				EggbonEditor.contextMenu.close();
				EggbonEditor.multiSelectionRect.resetSelection();
				wrapper.setSelectStatus(true);
				EggbonEditor.project.isComponentAction = true;
			}
			wrapper.currentAction = wrapper.ActionsEnum.Move; 
		}
	});

	$(this.moveActionTriggerQueryStr).mouseover(function(event) {
		event.preventDefault();
		event.stopPropagation();
		
		if (event.ctrlKey || EggbonEditor.multiSelectionRect.isMultiSelected()) return;
		if (EggbonEditor.multiSelectionRect.isComponentContained(wrapper) || 
			EggbonEditor.multiSelectionRect.curSelectionAction == EggbonEditor.multiSelectionRect.selectionActionEnum.drag) 
			return;
		
		if (EggbonEditor.project.isComponentAction == false) {
			if (wrapper.selectStatus == false)  wrapper.showBorderTool();
		}
	});

	$(this.moveActionTriggerQueryStr).mouseout(function(event) {
		event.preventDefault();
		event.stopPropagation();
		if (EggbonEditor.multiSelectionRect.isComponentContained(wrapper)) {
			//console.log("selected");
			return;
		}

		if (EggbonEditor.project.isComponentAction == false) {
			if (wrapper.selectStatus == false) {
				wrapper.hideBorderTool();
			}
		}
	});

	/*
	 * 모든 오브젝트가 document.mousemove 이벤트를 받고 처리하기 때문에 속도가 저하됨
	 * (아래의 이벤트를 제거하면 속도는 빨라짐)
	 * 선택된 컴포넌트만 move 이벤트를 받는 구조로 변경할 필요가 있음
	 * (선택되었을 때 doucment.move 이벤트를 걸고, 선택이 해제되었을 경우 move 이벤트를 해제하는 방법등 기타 방법이 고안되어야 함
	 * 	아래의 마우스 업 이벤트도 마찬가지 임
	 */
	$(EggbonEditor.editorPane).mousemove(function(event) {
		if (!event.ctrlKey) {
			event.preventDefault();
			event.stopPropagation();
			wrapper.onMouseMove(event);
		}
	});

	$(EggbonEditor.editorPane).mouseup(function(event) {
		//if (wrapper.selectStatus) {
			//wrapper.enablePropertyWindow(true);
		//}
		EggbonEditor.project.isComponentAction = false;
		wrapper.currentAction = wrapper.ActionsEnum.None;
	}); 

};

EggbonEditor.Component.Base.prototype.onMouseMove = function (event) {
    var currMouseX = event.clientX;
    var currMouseY = event.clientY;

    var deltaX = currMouseX - this.lastMouseX;
    var deltaY = currMouseY - this.lastMouseY;

    if (Math.abs(deltaX) < EggbonEditor.controller.snapValue &&Math.abs(deltaY) < EggbonEditor.controller.snapValue) 
        return;

    this.applyMouseMoveAction(deltaX, deltaY);

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
};

EggbonEditor.Component.Base.prototype.applyMouseMoveAction = function (deltaX, deltaY) {
    var deltaTop = 0;
    var deltaLeft = 0;
    var deltaWidth = 0;
    var deltaHeight = 0;

    if (this.currentAction == this.ActionsEnum.RightResize ||
             this.currentAction == this.ActionsEnum.TopRightResize ||
             this.currentAction == this.ActionsEnum.BottomRightResize) {
        deltaWidth = deltaX;
        if (!EggbonEditor.propertyWindow.isPositionFixed) this.enablePropertyWindow(false);
    }

    if (this.currentAction == this.ActionsEnum.LeftResize ||
             this.currentAction == this.ActionsEnum.TopLeftResize ||
             this.currentAction == this.ActionsEnum.BottomLeftResize) {
        deltaWidth = -deltaX;
        deltaLeft = deltaX;
        if (!EggbonEditor.propertyWindow.isPositionFixed) this.enablePropertyWindow(false);
    }

    if (this.currentAction == this.ActionsEnum.BottomResize ||
             this.currentAction == this.ActionsEnum.BottomLeftResize ||
             this.currentAction == this.ActionsEnum.BottomRightResize) {
        deltaHeight = deltaY;
        if (!EggbonEditor.propertyWindow.isPositionFixed) this.enablePropertyWindow(false);
    }

    if (this.currentAction == this.ActionsEnum.TopResize ||
             this.currentAction == this.ActionsEnum.TopLeftResize ||
             this.currentAction == this.ActionsEnum.TopRightResize) {
        deltaHeight = -deltaY;
        deltaTop = deltaY;
        if (!EggbonEditor.propertyWindow.isPositionFixed) this.enablePropertyWindow(false);
    }

    if (this.currentAction == this.ActionsEnum.Move) {
        deltaLeft = deltaX;
        deltaTop = deltaY;
        if (!EggbonEditor.propertyWindow.isPositionFixed) this.enablePropertyWindow(false);
    }

    //listrow 의 경우 좌상단 좌표값은 고정시키는 소스 , 
    //현재는 type 이 listrow 인 경우 부모인 list를 적용하기 때문에 주석 처리 
    /*
    if (this.type == "listrow") {
        deltaLeft = 0;
        deltaTop = 0;
    }
    */

    if (EggbonEditor.multiSelectionRect.isComponentSelected()) {
        $.each(EggbonEditor.multiSelectionRect.selectionComponentArr, function (inx, com) {
            com.updatePosition(deltaLeft, deltaTop);
            com.updateSize(deltaWidth, deltaHeight);
            com.adjustWrapper();
            com.updateComponentInfo(deltaLeft, deltaTop, deltaWidth, deltaHeight);
        });
    } else {
    	// 현재 컴포넌트가 listrow 인 경우는 하단 리사이징 액션만 처리
		if (this.type == 'listrow'  && this.currentAction == this.ActionsEnum.BottomResize){
			
		}else {
			
		}
        this.updatePosition(deltaLeft, deltaTop);
        this.updateSize(deltaWidth, deltaHeight);
        this.updateComponentInfo(deltaLeft, deltaTop, deltaWidth, deltaHeight);

        //if this resizing comonent is a listwrow,  all of rows after this row must be adjust y coodinate as delta Height;
        if (this.type == 'listrow' && this.currentAction == this.ActionsEnum.BottomResize)
            this.updatePositionNextRows(deltaWidth, deltaHeight);

        this.adjustWrapper();

        if (this.selectStatus) {
            EggbonEditor.propertyWindow.setPosition(this.x, this.y, this.width, this.height);
            EggbonEditor.propertyWindow.movePropertyWindow(
                $(this.originalElement).offset().left + this.width + 10, $(this.originalElement).offset().top);
        };
    }
};

EggbonEditor.Component.Base.prototype.getAdjustValueByZoom= function (value) {
	var curZoom = EggbonEditor.canvas.zoom;
	if (curZoom == 100) return value;
	
	var adjustValue = 0; 
	if (curZoom < 100)  
		adjustValue = parseInt(value / (EggbonEditor.canvas.zoom/100));
	else 
		adjustValue = parseInt((100 * value)  / EggbonEditor.canvas.zoom);
	return adjustValue;
};


//축소 확대된 좌표 및 이동량을 실제 해상도 로 변경
EggbonEditor.Component.Base.prototype.updatePosition = function (deltaLeft, deltaTop) {
	var component = this;
	//드래그 하는 컴포넌트가 listrow 인 경우 부모인 list를 적용
	if (this.type == 'listrow') component = this.parent;
    
    var elemLeft = parseInt($(component.externalWrapperQueryStr).css('left'));
    var elemTop = parseInt($(component.externalWrapperQueryStr).css('top'));
	
	var newLeft = 0;
    var newTop = 0;
    
    //var newLeft = elemLeft + deltaLeft;
    //var newTop = elemTop + deltaTop;
    
    var newLeft = elemLeft + component.getAdjustValueByZoom(deltaLeft);
   	var newTop = elemTop + component.getAdjustValueByZoom(deltaTop);
	//console.log('#### updatePosition');
	//console.log(newLeft + " : " + newTop);
    
    $(component.externalWrapperQueryStr).css('left', newLeft + 'px');
    $(component.externalWrapperQueryStr).css('top', newTop + 'px');
};

EggbonEditor.Component.Base.prototype.updateSize = function (deltaWidth, deltaHeight) {
    var elemWidth = parseInt($(this.originalElement).width());
    var elemHeight = parseInt($(this.originalElement).height());
    
    //var newWidth = elemWidth + deltaWidth;
    //var newHeight = elemHeight + deltaHeight;
    
    var newWidth  = elemWidth + this.getAdjustValueByZoom(deltaWidth);
    var newHeight = elemHeight + this.getAdjustValueByZoom(deltaHeight);
	
	var adjustDeltaWidth = this.getAdjustValueByZoom(deltaWidth);
	var adjustDeltaHeight = this.getAdjustValueByZoom(deltaHeight);
	
	var naturalWidth = $(this.originalElement).get(0).naturalWidth;
	var naturalHeight = $(this.originalElement).get(0).naturalHeight;
		
	if (this.fixRatio == true){
		newWidth  = elemWidth + adjustDeltaWidth; 
    	newHeight = elemHeight + this.getAdjustValueByZoom(parseInt((naturalHeight * deltaWidth)/naturalWidth));
	}else {
		newWidth  = elemWidth + adjustDeltaWidth;
    	newHeight = elemHeight + adjustDeltaHeight;
	}
	
    var minumalSize = this.cornerActionTriggerRadius * 2;
   
    if (newWidth < minumalSize)  newWidth = minumalSize;
    if (newHeight < minumalSize)  newHeight = minumalSize;

    $(this.originalElement).css('width', newWidth + 'px');
    $(this.originalElement).css('height', newHeight + 'px');
};

EggbonEditor.Component.Base.prototype.updateComponentInfo = function (deltaLeft, deltaTop, deltaWidth, deltaHeight) {
    
    var context = this;
 	if (this.type == 'listrow'){
	    this.x = 0; 
	    this.y = this.y;
	  
	    this.width = this.width + this.getAdjustValueByZoom(deltaWidth);
   	 	this.height = this.height + this.getAdjustValueByZoom(deltaHeight);
   	 	  
	    this.parent.x = this.parent.x + this.parent.getAdjustValueByZoom(deltaLeft);
    	this.parent.y = this.parent.y + this.parent.getAdjustValueByZoom(deltaTop);
	  
 	}else {
 		this.x = this.x + this.getAdjustValueByZoom(deltaLeft);
    	this.y = this.y + this.getAdjustValueByZoom(deltaTop);
    	this.width = this.width + this.getAdjustValueByZoom(deltaWidth);
    	this.height = this.height + this.getAdjustValueByZoom(deltaHeight);
 	}
 	
    var minimalSize = this.cornerActionTriggerRadius * 2;
    
    if (this.width < minimalSize) this.width = minimalSize;
    if (this.height < minimalSize)  this.height = minimalSize;
        	
    if (this.selectStatus) {
    	/*update x, y coord in top frame */
    	//$('.attributes_center span.top_x_pos').html(component.x);
    	//$('.attributes_center span.top_y_pos').html(component.y);
        /*update property windiow */
     	EggbonEditor.propertyWindow.setPosition(this.x, this.y, this.width, this.height);
        EggbonEditor.propertyWindow.movePropertyWindow(
        	$(this.originalElement).offset().left + this.width + 10, $(this.originalElement).offset().top);
     }	
    // 현재 타입이 리스트이고, 좌 우측 리사이징 일 경우, 자식 로우의 사이즈를 변경
    if (this.type == "list" && ( this.currentAction == this.ActionsEnum.LeftResize || this.currentAction == this.ActionsEnum.RightResize)) {
        $.each(this.childs, function (inx, listRow) {
            listRow.width = context.width;
            $(listRow.wrapperStr).css('width', context.width);
            $(listRow.originalElementStr).css('width', context.width);
        });
    }
    // 위치 정보를 표시, 차후 이벤트 콜백으로 변경 예정 
    //this.displayComponentInfo('#position');
};


EggbonEditor.Component.Base.prototype.updatePositionNextRows = function (deltaWidth, deltaHeight) {
    if (this.parent.childs.length < 2) return;  // return if this.parent only have less then one row
    var nextRowIndex = -1;
    var context = this;
    
    $.each(this.parent.childs, function (inx, listrow) {
        if (listrow.UUID == context.UUID) {
            nextRowIndex = inx;
            return;
        }
    });
    //return if this listrow is the last row
    if (nextRowIndex == -1) return;
    $.each(this.parent.childs, function (inx, listrow) {
        if (inx >= nextRowIndex) {
    		console.log("[-----------updatePositionNextRows] " + inx);
            console.log(listrow.y + " : " + deltaHeight);
            listrow.y = listrow.y + deltaHeight;
        }
    });
};

EggbonEditor.Component.Base.prototype.setPositionAndWidth = function (x, y, width, height) {
    //alert(x + " : " + y + " ; " + width + " : " + height);
    var deltaLeft = -(this.x - x);
    var deltaTop = -(this.y - y);
    var deltaWidth = -(this.width - width);
    var deltaHeight = -(this.height - height);
	
	//upate position
	var elemLeft = parseInt($(this.externalWrapperQueryStr).css('left'));
    var elemTop = parseInt($(this.externalWrapperQueryStr).css('top'));
    
    var newLeft = elemLeft + deltaLeft;
   	var newTop = elemTop + deltaTop;

    $(this.externalWrapperQueryStr).css('left', newLeft + 'px');
    $(this.externalWrapperQueryStr).css('top', newTop + 'px');
    
 	//update size 
	var elemWidth = parseInt($(this.originalElement).width());
    var elemHeight = parseInt($(this.originalElement).height());
    
    var newWidth = elemWidth + deltaWidth;
    var newHeight = elemHeight + deltaHeight;

    var minumalSize = this.cornerActionTriggerRadius * 2;
   
    if (newWidth < minumalSize)  newWidth = minumalSize;
    if (newHeight < minumalSize)  newHeight = minumalSize;

    $(this.originalElement).css('width', newWidth + 'px');
    $(this.originalElement).css('height', newHeight + 'px');
     	   
    this.adjustWrapper();
    
    //update component info 
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    var minimalSize = this.cornerActionTriggerRadius * 2;
    
    if (this.width < minimalSize) this.width = minimalSize;
    if (this.height < minimalSize)  this.height = minimalSize;
    
     if (this.selectStatus) {
     	    //상단의 x, y 좌표값 갱신
    	$('.attributes_center span.top_x_pos').html(this.x);
    	$('.attributes_center span.top_y_pos').html(this.y);
     	EggbonEditor.propertyWindow.setPosition(this.x, this.y, this.width, this.height);
        EggbonEditor.propertyWindow.movePropertyWindow(
        	$(this.originalElement).offset().left + this.width + 10, $(this.originalElement).offset().top);
     }	
    
    if (this.type == "list") {
       var context = this;
        $.each(this.childs, function (inx, listRow) {
            listRow.width = context.width;
            $(listRow.wrapperStr).css('width', context.width);
            $(listRow.originalElementStr).css('width', context.width);
        });
    }
     
};

EggbonEditor.Component.Base.prototype.setImage= function(imagePath){
	this.imgPath = imagePath;
	$(this.originalElement).attr('src', this.imgPath);
};
//Co

EggbonEditor.Component.Base.prototype.resetImage = function(){
	this.imgPath = this.defaultImgPath;
	$(this.originalElement).attr('src', this.imgPath);
};
//Component classes extends super class (Component)
EggbonEditor.Component.ImageComponent = function (parent , userOptions) {
	this.defaultImgPath  = location.protocol + '//' +location.host + "/ne/images/img_image.png";
    var options = {x : 10, y : 10, width : 60, height : 60, fixRatio : false,imgPath : this.defaultImgPath};
    if (userOptions) $.extend(options, userOptions);
    this.parent = parent;
    //this.imgPath = "http://www.uchef.co.kr/webeditor/menupan/img/area_image.png";
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("image"), "image", options);
};

EggbonEditor.Component.ImageComponent.prototype.refresh = function (parent) {
    $(this.originalElement).attr('src', this.imgPath);
};
 
EggbonEditor.Component.TextComponent = function (parent , userOptions) {
    var options = {x: 10, y: 10, width: 250, height: 80, fixRatio: false, placeHolder : "Insert Text",text : "",fontFamily :  "Open Sans",fontSize : "30pt",color : "#FF862D"};
    if (userOptions) $.extend(options, userOptions);
    this.parent = parent;   
    
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("text"), "text", options);
    this.textInputAreaQueryStr = this.externalWrapperQueryStr + ' .text_input_area';
  
};

EggbonEditor.Component.TextComponent.prototype.refresh = function (parent) {
    $(this.originalElement).find('.text_input_area')
     .val(this.text)
     .css({
         fontSize: this.fontSize,
         fontFamily: this.fontFamily,
         color: this.color
     });
};


EggbonEditor.Component.LinkComponent = function (parent, userOptions) {
	this.defaultImgPath  = location.protocol + '//' +location.host + "/ne/images/img_link.png";
    var options = {x: 10, y: 10, width: 60, height: 60, fixRatio: false,imgPath : this.defaultImgPath,linkType :  "PageLink",position :  ""};
    if (userOptions) $.extend(options, userOptions);
    this.parent = parent;
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("link"), "link", options);
};

EggbonEditor.Component.LinkComponent.prototype.refresh = function (parent) {
    $(this.originalElement).attr('src', this.imgPath);
};

EggbonEditor.Component.OrderComponent = function (parent, userOptions) {
	this.defaultImgPath  = location.protocol + '//' +location.host + "/ne/images/img_order.png";
    var options = {x: 10, y: 10, width: 60, height: 60, fixRatio: false,imgPath :  this.defaultImgPath,menuId : '',menu  :  "",price :  "",unit : '원',stock : ''};
    if (userOptions) $.extend(options, userOptions);
    this.parent = parent;
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("order"), "order", options);
    //this.imgPath = "http://www.uchef.co.kr/webeditor/menupan/img/area_order.png";
};

EggbonEditor.Component.OrderComponent.prototype.refresh = function (parent) {
    $(this.originalElement).attr('src', this.imgPath);
    this.enablePropertyWindow(false);
    this.enablePropertyWindow(true);
};

EggbonEditor.Component.OrderComponent.prototype.setProduct = function (menuId, menuName, menuPrice, stock) {
	this.menuId = menuId;
	this.menu = menuName; 
	this.price = menuPrice;
	this.stock = stock;
	
	console.log("### 선택된 메뉴 정보");
	console.log(this.menuId + " : " + this.menu + " : " + this.price + " : " + this.stock);
	$(this.externalWrapperQueryStr + ' .component-order').attr('menu', menuName);
	$(this.externalWrapperQueryStr + ' .component-order').attr('menuId', menuId);
	$(this.externalWrapperQueryStr + ' .component-order').attr("price",menuPrice);
	$(this.externalWrapperQueryStr + ' .component-order').attr("stock",stock);
	this.refresh();
};

EggbonEditor.Component.ListComponent = function (parent, userOptions) {
    var options = { x: 50, y: 50, width: 400, height: 400, fixRatio: false};
    if (userOptions) $.extend(options, userOptions);
    this.parent = parent;
    this.permitComponents = ["listrow"];
    this.childs = [];    //listrow comps array
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("list"), "list", options);
};

EggbonEditor.Component.PopupComponent = function (parent, userOptions) {
    var options = { x:  50 , y: 50, width: 600, height: 700, fixRatio: false};
	if (userOptions) $.extend(options, userOptions);
    this.parent = parent;
    this.permitComponents = ["image", "text", "link", "order"];
    this.childs = [];  //all of the components array 
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("popup"), "popup", options);
};

EggbonEditor.Component.ListRowComponent = function (parent, userOptions) {
    var options = { x: 0, y: 0, width: 100, height: 100, fixRatio: false};
	if (userOptions) $.extend(options, userOptions);
    this.parent = parent;
    this.permitComponents = ["image", "text", "link", "order"];
    this.childs = []; //all of the components 
    EggbonEditor.Component.Base.call(this, this.parent.createComponentNo("listrow"), "listrow", options);
    this.gripBottomLineStr = this.externalWrapperQueryStr + " .gripbottonline";
};

EggbonEditor.class.extend(
    EggbonEditor.Component.ImageComponent.prototype,
    new EggbonEditor.Component.Base(), EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

EggbonEditor.class.extend(
    EggbonEditor.Component.TextComponent.prototype,
    new EggbonEditor.Component.Base(),
    EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

EggbonEditor.class.extend(
    EggbonEditor.Component.LinkComponent.prototype,
    new EggbonEditor.Component.Base(),
    EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

EggbonEditor.class.extend(
    EggbonEditor.Component.OrderComponent.prototype,
    new EggbonEditor.Component.Base(),
    EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

EggbonEditor.class.extend(
    EggbonEditor.Component.PopupComponent.prototype,
    new EggbonEditor.Component.Base(),
    EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

EggbonEditor.class.extend(
    EggbonEditor.Component.ListComponent.prototype,
    new EggbonEditor.Component.Base(),
    EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

EggbonEditor.class.extend(
    EggbonEditor.Component.ListRowComponent.prototype,
    new EggbonEditor.Component.Base(),
    EggbonEditor.class.subClassAddfuncs,
    EggbonEditor.Component.Base.prototype
);

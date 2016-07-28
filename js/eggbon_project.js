EggbonEditor = EggbonEditor || {};

EggbonEditor.Project = function(options) {
	var defaultOptions = {
		memberSeq : -1, //user sequerence
		menberId : "topayc", //user id
		memberName : 'topayc',
		projectName : "topayc_project",
		projectSeq : 3835,
		storeCode : 'st001', // a variables used in getting menu groups  and prices
		resolutionWidth : 600, //default resolution X
		resolutionHeight : 800, //default resolution Y
		pageWidth : 600,
		pageHeight : 800,

		runMode : "test", // 로컬 테스트 모드  1 이면 실 서버 운영 모드

		autoSave : false,
		autoValidate : true,

		autoSaveInterval : 3000,
		validationInterval : 3000,

		autoSustainSession : true,
		sustainSessionIntervale : 40000
	};

	if (options) $.extend(defaultOptions, options);
	this.extract(defaultOptions);

	this.pages = new Array();
	this.selectedPage = null;
	this.selectedComponent = null;

	if (this.autoSave) this.startAutoSave();
	if (this.autoValidate) this.startAutoValidate();
	if (this.autoSustainSession) this.startSustainSession();

	this.init();
};

EggbonEditor.Project.prototype.init = function() {
	this.adjustCanvas();
};

EggbonEditor.Project.prototype.IsTemplateProject = function() {
	if (this.projectInfo.category_code_seq != 0) {
		return true;
	} else {
		return false;
	}
};

EggbonEditor.Project.isSuperUser= function() {
	if (this.memberInfo.member_gubun = 0) {
		return true;
	} else {
	return false;
	}
};

EggbonEditor.Project.prototype.startSustainSession = function() {
	this.sustainSessionIntervalId = setInterval(function() {
		EggbonEditor.api.callRemoteApi('sustainSession', null, function(result) {
			if (result.resultCode == -1) {
				alert("Session Error. Redirct to the login page ");
			}
		});
	}, this.sustainSessionIntervale);
};

EggbonEditor.Project.prototype.stopSustainSession = function() {
	clearInterval(this.sustainSessionIntervalId);
};

EggbonEditor.Project.prototype.startAutoSave = function(options) {
	var context = this;
	this.autoSavieId = setInterval(function() {
		context.saveProject();
	}, this.autoSaveInterval);
};

//프로젝트를 json 으로 변환
EggbonEditor.Project.prototype.saveProject = function() {
	var projectJson = this.convertProjectToJson();
	console.log("#### saveProject  - json 으로 변환된 프로젝트 정보");
	console.log(projectJson);

	EggbonEditor.api.callRemoteApi('saveProject', {
		member_seq : EggbonEditor.project.memberSeq,
		project_seq : EggbonEditor.project.projectSeq,
		menu_json : JSON.stringify(projectJson)
	}, function(result) {
		if (result.resultCode != 0) {
			alert(result.resultMsg);
		} else {
			alert('succeed in uploading a project');
		}
	});
};

//프로젝트를 json 으로 변환
EggbonEditor.Project.prototype.convertProjectToJson = function() {
	var uploadProject = {};

	//set HEADER property
	uploadProject.HEADER = {};
	uploadProject.HEADER.base_path = this.pageInfo.HEADER.base_path;
	uploadProject.HEADER.TITLE = this.projectName;

	uploadProject.HEADER.DEVICE = {};
	uploadProject.HEADER.DEVICE.width = this.pageWidth;
	uploadProject.HEADER.DEVICE.height = this.pageHeight;

	//set UCHEF property
	uploadProject.UCHEF = {};
	uploadProject.UCHEF.ver = 2;

	//set PAGELIST property
	uploadProject.PAGELIST = {
		id : 'pageGrandParent',
		src : '',
		xpos : '0',
		ypos : '0',
		length : this.pages.length
	};
	uploadProject.PAGELIST.PAGE = [];
	var context = this;

	$.each(this.pages, function(index, page) {
		uploadProject.PAGELIST.PAGE.push({
			width : context.resolutionWidth,
			height : context.resolutionHeight,
			id : page.componentId,
			name : page.displayName,
			xpos : String(0),
			ypos : String(0)
		});

		uploadProject.PAGELIST.PAGE[index].IMAGECOMP = [];
		uploadProject.PAGELIST.PAGE[index].TEXTCOMP = [];
		uploadProject.PAGELIST.PAGE[index].LINKBUTTONCOMP = [];
		uploadProject.PAGELIST.PAGE[index].ORDERBUTTONCOMP = [];
		uploadProject.PAGELIST.PAGE[index].POPUPPAGE = [];
		uploadProject.PAGELIST.PAGE[index].LISTCOMP = [];

		$.each(page.childs, function(inx, component) {
			switch(component.type) {
			case 'image':
				uploadProject.PAGELIST.PAGE[index].IMAGECOMP.push({
					height : component.height,
					id : component.componentId,
					name : component.name,
					width : component.width,
					xpos : String(component.x),
					ypos : String(component.y),
					src : component.imgPath == component.defaultImgPath ? '' : component.imgPath 
					//fixRatio : component.fixRatio
				});
				break;

			case 'text':
				uploadProject.PAGELIST.PAGE[index].TEXTCOMP.push({
					height : component.height,
					id : component.componentId,
					name : component.name,
					width : component.width,
					xpos : String(component.x),
					ypos : String(component.y),
					color : component.color,
					content_text : component.text ? encodeURIComponent(component.text) : '',
					font_family : component.fontFamily,
					font_size : component.fontSize,
					//fixRatio : component.fixRatio
				});
				break;

			case 'link':
				uploadProject.PAGELIST.PAGE[index].LINKBUTTONCOMP.push({
					height : component.height,
					id : component.componentId,
					name : component.name,
					width : component.width,
					xpos : String(component.x),
					ypos : String(component.y),
					src : component.imgPath == component.defaultImgPath ? '' : component.imgPath ,
					linktype : component.linkType,
					target : component.position,
					//fixRatio : component.fixRatio
				});
				break;

			case 'order':
				uploadProject.PAGELIST.PAGE[index].ORDERBUTTONCOMP.push({
					height : component.height,
					id : component.componentId,
					name : component.name,
					width : component.width,
					xpos : String(component.x),
					ypos : String(component.y),
					src : component.imgPath == component.defaultImgPath ? '' : component.imgPath, 
					unit_ : component.unit,
					item_code : component.menuId,
					menutitle : component.menu,
					price : component.price,
					//fixRatio : component.fixRatio
				});
				break;

			case 'list':
				uploadProject.PAGELIST.PAGE[index].LISTCOMP.push(context.generateListComponentJson(component));
				break;
			case 'popup':
				uploadProject.PAGELIST.PAGE[index].POPUPPAGE.push(context.generatePopupComponentJson(component));
				break;
			}
		});
		//페이지내의 컴포넌트들에 대해서 배열과 오프벡트로 정리한다.
		context.convertToProjectFormat(uploadProject.PAGELIST.PAGE[index]);
	});

	//프로젝트의 해당 페이지가 1개 이면, 페이지를 오브젝트로, 2개 이상이면 페이지 배열을 구성한다.
	this.convertPageToUploadFormat(uploadProject.PAGELIST);
	return uploadProject;
};

EggbonEditor.Project.prototype.convertPageToUploadFormat = function(PAGELIST) {
	if (PAGELIST.PAGE.length == 1) {
		PAGELIST.PAGE = PAGELIST.PAGE[0];
	}
};

EggbonEditor.Project.prototype.generateListComponentJson = function(listComponent) {
	var listJson = {};
	listJson.xpos = String(listComponent.x);
	listJson.ypos = String(listComponent.y);
	listJson.width = listComponent.width;
	listJson.height = listComponent.height;
	listJson.id = listComponent.componentId;
	listJson.name = listComponent.name;

	var context = this;
	if (listComponent.childs.length > 0) {
		listJson.LISTROW = [];

		$.each(listComponent.childs, function(index, listrow) {
			listJson.LISTROW.push({
				height : listrow.height,
				id : listrow.componentId,
				name : listrow.name,
				width : listrow.width,
				xpos : String(listrow.x),
				ypos : String(listrow.y)
			});
			listJson.LISTROW[index].IMAGECOMP = [];
			listJson.LISTROW[index].TEXTCOMP = [];
			listJson.LISTROW[index].LINKBUTTONCOMP = [];
			listJson.LISTROW[index].IMAGECOMP = [];
			listJson.LISTROW[index].ORDERBUTTONCOMP = [];

			$.each(listrow.childs, function(inx, component) {
				switch(component.type) {
				case 'image':
					listJson.LISTROW[index].IMAGECOMP.push({
						height : component.height,
						id : component.componentId,
						name : component.name,
						width : component.width,
						xpos : String(component.x),
						ypos : String(component.y),
						src : component.imgPath,
						//fixRatio : component.fixRatio
					});
					break;

				case 'text':
					listJson.LISTROW[index].TEXTCOMP.push({
						height : component.height,
						id : component.componentId,
						name : component.name,
						width : component.width,
						xpos : String(component.x),
						ypos : String(component.y),
						color : component.color,
						content_text : encodeURIComponent(component.text),
						font_family : component.fontFamily,
						font_size : component.fontSize,
						//fixRatio : component.fixRatio
					});
					break;

				case 'link':
					listJson.LISTROW[index].LINKBUTTONCOMP.push({
						height : component.height,
						id : component.componentId,
						name : component.name,
						width : component.width,
						xpos : String(component.x),
						ypos : String(component.y),
						src : component.imgPath,
						linktype : component.linkType,
						target : component.position,
						//fixRatio : component.fixRatio
					});
					break;

				case 'order':
					listJson.LISTROW[index].ORDERBUTTONCOMP.push({
						height : component.height,
						id : component.componentId,
						name : component.name,
						width : component.width,
						xpos : String(component.x),
						ypos : String(component.y),
						src : component.imgPath,
						unit : component.unit,
						item_code : component.menuId,
						menutitle : component.menu,
						price : component.price,
						//fixRatio : component.fixRatio
					});
					break;
				}
			});

			context.convertToProjectFormat(listJson.LISTROW[index]);
		});
	}

	return listJson;
};

EggbonEditor.Project.prototype.generatePopupComponentJson = function(popupComponent) {
	var popupJson = {};
	popupJson.xpos = String(popupComponent.x);
	popupJson.ypos = String(popupComponent.y);
	popupJson.width = popupComponent.width;
	popupJson.height = popupComponent.height;
	popupJson.id = popupComponent.componentId;
	popupJson.name = popupComponent.name;

	popupJson.IMAGECOMP = [];
	popupJson.TEXTCOMP = [];
	popupJson.LINKBUTTONCOMP = [];
	popupJson.ORDERBUTTONCOMP = [];
	popupJson.LISTCOMP = [];
	var context = this;

	$.each(popupComponent.childs, function(index, component) {
		switch(component.type) {
		case 'image':
			popupJson.IMAGECOMP.push({
				height : component.height,
				id : component.componentId,
				name : component.name,
				width : component.width,
				xpos : String(component.x),
				ypos : String(component.y),
				src : component.imgPath,
				//fixRatio : component.fixRatio
			});
			break;

		case 'text':
			popupJson.TEXTCOMP.push({
				height : component.height,
				id : component.componentId,
				name : component.name,
				width : component.width,
				xpos : String(component.x),
				ypos : String(component.y),
				color : component.color,
				content_text : encodeURIComponent(component.text),
				font_family : component.fontFamily,
				font_size : component.fontSize,
				//fixRatio : component.fixRatio
			});
			break;

		case 'link':
			popupJson.LINKBUTTONCOMP.push({
				height : component.height,
				id : component.componentId,
				name : component.name,
				width : component.width,
				xpos : String(component.x),
				ypos : String(component.y),
				src : component.imgPath,
				linktype : component.linkType,
				target : component.position,
				//fixRatio : component.fixRatio
			});
			break;

		case 'order':
			popupJson.ORDERBUTTONCOMP.push({
				height : component.height,
				id : component.componentId,
				name : component.name,
				width : component.width,
				xpos : String(component.x),
				ypos : String(component.y),
				src : component.imgPath,
				unit_ : component.unit,
				item_code : component.menuId,
				menutitle : component.menu,
				price : component.price,
				//fixRatio : component.fixRatio
			});
			break;

		case 'list':
			popupJson.LISTCOMP.push(context.generateListComponentJson(component));
			break;
		}

	});
	this.convertToProjectFormat(popupJson);
	return popupJson;
};

EggbonEditor.Project.prototype.convertToProjectFormat = function(container) {
	for (var property in container) {
		if (property == "IMAGECOMP" || property == "TEXTCOMP" || property == "ORDERBUTTONCOMP" || property == "LINKBUTTONCOMP" || property == "LISTCOMP" || property == "LISTROW" || property == "POPUPPAGE") {

			if (container[property].length == 0) {
				delete container[property];
				continue;
			}

			if (container[property].length == 1) {
				//if (property=="LISTCOMP"){
				//console.log("LISTCOMP 로그 출력");
				//console.log(container[property]);
				//}
				container[property] = container[property][0];
			}
		}
	}
};

EggbonEditor.Project.prototype.stopAutoSave = function(options) {
	clearInterval(this.autoSavieId);
};

EggbonEditor.Project.prototype.startAutoValidate = function(options) {
	EggbonEditor.validation.startValidation(this.validationInterval);
};

EggbonEditor.Project.prototype.stopAutoValidate = function(options) {
	EggbonEditor.validation.stopValidation();
};

EggbonEditor.Project.prototype.extract = function(options) {
	var context = this;
	$.each(options, function(key, value) {
		context.setProperty(key, value);
	});
};

//getter
EggbonEditor.Project.prototype.getProperty = function(key) {
	if (this.hasOwnProperty(key)) {
		return this[key];
	} else {
		return false;
	}
};

EggbonEditor.Project.prototype.setProperty = function(key, value) {
	this[key] = value;
};

EggbonEditor.Project.prototype.adjustCanvas = function() {
	$(EggbonEditor.holder).css('width', this.resolutionWidth + "px");
	$(EggbonEditor.holder).css('height', this.resolutionHeight + "px");
	EggbonEditor.controller.canvasWidth = this.resolutionWidth;
	EggbonEditor.controller.canvasHeight = this.resolutionHeight;
};

EggbonEditor.Project.prototype.showPage = function(UUID, name) {
	this.hideAllPage();
	$.each(this.pages, function(index, page) {
		if (page.UUID == UUID) {
			page.$pageHolderSelector.show();
			EggbonEditor.setSelectedComponent(null);
			EggbonEditor.setSelectedPage(page);
		}
	});
	EggbonEditor.propertyWindow.closePropertyWindow();
};

EggbonEditor.Project.prototype.hidePage = function(UUID, name) {
	$.each(this.pages, function(index, page) {
		if (page.UUID == UUID) {
			page.$pageHolderSelector.hide();
			return;
		}
	});
};

EggbonEditor.Project.prototype.hideAllPage = function() {
	$.each(this.pages, function(index, page) {
		page.$pageHolderSelector.hide();
	});

};

EggbonEditor.Project.prototype.removePage = function(page) {
	var index = -1;
	var context = this;
	$.each(this.pages, function(inx, childPage) {
		if (childPage.UUID == page.UUID) {
			index = inx;
			return;
		}
	});

	if (index != -1) {
		console.log("## removePage");
		console.log(index);
		this.pages.splice(index, 1);
		page.destroy();

		var node = EggbonEditor.controller.$tree.tree("getNodeById", page.UUID);
		EggbonEditor.controller.$tree.tree('removeNode', node);
		EggbonEditor.controller.$tree.tree("selectNode", null);
	}
};

//getter
EggbonEditor.Project.prototype.get = function(key) {
	if (this.hasOwnProperty(key)) {
		return this[key];
	} else {
		return false;
	}
};

//setter
EggbonEditor.Project.prototype.set = function(key, value) {this[key] = value;};

/*
 * 페이지생성, 프로젝트의 루트 노드의 마지막에 추가 
 */

EggbonEditor.Project.prototype.createPage = function(options) {
	var pageNo = this.createPageNo();
	var pageDefaultOptions = { x : 0, y : 0, width : this.pageWidth, height : this.pageHeight};

	if (options) $.extend(pageDefaultOptions, options);

	var page = new EggbonEditor.Page(pageNo, "page" + pageNo, pageDefaultOptions);
	this.pages.push(page);
	this.selectedPage = page;

	EggbonEditor.setSelectedComponent(null);
	EggbonEditor.setSelectedPage(page);
	page.show();

	EggbonEditor.propertyWindow.closePropertyWindow();
	EggbonEditor.showPage(page.UUID, page.name);
	var rootNode = EggbonEditor.controller.$tree.tree('getNodeById', EggbonEditor.project.projectName);

	EggbonEditor.controller.$tree.tree('appendNode', {
		label : page.displayName, // name
		id : page.UUID,
		fullName : page.fullName, // id
		type : page.type,
		data : page
	}, rootNode);
	
	var node = EggbonEditor.controller.$tree.tree('getNodeById', page.UUID);
	EggbonEditor.controller.$tree.tree('selectNode', node);
	return page;
};

/*
 페이지를 생성하여 지정한 컴포넌트의 압, 뒤에 배치 한다.
 * */
EggbonEditor.Project.prototype.createPageAndInsert = function(indexVerb, targetPage, options) {
	var pageNo = this.createPageNo();
	var pageDefaultOptions = { x : 0, y : 0,width : this.pageWidth,height : this.pageHeight};
	if (options) $.extend(pageDefaultOptions, options);
	var page = new EggbonEditor.Page(pageNo, "page" + pageNo, pageDefaultOptions); 
	
	switch (indexVerb){
		case 'after':
		var targetPageIndex = -1;
		for(var i = 0; i < this.pages.length ; i++){
			if (targetPage.UUID == this.pages[i].UUID ){
				targetPageIndex  =  i;
				break;
			}
		}
		if (targetPageIndex != -11)  this.pages.splice(targetPageIndex  +1 , 0 , page);
		var targetNode = EggbonEditor.controller.$tree.tree('getNodeById', targetPage.UUID);
		EggbonEditor.controller.$tree.tree(
			'addNodeAfter',	
			{
				label : page.displayName, // name
				id : page.UUID,
				fullName : page.fullName, // id
				type : page.type,
				data : page
			}, 
			targetNode 
		);

		targetPage.$pageHolderSelector.after(page.$pageHolderSelector);
		
		//EggbonEditor.showPage(page.UUID, page.name);
		//EggbonEditor.propertyWindow.closePropertyWindow();
		//EggbonEditor.setSelectedComponent(null);
		//EggbonEditor.setSelectedPage(page);
		//page.show();
		return page;
			
		case 'before':
		break;
	}
};


EggbonEditor.Project.prototype.createPageNo = function() {
	var pageNo = 0;
	if (this.pages.length == 0) {
		pageNo = 1;
	} else {
		var arr = $.map(this.pages, function(page, inx){return page.pageNo;	});
		arr.sort(function(a,b){return a< b ? -1 : a> b? 1 : 0;  });
		pageNo = arr[arr.length-1] + 1;
	}
	return pageNo;
};

EggbonEditor.Project.prototype.setSelectedPage = function(page) {
	this.selectedPage = page;
};

//status 가 false 면 해당 컴포넌트를 셀렉트 컴포넌트에서 제거
// true 이면 해당 컴포넌트만을 선택하기 위해서 모든 컴포넌트의 selectstatus 를 false로 변경
EggbonEditor.Project.prototype.setSelectedComponent = function(component) {
	if (this.setSelectedPage) {
		this.selectedComponent = component;
		this.selectedPage.setSelectedComponent(component);
	}
};

EggbonEditor.Project.prototype.changeAllComponentSelectStatus = function(page, status) {
	var context = this;
	if (page){
			context.changeAllComponentSelectStatusRecursive(page, status);
	}else {
		$.each(this.pages, function(index, page) {
			context.changeAllComponentSelectStatusRecursive(page, status);
		});
	}
};

EggbonEditor.Project.prototype.changeStatusAllComponentOfPage = function(page, status) {
	context.changeAllComponentSelectStatusRecursive(page, status);
};

EggbonEditor.Project.prototype.changeAllComponentSelectStatusRecursive = function(component, status) {
	var context = this;
	if (!component.hasOwnProperty('childs') || component.length < 1) {
		return;
	}
	$.each(component.childs, function(index, child) {
		if (child.type == "popup") {
			$(child.externalWrapperQueryStr).hide();
		}
		context.EnableComponentBorderAndGrip(child, status);
		context.changeAllComponentSelectStatusRecursive(child, status);
	});
};

EggbonEditor.Project.prototype.EnableComponentBorderAndGrip = function(component, status) {
	if (component.type != "page") {
		if (status) {
			component.showBorderTool();
			component.showGripTool();
			component.selectStatus = true;
		} else {
			component.hideBorderTool();
			component.hideGripTool();
			component.selectStatus = false;
		}
	}
};

EggbonEditor.Project.prototype.getSelectedPage = function(options) {
	return this.selectedPage;
};

EggbonEditor.Project.prototype.getSelectedComponent = function(options) {
	return this.selectedComponent;
};

EggbonEditor.Project.prototype.changePageIndex = function(page, insertInx) {
};


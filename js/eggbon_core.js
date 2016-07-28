var EggbonEditor = {
	holder : "#page-container",
	page : ".page",
	editorPane : ".content_container",
	project : {},
	scrollBarWidth : 0,

	init : function() {
		var mode = "test";
		var projectSeq = '';
		var lang = '';
		var memberSeq = '';
		
		var queryString = this.getUrlParams();
		if (queryString ){
			projectSeq  = queryString.project_seq;
			lang = queryString.lang;
			
			if (projectSeq && projectSeq!= ''){
				mode = 'product';
			}
		}
		console.log('projectSeq  :' + projectSeq );
		
		//멤버 번호와 프로젝트 이름이 파라미터로에 없으면 로컬 테스트 모드
		if (mode =='test') {
			//EggbonEditor.config.resolutions = resolution.searchResult;
			this.createProject();
			EggbonEditor.controller.init();
			EggbonEditor.canvas.init();
			EggbonEditor.multiSelectionRect.init();
			EggbonEditor.validation.init();
			this.scrollBarWidth = EggbonEditor.util.getScrollbarWidth();
		}

		/*
		 * 멤버 번호와 프로젝트 이름이 파라미터에 있는 경우
		 * 실 서버 테스트
		 * */
		else {
			var context = this;
			/*load user info */
			EggbonEditor.api.callRemoteApi('loadUserInfo', {member_seq : memberSeq}, function(memberResult) {
				if (!memberResult || !memberResult.searchResult || memberResult.searchResult == '' || 
						memberResult.resultCode != 0 || memberResult.searchResult == 'undefined') {
					console.log('loadUserInfo] wrong reqeust : ' + memberResult.resultMsg );
					alert('loadUserInfo] wrong reqeust : ' + memberResult.resultMsg);
					return;
				}
				console.log("loadUserInfo");
				console.log(memberResult);
				
				/*load proejct */
				EggbonEditor.api.callRemoteApi('loadProjectList', {project_seq : projectSeq}, function(projectResult) {
					if (!projectResult || !projectResult.searchResult || projectResult.searchResult == '' || projectResult.resultCode != 0 || projectResult.searchResult == 'undefined') {
						console.log('[loadProjectList] wrong reqeust : ' + projectResult.resultMsg);
						alert('[loadProjectList] wrong reqeust : ' + projectResult.resultMsg);
						return;
					}

					if (projectResult.searchResult.length > 1) {
						console.log('[loadProjectList] wrong reqeust : ' + projectResult.resultMsg);
						alert('[loadProjectList] wrong reqeust : ' + projectResult.resultMsg);
						return;
					}
					console.log("[loadProject]");
					console.log(projectResult);

					context.createProjectFromJson(memberResult, projectResult);

					/* initailizing inxtanecs after all of  loading processes  finished*/
					EggbonEditor.canvas.init();
					EggbonEditor.multiSelectionRect.init();
					EggbonEditor.validation.init();
					this.scrollBarWidth = EggbonEditor.util.getScrollbarWidth();
				});

				/* load resolution Info
				EggbonEditor.api.callRemoteApi('getSupportedResolutions', { code_d1 : 2,code_d2 : -1, code_d3 : -1}, function(resolutionResult) {
					if (!resolutionResult || !resolutionResult.searchResult || resolutionResult.searchResult == '' || 
							resolutionResult.resultCode != 0 || resolutionResult.searchResult == 'undefined') {
						console.log('[getSupportedResolutions] wrong reqeust : ' + resolutionResult.resultMsg);
						alert('[getSupportedResolutions] wrong reqeust : ' + resolutionResult.resultMsg );
						return;
					}
					var resolutionInfo = resolutionResult.searchResult;
					console.log("getSupportedResolutions");
					console.log(resolutionResult);
				
				});
				*/
			});
		}
	},

	getUrlParams : function() {
		var params = {};
		window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
			params[key] = value;
		});
		return params;
	}, 
	
	/* 현재 프로젝트에서 페이지 템플릿을 추가
	 * 현재 프로젝트와 템플릿의 크기등이 다를 경우 페이지 템플릿 및 템플릿안의 컴포넌트들도 비율에 
	 * 따라 사이즈를 조정한다.
	 * */
	addPageTmeplateToProject : function(projectResult){
		if (!this.project){
			alert('wrong reqeust : 프로젝트가 존재하지 않습니다');	
			return;	
		}

		var projectInfo = projectResult.searchResult;
		console.log("#### 템플릿 프로젝트 정보 #####");
		console.log(projectInfo);
		
		console.log("#### 템플릿  페이지 정보");
		console.log(JSON.parse(projectResult.searchResult.menu_json));
		
		var pageInfo = this.convertScreenData(JSON.parse(projectInfo.menu_json));
		console.log("##변환된 데이타");
		console.log(pageInfo);
		
		this.loadingProjectSize = { width : projectInfo.width_size, height : projectInfo.height_size};
		this.isPageLoading = true;
		this.createPageFromJson(pageInfo,"add");
		this.loadingProjectSize = null;
		this.isPageLoading = false;
	},
	
	/*
	 * json 으로 부터 프로젝트 생성
	 * 실서버에서 사용되는 프로젝트 생성 함수
	 * */
	createProjectFromJson : function(memberResult, projectResult) {
		var memberInfo = memberResult.searchResult;
		var projectInfo = projectResult.searchResult[0];
		if (this.project) this.project = null;
		var pageInfo = this.convertScreenData(JSON.parse(projectInfo.menu_json));
		var projectOptions = {
			memberInfo : memberInfo,
			projectInfo : projectInfo,
			pageInfo : pageInfo,
			/* member field */
			memberSeq : memberInfo.member_seq,
			memberId : memberInfo.email_id,
			memberName : memberInfo.email_id,
			shopName : memberInfo.shop_name,
			/*it is needed to register the info of order component , menu and price etc */
			shopType : memberInfo.shop_type,
			storeCode : memberInfo.store_code,
			/* project field */
			projectName : projectInfo.prj_name,
			projectSeq : projectInfo.project_seq,
			resolutionWidth : projectInfo.width_size,
			resolutionHeight : projectInfo.height_size,
			pageWidth : projectInfo.width_size,
			pageHeight : projectInfo.height_size,
			/* runtime environment */
			runMode : 'product'
		};
		
		this.project = new EggbonEditor.Project(projectOptions);
		EggbonEditor.controller.init();
		console.log("#### 프로젝트 원본 정보 ");
		console.log(projectInfo);
		
		console.log("#### 프로젝트 페이지 정보");
		console.log(JSON.parse(projectInfo.menu_json));
		
		var pageInfo = this.convertScreenData(JSON.parse(projectInfo.menu_json));
		console.log("#### 변환된 페이지 정보");
		console.log(pageInfo);
		this.createPageFromJson(pageInfo);
	},
	
	/*
	 * json Page date 로 부터 패이지 및 컴포넌트를 생성하고, 현재 프로젝트에 추가
	 * param 
	 *  mode : add : 현재 프로젝트에 템플릿을 추가하는 것으로 현재 선택된 페이지 바로 아래 노드에 템플릿 삽입 
	 *  mode : undefined 나 null 및 add 가 아닌 경우는 로딩후 프로젝트를 바로 생성하는 것으로 순차적으로 루트 노드에 추가 
	 * */
	createPageFromJson : function(pageInfo, mode) {
		var context = this;
		var uchef = pageInfo.UCHEF;
		var header = pageInfo.HEADER;
		var pages = pageInfo.PAGELIST.PAGE;
		var showPage = '';
		var pageContainer = context.getSelectedPage();
		
		$.each(pages, function(index, page) {
			if (mode == "add") {
				pageContainer = context.project.createPageAndInsert('after', pageContainer,{displayName : page.name});
			}else  {
				pageContainer =  context.project.createPage({displayName : page.name}) ;
			}
			
			if (index == 0 ) showPage = pageContainer;
			
			if (page.IMAGECOMP){
				$.each(page.IMAGECOMP, function(inx, comp) {
					var createComponent = context.createSingleComponent(pageContainer, comp, 'image',header);
					createComponent.attach();
				}); 
			}
			
			if (page.LINKBUTTONCOMP){
				$.each(page.LINKBUTTONCOMP, function(inx, comp) {
					var createComponent = context.createSingleComponent(pageContainer, comp, 'link',header);
					createComponent.attach();
				}); 
			}
			
			if (page.TEXTCOMP){
				$.each(page.TEXTCOMP, function(inx, comp) {
					var createComponent = context.createSingleComponent(pageContainer, comp , 'text',header);
					createComponent.attach();
				}); 
			}
			
			if (page.ORDERBUTTONCOMP){
				$.each(page.ORDERBUTTONCOMP, function(inx, comp) {
					var createComponent = context.createSingleComponent(pageContainer, comp ,'order',header);
					createComponent.attach();
				}); 
			}
			
			if (page.LISTCOMP) context.createListComponent(pageContainer, page.LISTCOMP , header);
			if (page.POPUPPAGE) context.createPopComponent(pageContainer, page.POPUPPAGE , header);

		});
		
		this.changeAllComponentSelectStatus(false); 
		if (showPage) this.showPage(showPage.UUID, showPage.name);
		var node = EggbonEditor.controller.$tree.tree('getNodeById', showPage.UUID);
		EggbonEditor.controller.$tree.tree('selectNode', node);
	},

	createListComponent : function(container, listArr,header) {
		var context = this;
		if (listArr && listArr.length && listArr.length > 0) {
			$.each(listArr, function(index, list) {
				var listOptions = context.generateInitialOptions(list);
				var listContainer = container.createComponent('list', true, true, listOptions);
				listContainer.attach();
				
				if (list.LISTROW && list.LISTROW.length > 0) {
					$.each(list.LISTROW, function(inx, listRow) {
						var listrowOptions = context.generateInitialOptions(listRow);
						var listrowContainer = listContainer.createComponent('listrow', true, true, listrowOptions);	
						listrowContainer.attach();
						
						if (listRow.IMAGECOMP){
							$.each(listRow.IMAGECOMP, function(inx, comp) {
								var createComponent = context.createSingleComponent(listrowContainer, comp, 'image',header);
								createComponent.attach();
							}); 
						}
						
						if (listRow.LINKBUTTONCOMP){
							$.each(listRow.LINKBUTTONCOMP, function(inx, comp) {
								var createComponent = context.createSingleComponent(listrowContainer, comp, 'link',header);
								createComponent.attach();
							}); 
						}
						
						if (listRow.TEXTCOMP){
							$.each(listRow.TEXTCOMP, function(inx, comp) {
								var createComponent = context.createSingleComponent(listrowContainer, comp , 'text',header);
								createComponent.attach();
							}); 
						}
						
						if (listRow.ORDERBUTTONCOMP){
							$.each(listRow.ORDERBUTTONCOMP, function(inx, comp) {
								var createComponent = context.createSingleComponent(listrowContainer, comp ,'order',header);
								createComponent.attach();
							}); 
						}
					});
				}
			});
		}
	},

	createPopComponent : function(container, popupArr,header) {
		var context = this;
		if (popupArr && popupArr.length && popupArr.length > 0) {
			$.each(popupArr, function(index, popup) {
				var popupOptions = context.generateInitialOptions(popup);
				var popupContainer = container.createComponent('popup', true, true, popupOptions);
				popupContainer.attach();
				
				if (popup.IMAGECOMP){
					$.each(popup.IMAGECOMP, function(inx, comp) {
						var createComponent = context.createSingleComponent(popupContainer, comp, 'image',header);
						createComponent.attach();
					}); 
				}
				
				if (popup.LINKBUTTONCOMP){
					$.each(popup.LINKBUTTONCOMP, function(inx, comp) {
						var createComponent = context.createSingleComponent(popupContainer, comp, 'link',header);
						createComponent.attach();
					}); 
				}
				
				if (popup.TEXTCOMP){
					$.each(popup.TEXTCOMP, function(inx, comp) {
						var createComponent = context.createSingleComponent(popupContainer, comp , 'text',header);
						createComponent.attach();
					}); 
				}
				
				if (popup.ORDERBUTTONCOMP){
					$.each(popup.ORDERBUTTONCOMP, function(inx, comp) {
						var createComponent = context.createSingleComponent(popupContainer, comp ,'order',header);
						createComponent.attach();
					}); 
				}
				
				if (popup.LISTCOMP) context.createListComponent(popupContainer, popup.LISTCOMP , header);
			});
		}
	},


	createSingleComponent : function(container, comp, componentType,header) {
		var options = this.generateInitialOptions(comp);
		var memberSeq = this.project.memberSeq; 
		var projectSeq = this.project.memberSeq; 
		switch(componentType) {
		case 'image':
			options['imgPath'] = EggbonEditor.resource.getImageResourcePathByBasePath(header.base_path, comp.src, 'image');
			break;
		case 'link':
			options['imgPath'] = EggbonEditor.resource.getImageResourcePathByBasePath(header.base_path, comp.src, 'link');
			options['linkType'] = comp.linktype;
			options['position'] = comp.target;
			break;
		case 'text':
			options['text'] = decodeURIComponent(comp.content_text);
			options['fontFamily'] = EggbonEditor.resource.getFontFamily(comp.font_family);
			options['fontSize'] = EggbonEditor.resource.getFontSize(comp.font_size);
			options['color'] = EggbonEditor.resource.getFontColor(comp.color);
			break;
		case 'order':
			options['imgPath'] =  EggbonEditor.resource.getImageResourcePathByBasePath(header.base_path, comp.src, 'order');
			options['menu'] = comp.menutitle;
			options['menuId'] = comp.item_code;
			options['price'] = comp.price;
			options['unit'] = comp.unit_;
			break;
		}
		var comp = container.createComponent(componentType, true, true, options);
		return comp;
	},

	/* 
	 * 로드한 프로젝트 정보에서 각 페이지의 기본 공동 옵션을 생성
	 * 프로젝트의 해상도 정보를 참조하여 적절하게 확대 축소
	  */
	generateInitialOptions : function(comp) {
		/* default size info  */
		var comSize = { 
			x : parseInt(comp.xpos) , 
			y : parseInt(comp.ypos), 
			width : parseInt(comp.width) , 
			height  : parseInt(comp.height),
			name : comp.name,
			fixRatio : comp.fixRatio
			};
			
		if (this.isPageLoading){
			var projectWidth  = this.project.resolutionWidth;
			var projectHeight = this.project.resolutionHeight;
			
			var pageWidth = this.loadingProjectSize.width;
			var pageHeight = this.loadingProjectSize.height;
			
			if (projectWidth != pageWidth) {
				comSize.x = parseInt((projectWidth * comSize.x) / pageWidth);		
				comSize.width  = parseInt((projectWidth * comSize.width) / pageWidth);		
			}
			
			if (projectHeight!= pageHeight) {
				comSize.y  = parseInt((projectHeight * comSize.y) / pageHeight);		
				comSize.height = parseInt((projectHeight * comSize.height) / pageHeight);	
			}	
		}
		return comSize; 
	},
	/*
	 * 유저에 의한 빈 프로젝트 생성
	 * (테스트 용으로만 사용되고, 실제 운영 서버에서는 사용되지 않음)
	 */
	createProject : function(options) {
		this.project = new EggbonEditor.Project(options);
		return this.project;
	},

	/*해당 페이지 UUID 를 지정해서 해당 페이지를 보여준다 */
	showPage : function(UUID, name) {
		this.project.showPage(UUID, name);
	},

	/*
	 컴포넌트의 최상단 page 를 구해서 page를 보여준다
	 page 와 root project 를 제외한 자식 컴포넌트의 최상단 page 를 재귀적으로 구해
	 해당 페이지를 보여줌
	 */
	showPageFromChild : function(component) {
		if (component.type == 'root') {
			console.log(component.type + " : 해당 컴포넌트의 루트 page 객체를 구할 수 없거나 해당 객체가 page 입니다.");
			return;
		}

		if (component.type == 'page') {
			this.showPage(component.UUID, component.name);
			var node = EggbonEditor.controller.$tree.tree('getNodeById', component.UUID);
			EggbonEditor.controller.$tree.tree('selectNode', node);
			return;
		}

		var parentArr = [];
		this.findParentsRecursive(parentArr, component);
		this.showPage(parentArr[0].UUID, parentArr[0].name);
	},

	hidePage : function(UUID, name) {
		this.project.hidePage(UUID, name);
	},

	/*
	 컴포넌트의 최상단 page 를 구해서 page를 숨김
	 page 와 root project 를 제외한 자식 컴포넌트의 최상단 page 를 재귀적으로 구해
	 해당 페이지를 숨김
	 */
	hidePageFromChild : function(component) {
		if (component.type == 'root' || component.type == 'page') {
			console.log(component.type + " : 해당 컴포넌트의 루트 page 객체를 구할 수 없거나 해당 객체가 page 입니다.");
			return;
		}
		var parentArr = [];
		this.findParentsRecursive(parentArr, component);
		this.showPage(parentArr[0].UUID, parentArr[0].name);
	},

	findParentsRecursive : function(parentArr, component) {
		var parent = component.parent;
		parentArr.unshift(component.parent);
		
		if (component.parent.type == "page") {
			return parentArr;
		} else {
			this.findParentsRecursive(parentArr, parent);
		}
	},

	findChildsRecursive : function(childArr, component) {

	},

	/* 재귀 탐색에 의한 페이지 전체 복사 */
	clonePage : function(page) {
		var context = this;
		var newPage = EggbonEditor.createPage();
		$.each(page.childs, function(inx, child) {
			context.cloneComponent(newPage, child);
			;
		});
		return newPage;
	},

	//재귀 구조에 의하여 복사된 컴포넌트를 일괄 attach
	attachAllComponentRecursive : function(component) {
		var context = this;
		component.parent.addComponent(component);
		component.parent.addComponentToTree(component);
		component.attach();
		$.each(component.childs, function(inx, child) {
			context.attachAllComponentRecursive(child);
		});
	},

	/*
	 재귀 탐색에 의한 객체 및 자식 복사
	 attach 가 true 일경우 복사하면서 dom 생성 및 부착한다.
	 attach false 로 하면 객체 정보 생성만 하되 , 차후 attach 를 호출해야 한다.
	 */
	cloneComponent : function(container, copy, listAdd, treeAdd) {
		var context = this;
		var newComponent = container.createComponent(copy.type, listAdd, treeAdd);
		newComponent.x = copy.x;
		newComponent.y = copy.y;
		newComponent.width = copy.width;
		newComponent.height = copy.height;
		newComponent.fixRatio = copy.fixRatio;

		switch (copy.type) {
		case "image":
			newComponent.imgPath = copy.imgPath;
			break;
		case "text":
			newComponent.text = copy.text;
			newComponent.fontFamily = copy.fontFamily;
			newComponent.fontSize = copy.fontSize;
			newComponent.color = copy.color;
			break;
		case "link":
			newComponent.imgPath = copy.imgPath;
			newComponent.linkType = copy.linkType;
			newComponent.position = copy.position;
			break;
		case "order":
			newComponent.imgPath = copy.imgPath;
			newComponent.menu = copy.menu;
			newComponent.price = copy.price;
			break;
		case "popup":
		case "list":
		case "listrow":
		}
		if (treeAdd == true)
			newComponent.attach();
		$.each(copy.childs, function(inx, child) {
			context.cloneComponent(newComponent, child, listAdd, treeAdd);
		});
		return newComponent;
	},

	/*
	 컨텍스트 메뉴에서 생성된 컴포넌트의 일괄 attach 및 add 용
	 */
	attchComponentForContextAction : function(component) {
		var context = this;
		component.parent.addComponentToTree(component);
		component.attach();
		//console.log('type  : ' + component.type + " child length : " + component.childs.length);
		$.each(component.childs, function(inx, child) {
			context.attchComponentForContextAction(child);
		});
	},

	cloneComponentForContextAction : function(newComponent, copy) {
		var context = this;
		newComponent.x = copy.x;
		newComponent.y = copy.y;
		newComponent.width = copy.width;
		newComponent.height = copy.height;
		newComponent.fixRatio = copy.fixRatio;

		switch (copy.type) {
		case "image":
			newComponent.imgPath = copy.imgPath;
			break;
		case "text":
			newComponent.text = copy.text;
			newComponent.fontFamily = copy.fontFamily;
			newComponent.fontSize = copy.fontSize;
			newComponent.color = copy.color;
			break;
		case "link":
			newComponent.imgPath = copy.imgPath;
			newComponent.linkType = copy.linkType;
			newComponent.position = copy.position;
			break;
		case "order":
			newComponent.imgPath = copy.imgPath;
			newComponent.menu = copy.menu;
			newComponent.price = copy.price;
			break;
		case "popup":
		case "list":
		case "listrow":
		}
		if (copy.childs && copy.childs.length > 0) {
			$.each(copy.childs, function(inx, child) {
				var nComp = newComponent.createComponent(child.type, true, false);
				context.cloneComponentForContextAction(nComp, child);
			});
		}
		return newComponent;
	},
	
	     // 기본 json 데이타를 array 형태로 변환 
		convertScreenData:function(data) {
			if (data) {
				$(data.PAGELIST).each(function() {
					if (this.PAGE && !this.PAGE.length) {
						this.PAGE = [this.PAGE];
					}
					$(this.PAGE).each(function() {
						if (this.IMAGECOMP && !this.IMAGECOMP.length) {
							this.IMAGECOMP = [this.IMAGECOMP];
						}
						if (this.TEXTCOMP && !this.TEXTCOMP.length) {
							this.TEXTCOMP = [this.TEXTCOMP];
						}
						if (this.LINKBUTTONCOMP && !this.LINKBUTTONCOMP.length) {
							this.LINKBUTTONCOMP = [this.LINKBUTTONCOMP];
						}
						if (this.POPUPPAGE && !this.POPUPPAGE.length) {
							this.POPUPPAGE = [this.POPUPPAGE];
						}
						if (this.ORDERBUTTONCOMP && !this.ORDERBUTTONCOMP.length) {
							this.ORDERBUTTONCOMP = [this.ORDERBUTTONCOMP];
						}
						if (this.LISTCOMP && !this.LISTCOMP.length) {
							this.LISTCOMP = [this.LISTCOMP];
						}
						$(this.LISTCOMP).each(function() {
							if (this.LISTROW && !this.LISTROW.length) {
								this.LISTROW = [this.LISTROW];
							}
							$(this.LISTROW).each(function() {
								if (this.IMAGECOMP && !this.IMAGECOMP.length) {
									this.IMAGECOMP = [this.IMAGECOMP];
								}
								if (this.TEXTCOMP && !this.TEXTCOMP.length) {
									this.TEXTCOMP = [this.TEXTCOMP];
								}
								if (this.LINKBUTTONCOMP && !this.LINKBUTTONCOMP.length) {
									this.LINKBUTTONCOMP = [this.LINKBUTTONCOMP];
								}
								if (this.ORDERBUTTONCOMP && !this.ORDERBUTTONCOMP.length) {
									this.ORDERBUTTONCOMP = [this.ORDERBUTTONCOMP];
								}
							});
						});
						$(this.POPUPPAGE).each(function() {
							//console.warn('this.popuppage %O', this.POPUPPAGE);
							//console.warn('this %O', this);
							//console.warn('this.popuppage.imagecomp %O', this.IMAGECOMP);
							if (this.IMAGECOMP && !this.IMAGECOMP.length) {
								this.IMAGECOMP = [this.IMAGECOMP];
							}
							if (this.TEXTCOMP && !this.TEXTCOMP.length) {
								this.TEXTCOMP = [this.TEXTCOMP];
							}
							if (this.LINKBUTTONCOMP && !this.LINKBUTTONCOMP.length) {
								this.LINKBUTTONCOMP = [this.LINKBUTTONCOMP];
							}
							if (this.ORDERBUTTONCOMP && !this.ORDERBUTTONCOMP.length) {
								this.ORDERBUTTONCOMP = [this.ORDERBUTTONCOMP];
							}
							
							if (this.LISTCOMP && !this.LISTCOMP.length) {
								this.LISTCOMP = [this.LISTCOMP];
							}
							
							$(this.LISTCOMP).each(function() {
								if (this.LISTROW && !this.LISTROW.length) {
									this.LISTROW = [this.LISTROW];
								}  
								$(this.LISTROW).each(function() {
									if (this.IMAGECOMP && !this.IMAGECOMP.length) {
										this.IMAGECOMP = [this.IMAGECOMP];
									}
									if (this.TEXTCOMP && !this.TEXTCOMP.length) {
										this.TEXTCOMP = [this.TEXTCOMP];
									}
									if (this.LINKBUTTONCOMP && !this.LINKBUTTONCOMP.length) {
										this.LINKBUTTONCOMP = [this.LINKBUTTONCOMP];
									}
									if (this.ORDERBUTTONCOMP && !this.ORDERBUTTONCOMP.length) {
										this.ORDERBUTTONCOMP = [this.ORDERBUTTONCOMP];
									}
								});
							});
							
						});
					});
				});
			}
			console.error('data=%O', data);
			return data;
		},
		
	initialzeTooluttonEventHandler : function() {
		EggbonEditor.controller.init();
	},

	createPage : function() {
		if (!this.project)
			concole.log("No project");
		var page = this.project.createPage();
		return page;
	},

	isRegiteredPage : function(pageNo) {
		for (var page in this.pages) {
			if (pageObj.get("pageNo") == pageNo) {
				return true;
			}
		}
		return false;
	},

	changeAllComponentSelectStatus : function(page, status) {
		this.project.changeAllComponentSelectStatus(page, status);
	},
	
	changeStatusAllComponentOfPage : function(page, status){	
		this.project.changeAllComponentOfPage(page, status);
	},

	removePage : function(page) {
		this.project.removePage(page);
	},

	findPage : function(pageNo) {
		var page;
		for (var pageTemp in this.pages) {
			if ( pageNo = pageTemp.get("pageNo")) {
				page = pageTemp;
			}
		}
		return page;
	},

	getProject : function() {
		return this.project;
	},

	setSelectedPage : function(page) {
		this.project.setSelectedPage(page);
	},

	setSelectedComponent : function(component) {
		this.project.setSelectedComponent(component);
	},

	getSelectedPage : function() {
		return this.project.getSelectedPage();
	},

	getSelectedComponent : function() {
		return this.project.getSelectedComponent();
	},

	getPropery : function(property) {
		if (this.hasOwnProperty(property)) {
			return this[property];
		}
		return false;
	},

	setProperty : function(property, value) {
		this[property] = value;
	}
};

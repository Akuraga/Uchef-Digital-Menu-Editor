EggbonEditor = EggbonEditor || {};
EggbonEditor.class = {
    //functions added to a sub class
    subClassAddfuncs: {
        get: function (property) {
            if (this.hasOwnProperty(property)) {
                return this[property];
            } else {
                return fasle;
            }
        },
        get: function (property, value) {
            if (this.hasOwnProperty(property)) {
                this[property] = value;
                return true;
            }
            return false;
        }
    },

    extend: function (childProto, parentFunc, addFunc, parentProto) {
        if (parentProto != null) {
            childProto.parentClass = parentProto;  // 부모 클래스의 함수를 호출하기휜 parentclass 설정 
        }
        if (parentFunc != null) {
            for (var property in parentFunc) {
                childProto[property] = parentFunc[property];
            }
        }
        if (addFunc != null) {
            for (var property in addFunc) {
                childProto[property] = addFunc[property];
            }
        }
    }
};

EggbonEditor.Page = function (pageNo, name, options) {
    this.pageNo = pageNo;
    this.UUID = EggbonEditor.util.genUUID();
    if (options) this.extract(options);
    this.componentId = this.id = this.fullName = this.shortId = this.name = name;   // 컴포넌트의 경우는 componentId, wrapperId, fullname 과 동일 
    if (!this.displayName) this.displayName = this.name;
    //console.log("페이지 이름 : " + this.displayName );
    this.childs = new Array();
    this.isComponentAction = false;
    this.selectedComponent = null;
    this.type = "page";
    this.selectedStatus = true;
    
    this.preparePageSettings();
    this.selectionRect = "";
    

};

EggbonEditor.Page.prototype.preparePageSettings = function () {
    this.$pageHolderSelector = $('<div style ="left:0px; top:0px;width:100%;height:100%" class ="editor-page page ' + this.name + '"></div>"');
    this.$pageHolderSelector.css({ 'position': 'absolute', 'overflow': 'visible' });
    this.$pageHolderSelector.addClass('cross_grid_line');
    this.$pageHolderSelector.addClass('page-border');
    this.$pageHolderSelector.addClass(this.name);
    this.$pageHolderSelector.appendTo($(EggbonEditor.holder));
    this.pageHolderSelectorStr = "." + this.name;
    var context = this;
    EggbonEditor.setSelectedPage(this);
};

EggbonEditor.Page.prototype.findComponents = function (type) {
    var arr = [];
    $.each(this.childs, function (index, child) {
        if (child.type == type)
            arr.push(child);
    });
    return arr;
};

EggbonEditor.Page.prototype.extract = function (options) {
    var context = this;
    $.each(options, function (key, value) {
        context.setProperty(key, value);
    });
};

//getter
EggbonEditor.Page.prototype.getProperty = function(key) {
	if (this.hasOwnProperty(key)) {
		return this[key];
	} else {
		return false;
	}
};

EggbonEditor.Page.prototype.setProperty = function(key, value) {
	this[key] = value;
};

EggbonEditor.Page.prototype.show = function () {this.$pageHolderSelector.show();
};

EggbonEditor.Page.prototype.hide = function () {
    this.$pageHolderSelector.hide();
};

EggbonEditor.Page.prototype.destroy = function () {
    this.$pageHolderSelector.remove();
};

EggbonEditor.Page.prototype.setPageDisplayPos= function (x, y) {
	console.log(x +' : '+y);
    this.$pageHolderSelector.css({'position' : 'absolute', 'display':'block', 'left' : x + 'px', 'top' : y + 'px'});
};

EggbonEditor.Page.prototype.changeAllComponentSelectStatusRecursive = function (source, status) {
    console.log("recursive ");
    var context = this;
    if (source.childs && source.childs.length > 0) {
        $.each(source.childs, function (index, child) {
            if (child.type == "list" || child.type == 'listrow' || child.type == "popup") {
                context.changeAllComponentSelectStatusRecursive(child, status);
            } else {
                if (status) {
                    child.showBorderTool();
                    child.showGripTool();
                    child.selectStatus = true;
                } else {
                    child.hideBorderTool();
                    child.hideGripTool();
                    child.selectStatus = false;
                }
            }
        });
    }
};

EggbonEditor.Page.prototype.changeAllComponentSelectStatus = function (status) {
    var context = this;
    if (this.childs.length > 0) {
        $.each(this.childs, function (index, child) {
            if (child.type == "list") {
                context.EnableComponentBorderAndGrip(child, status);
                $.each(child.childs, function (index, listRow) {
                    $.each(listRow.child, function (k, listRowChild) {
                        context.EnableComponentBorderAndGrip(listRowChild, status);
                    });
                    context.EnableComponentBorderAndGrip(listRow, status);
                });
            }
            else if (child.type == "popup") {
                context.EnableComponentBorderAndGrip(child, status);
                $.each(child.childs, function (index, popupChild) {
                    if (popupChild.type == "list") {
                        $.each(popupChild.childs, function (index, listRow) {
                            $.each(listRow.childs, function (index, finalChild) {
                                context.EnableComponentBorderAndGrip(finalChild, status);
                            });

                        });
                    } else {
                        context.EnableComponentBorderAndGrip(popupChild, status);
                    }
                });

            } else {
                context.EnableComponentBorderAndGrip(child, status);
            }
        });
    }
};

EggbonEditor.Page.prototype.EnableComponentBorderAndGrip = function (component, status) {
    if (status) {
        component.showBorderTool();
        component.showGripTool();
        component.selectStatus = true;
    } else {
        component.hideBorderTool();
        component.hideGripTool();
        component.selectStatus = false;
    }
};

//특정 좌표가 컴포넌트에 해당되는지 조사 
EggbonEditor.Page.prototype.isIncludePosition = function (x, y) {
    var isInclude = false;
    for (var i = 0; i < this.childs.length ; i++) {
        var com = this.childs[i];
        if (x >= com.x && y >= com.y && x <= com.x + com.width && y <= com.y + com.height) {
            isInclude = true;
        }
    }
    return isInclude;
};

EggbonEditor.Page.prototype.clearAll = function () {

    for (var i = 0; this.childs.length; i++) {
        this.childs[i].selectStatus = false;
        this.childs[i].detach();
    }
    EggbonEditor.setSelectedComponent(null);
    this.childs.length = 0;
    EggbonEditor.controller.setComCount("#page1", this.childs.length);
};

EggbonEditor.Page.prototype.setSelectedComponent = function (component) {
    this.selectedComponent = component;
};

EggbonEditor.Page.prototype.addComponent = function (component) {
    this.childs.push(component);
    this.curChildInx++;
    EggbonEditor.controller.setComCount("#page1", this.childs.length);
};

EggbonEditor.Page.prototype.addComponentToTree = function (component) {
    var parentNode = EggbonEditor.controller.$tree.tree("getNodeById", this.UUID);
    EggbonEditor.controller.$tree.tree(
        'appendNode',
        {
            label: component.name,
            id: component.UUID,
            type : component.type,
            data: component
        },
        parentNode
    );
    EggbonEditor.controller.$tree.tree('openNode', parentNode);
};

EggbonEditor.Page.prototype.removeComponent = function (component) {
    var index = -1;
    $.each(this.childs, function (inx, child) {
        if (child.getProperty('UUID') == component.getProperty('UUID')) {
            index = inx;
            return;
        }
    });

    if (index != -1) {
        this.childs.splice(index, 1);
    }
    this.removeCompoentToTree(component);
    //EggbonEditor.controller.setComCount("#page1", this.childs.length);

    component.selectStatus = false;
    component.detach();
};

EggbonEditor.Page.prototype.removeCompoentToTree = function (component) {
    var node = EggbonEditor.controller.$tree.tree("getNodeById", component.UUID);
    EggbonEditor.controller.$tree.tree('removeNode', node);
};

EggbonEditor.Page.prototype.adjustComponentSize = function (zoom) {
    for (var i = 0; i < this.childs.length ; i++) {
        var component = this.childs[i];
        var ox = component.x;
        var oy = component.y;
        var owidth = component.width;
        var oheight = component.height;

        var tx = parseInt(ox * (zoom / 100)) - component.cornerActionTriggerRadius;
        var ty = parseInt(oy * (zoom / 100)) - component.cornerActionTriggerRadius;

        var twidth = parseInt(owidth * (zoom / 100));
        var theight = parseInt(oheight * (zoom / 100));
        $(component.externalWrapperQueryStr).css('left', tx + "px");
        $(component.externalWrapperQueryStr).css('top', ty + "px");
        $(component.originalElement).css('width', twidth + "px");
        $(component.originalElement).css('height', theight + "px");
        component.adjustWrapper();
        component.adjustResizingBorder();
    }
};
/*
param 
   componentType : 생성할 컴포넌트
   listAdd : 컴포넌트를 내부 관리할 지 여부 
*/
EggbonEditor.Page.prototype.createComponent = function (componentType, childAdd, treeAdd,options) {

    EggbonEditor.contextMenu.close();
    var com = EggbonEditor.Component.build(this, componentType,options);
    if (childAdd == true) {
        this.addComponent(com);
    }
    if (treeAdd) {
        this.addComponentToTree(com);
    }
    EggbonEditor.controller.setComCount("#page1", this.childs.length);
    return com;
};

//페이지에 등록된 컴포턴트 타입별로 순차적인 인덱스를 생성
EggbonEditor.Page.prototype.createComponentNo = function (type) {
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

//페이지에 등록된 컴포턴트 타입별로 순차적인 인덱스를 생성
EggbonEditor.Page.prototype.genComponentNo = function (type) {
    var index = 0;
    var matchChilds = $.map(this.childs, function (comp) {
        if (comp.type == type) {
            return comp;
        }
    });

    if (Array.isArray(matchChilds)) {
        if (matchChilds.length == 0) {
            index = 1;
        } else {
            index = matchChilds[matchChilds.length - 1].no;
        }
        return index;
    }
};

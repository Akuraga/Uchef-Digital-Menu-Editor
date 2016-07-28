
/* 주기적인 Component Validation */
EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.validation = {
        validationTimeId :  -1,
        init: function () {},

        startValidation: function (validationInterval) {
            var context = this;
            this.validationTimeId = setInterval(function () {
                if (EggbonEditor.project.pages && EggbonEditor.project.pages.length > 0) {
                    //console.log("### 백그라운드 유효성 체크 시작");
                    //console.log("### 총 페이지 갯수 : " + EggbonEditor.project.pages.length);

                    $.each(EggbonEditor.project.pages, function (index, page) {
                        context.validate(page);
                    });
                }
            },validationInterval);
        },

        stopValidation: function () {
            clearInterval(this.validationTimeId);
        },

        validate: function (component) {
            //console.log("validate");
            var context = this;
            this.validateComponent(component);
            $.each(component.childs, function (index, comp) {
                context.validate(comp);
            });
        },
        
        validateComponent: function (component) {
           
            var isValid = true;
            switch (component.type) {
                case "image":
                    this.validateImageComponent(component);
                    break;
                case "text":
                    this.validateTextComponent(component);
                    break;
                case "link":
                    this.validateLinkComponent(component);
                    break;
                case "order":
                    this.validateOrderComponent(component);
                    break;
                case "popup":
                case "list":
                case "listrow":
                    break;
            }
        },
     
        showAndHideAlertMarker : function(component) {
            var alertSelector = ['alert', component.UUID].join('_');
            //console.log("처리할 마커 : " + alertSelector);
            if (component.isValid == true) {
                $("#" + alertSelector).hide();
            } else {
                $("#" + alertSelector).show();
            }
            component.validationErrorMessages.length = 0;
        },

        validateImageComponent : function(component) {
            this.isComponentNameNullOfEmpty(component);
            this.isValidCoordNumber(component);
            if (component.validationErrorMessages.length > 0) {
                component.isValid = false;
            } else {
                component.isValid = true;
            }
            this.showAndHideAlertMarker(component);
        },

        validateTextComponent: function (component) {
            this.isComponentNameNullOfEmpty(component);
            this.isValidCoordNumber(component);
            
             if (this.isNullOrEmpty(component.text)) {
                component.validationErrorMessages.push("empty text ");
            }
            
            if (component.validationErrorMessages.length > 0) {
                component.isValid = false;
            } else {
                component.isValid = true;
            }
            this.showAndHideAlertMarker(component);
        },

        validateLinkComponent: function (component) {
            this.isComponentNameNullOfEmpty(component);
            this.isValidCoordNumber(component);

            if (this.isNullOrEmpty(component.linkType)) {
                component.validationErrorMessages.push("wrong link type");
            }
            if (this.isNullOrEmpty(component.position)) {
                component.validationErrorMessages.push("wrong postion");
            }
            if (component.validationErrorMessages.length > 0) {
                component.isValid = false;
            } else {
                component.isValid = true;
            }
            //alert(component.validationErrorMessages.join("_"));
            this.showAndHideAlertMarker(component);
        },

        validateOrderComponent: function (component) {
            this.isComponentNameNullOfEmpty(component);
            this.isValidCoordNumber(component);

            if (this.isNullOrEmpty(component.menu)) {
                component.validationErrorMessages.push("wrong menu");
            }
            if (this.isNullOrEmpty(component.price) ) {
                component.validationErrorMessages.push("wrong price");
            }

            if (component.validationErrorMessages.length > 0) {
                component.isValid = false;
            } else {
                component.isValid = true;
            }
            this.showAndHideAlertMarker(component);
            
        },
        
        isValidCoordNumber: function (component) {
            if (!$.isNumeric(component.x) || !$.isNumeric(component.y) || !$.isNumeric(component.width) || !$.isNumeric(component.height)) {
                component.isValid = false;
                component.validationErrorMessages.push("wrong component coordiante");
            } else {
                component.isValid = true;
            }
        },

        isNullOrEmpty : function(str) {
            if (!str || str.length  < 1 || str == '') {
                return true;
            } else {
                return false;
            }
        },
        isComponentNameNullOfEmpty: function (component) {
            if (!component.name || component.name.length < 0 || component.name== '') {
                component.isValid = false;
                component.validationErrorMessages.push("wrong component name");
            } else {
                component.isValid = true;
            }
        }

    };
});
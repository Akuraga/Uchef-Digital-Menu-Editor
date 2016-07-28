(function () {
    if (!EggbonEditor.config) {
        EggbonEditor.config = {
            setConfig: function (customConfig) {
                var defaultConfig = {
                    componentType : {
                        image: { typeName: "image", permittableChild: false, permittableChildComps: [] },
                        link: { typeName: "link", permittableChild: false, permittableChildComps: [] },
                        text: { typeName: "text", permittableChild: false, permittableChildComps: [] },
                        order: { typeName: "order", permittableChild: false, permittableChildComps: [] },
                        list: { typeName: "list", permittableChild: true, permittableChildComps: ['listrow'] },
                        listrow: { typeName: "listrow", permittableChild: true, permittableChildComps: ['image', 'text', 'link', 'order'] },
                        popup: { typeName: "image", permittableChild: true, permittableChildComps: ['image', 'text', 'link', 'order', 'list'] },
                        page: { typeName: "page", permittableChild: true, permittableChildComps: ['image', 'text', 'link', 'order', 'list', 'popup'] },
                        root: { typeName: "root", permittableChild: true, permittableChildComps: ['page'] }
                    },
                    droppableConatiner: {
                        image: { typeName: "image", permittableChild: false, permittableChildComps: [] },
                        link: { typeName: "link", permittableChild: false, permittableChildComps: [] },
                        text: { typeName: "text", permittableChild: false, permittableChildComps: [] },
                        order: { typeName: "order", permittableChild: false, permittableChildComps: [] },
                        list: { typeName: "list", permittableChild: true, permittableChildComps: ['listrow'] },
                        listrow: { typeName: "listrow", permittableChild: true, permittableChildComps: ['image', 'text', 'link', 'order'] },
                        popup: { typeName: "image", permittableChild: true, permittableChildComps: ['image', 'text', 'link', 'order', 'list'] },
                        page: { typeName: "page", permittableChild: true, permittableChildComps: ['image', 'text', 'link', 'order', 'list', 'popup'] },
                        root: { typeName: "root", permittableChild: true, permittableChildComps: ['page'] }
                    },
                    resolutions : [
                        { type: "Phone", displayText: "Phone(720x1020) - 추천", width: 720, height: 1020, recommend: true },
                        { type: "Phone", displayText: "Phone(1440x1840)", width: 1440, height: 1840, recommend: false },
                        { type: "Tablet", displayText: "Tablet(480x800)", width: 480, height: 800, recommend: false },
                        { type: "Tablet", displayText: "Tablet(1280x800)", width: 1280, height: 800, recommend: false },
                        { type: "Tablet", displayText: "Tablet(1026x600)", width: 1024, height: 600, recommend: false },
                        { type: "other", displayText: "Other(768x1280)", width: 768, height: 1280, recommend: false }
                    ],
					
					componentZinde : { 'image' : 1,'order' : 2,'link' : 3,'text' : 4,'list' : 5,'popup' : 1 },
                    autoSaveInterval : 5000,
                    autoSaveEnable: false,
                    validationInterval: 3000,
                    valdiationEnable: false,
                    scrollBarWidth: 0,
                    sustainedSession: false 
                };

                if (customConfig) {
                    EggbonEditor.config= $.extend(defaultConfig, config);
                }
                else {
                    EggbonEditor.config = defaultConfig;
                }
                EggbonEditor.componentType = EggbonEditor.config.componentType;
            },
            
            get: function (property) {
                if (this.hasOwnProperty(property)) {
                    return this[property];
                }
                return false;
            }
        };
    }
    EggbonEditor.config.setConfig();
})();

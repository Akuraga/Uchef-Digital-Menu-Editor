EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.orderWindow = {
    	init : function(){},
    	isSuperUser : function(){ return EggbonEditor.project.isSuperUser();},
    	IsTemplateProject : function(){return EggbonEditor.project.IsTemplateProject();}
    };
    EggbonEditor.session.init();
});


EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.projectWindow = {
       $newProjectContainer : '',
        init: function () {},

        show: function () {
            this.$newProjectContainer = $(EggbonEditor.newProjectWindowHTML);
            $('body').prepend(this.$newProjectContainer);
            this.initializeProjectWindowEventHandler();
            this.$newProjectContainer.show();
         
        },

        initializeProjectWindowEventHandler : function(){
            var context = this;
            this.$newProjectContainer.find('#btn_close_new_project , .btn_npcancel').click(function (event) {
                context.close();
            });

            this.$newProjectContainer.find('.btn_npcreate').click(function (event) {
                alert("프로젝트 생성");
            });
        },

        close: function () {
            this.$newProjectContainer.hide();
            this.$newProjectContainer.remove();
        }
    };
    EggbonEditor.projectWindow.init();
});


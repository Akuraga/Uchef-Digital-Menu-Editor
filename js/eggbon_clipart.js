EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.clipArt = {
        
        init: function () {},
		isShown : false,
		
		initializeEventHandler : function(){
			var conext = this;
			this.$clipArtConainer.find('.btn-close-page').click(function(event){
				conext.close();
			});
			
			this.$clipArtConainer.find('.view_th').click(function(event){
				$(this).addClass('select');
				$('.view_list').removeClass('select');
				$('#icon_container').removeClass('iconlist_b');
				
				$('#icon_container').addClass('iconlist_a');
			});
			
			this.$clipArtConainer.find('.view_list').click(function(event){
				$(this).addClass('select');
				$('.view_th').removeClass('select');
				$('#icon_container').removeClass('iconlist_a');
				$('#icon_container').addClass('iconlist_b');
			});
			
			this.$clipArtConainer.find('.newpage_btn_close').click(function(event){
				conext.close();
			});		
			
			this.$clipArtConainer.find('.sort').click(function(event){
				event.preventDefault();
				conext.$clipArtConainer.find('.sort').removeClass('select');
				$(this).addClass('select');
				var sort = $(this).data('sort');

				var $clipArtUL = conext.$clipArtConainer.find('#icon_container');
				var $clipArtLI  = conext.$clipArtConainer.find('.clip_art');
				$clipArtLI.sort(function(a,b){
					var a_value = a.getAttribute(sort);	
					var b_value = b.getAttribute(sort);	
					console.log(a_value + " : " + b_value);
					 return (a_value < b_value ) ? -1 : (a_value > b_value) ? 1 : 0;
				});
				$clipArtLI.detach().appendTo($clipArtUL);
				//var $cloneLi = $clipArtLI.clone();
				//$clipArtUL.empty();
				//$.each($cloneLi, function(idx, itm) { $clipArtUL.append(itm); });
			});					
		},
		
		show : function(){
			if (this.isShown) this.close();
			
			var context = this;
            this.$clipArtConainer = $(EggbonEditor.clipArtHTML);
            $('body').prepend(this.$clipArtConainer);
            this.$clipArtTree = this.$clipArtConainer.find('#clip_cate_tree');
            this.$clipArtConainer.show();
            this.initializeEventHandler();

            var clipArt_cate1_code_d1 = 5; clipArt_cate1_code_d2 = -1; clipArt_cate1_code_d3 = -0;
            var clipArt_cate2_code_d1 = 5 ;clipArt_cate2_code_d2 = -1; clipArt_cate2_code_d3 = -1;
   			
   			var cateTree = [];
   			/* load clipart category1*/          
			EggbonEditor.api.callRemoteApi('loadCode', { code_d1: clipArt_cate1_code_d1, code_d2: clipArt_cate1_code_d2, code_d3: clipArt_cate1_code_d3 }, function (clipCate1Result) {
				if (clipCate1Result.resultCode !=0) {
					alert(clipCate1Result.resultMsg);
					return;
				}
				
                var clipArtCategoryList1 = clipCate1Result.searchResult;
                console.log("클립 카레고리 1");
                console.log(clipArtCategoryList1);
                /* load clipart category1*/
                EggbonEditor.api.callRemoteApi('loadCode', { code_d1: clipArt_cate2_code_d1, code_d2: clipArt_cate2_code_d2, code_d3: clipArt_cate2_code_d3 }, function (clipCate2Result) {
                	if (clipCate2Result.resultCode !=0) {
						alert(clipCate2Result.resultMsg);
						return;
					}
					
                	var clipArtCategoryList2 = clipCate2Result.searchResult;
                	console.log("클립 카레고리 2");
                	console.log(clipArtCategoryList2);
                	  $.each(clipArtCategoryList1, function (index, clipCateInfo1) {
                	  	var clipCate1_code_name = clipCateInfo1.code_name;
                	  	var clipCate1_code_d1 = clipCateInfo1.code_d1;
                	  	var clipCate1_code_d2 = clipCateInfo1.code_d2;
                	  	var clipCate1_code_d3 = clipCateInfo1.code_d3;
                	  	var clipCate1_code_seq = clipCateInfo1.code_seq;
                	  		
                	  	var cateTreeItem = {
                	  		text : clipCate1_code_name, 
                	  		id : clipCate1_code_seq , 
                	  		d1 : clipCate1_code_d1, 
                	  		d2 : clipCate1_code_d2, 
                	  		d3 : clipCate1_code_d3,
                	  		code_seq : clipCate1_code_seq,
                	  		level_deps : 1, 
                	  		children: []};
                	  	
                		$.each(clipArtCategoryList2 , function (index, clipCateInfo2) {
	                		var clipCate2_code_name = clipCateInfo2.code_name;
	                	  	var clipCate2_code_d1 = clipCateInfo2.code_d1;
	                	  	var clipCate2_code_d2 = clipCateInfo2.code_d2;
	                	  	var clipCate2_code_d3 = clipCateInfo2.code_d3;
	                	  	var clipCate2_code_seq = clipCateInfo2.code_seq;
      						
                			if (clipCate1_code_d2 == clipCate2_code_d2) {
                				cateTreeItem.children.push(
                					{
                						text : clipCate2_code_name,
                						id  : clipCate2_code_seq, 
                	  					d1 : clipCate2_code_d1, 
                	  					d2 : clipCate2_code_d2, 
                	  					d3 : clipCate2_code_d3,
                	  					code_seq : clipCate2_code_seq,
                	  					level_deps : 2,  
                						id : clipCate2_code_seq}
                					);	
                			}
                		});
                		cateTree.push(cateTreeItem);
                	 });
					context.$clipArtTree.on('loaded.jstree', function(){
						context.$clipArtTree.jstree('open_all'); 
						context.$clipArtTree.jstree('select_node', '#115'); 
						context.$clipArtTree.jstree('activate_node', '#115'); 
						context.$clipArtTree.jstree('show_icons'); 
						context.$clipArtTree.jstree('show_dots'); 
					});
            		context.$clipArtTree.jstree({
            		 	core : {
            		 		data : cateTree,
            		 		open_parents: true,
            		 		load_open: true,
            		 		themes: { 
            		 			icons : true, 
            		 			dots : true
            		 		}, 
            		 	},
            		 	plugins : ['theme']
            		 });
            		 
            		context.$clipArtTree.bind("select_node.jstree", function (event, data) {
						var original = data.node.original;
						if (original.level_deps == 1){
							return;
						}else {
							context.loadClipArts(original.code_seq);
						}
					});
                });
            });
		},
		
		loadClipArts : function(code) {
			var param = {code_seq : code};
			var context = this;
			 EggbonEditor.api.callRemoteApi('loadClipArts', param, function (result) {
            	console.log(result);

                var clipArts  = result.searchResult.list; 
                $clipArtUL = context.$clipArtConainer.find('#icon_container');
                $clipArtUL.empty();
                
                $.each(clipArts, function(inx, clipArt){
                	var $clipArtLI = $('<li class ="clip_art"></li>').attr({name : clipArt.name,type : clipArt.type,size : clipArt.size,modified : clipArt.date }).css('border' , '1px solid #ddd');	
                	var clipArtImg = $('<img/>');
                	clipArtImg.attr('src', clipArt.url);
                	$clipArtLI.append(clipArtImg); 
                	var clipArtDiv = $("<div></div>");
                	clipArtDiv.append('<p class="filename"><a href="">'+ clipArt.name+ '</a></p>');
                	var readableDate = new Date(clipArt.date);
                	clipArtDiv.append(
                		'<p class="fileinfo">' + readableDate.toLocaleString() + '<br />'+
					 	 'Type : '+ clipArt.type +'  <span>/</span>  Source : file <span>/</span> Size : '+ clipArt.width+ '*' +  clipArt.height + ' ('+ parseInt(clipArt.size / 1024) + 'KB)'+
						'</p>'
					);
					$clipArtLI.append(clipArtDiv);
					$clipArtUL.append($clipArtLI);
					$clipArtLI.click(function(event){
						var selectedComponent = EggbonEditor.getSelectedComponent();
						selectedComponent.setImage(clipArtImg.attr('src'));  
						context.close();
					});
                });
                $('.view_th').addClass('select');
				$('.view_list').removeClass('select');
            });
		},
		
		close : function(){
			this.$clipArtConainer.hide();
            this.$clipArtConainer.remove();
			this.isShown = false;
		}
    };
    EggbonEditor.clipArt.init();
});





























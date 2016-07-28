EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.orderWindow = {
    	$orderWindow : '',
    	$productGroupListContainer : '',
    	$productListContainer : '',
    	
    	isProductSelected : false,
    	selectedProductGroupCode :  -1,
    	selectedProductGroupName: '',

    	selectedProductCode :  -1,
    	selectedProductName  : '',
    	
    	init : function(){
    		
    	},
    	
       loadMenuGroupInfo : function(){
       		var context = this;
       		this.$productGroupListContainer.empty();
    		this.$productListContainer.empty();
	       
	       	EggbonEditor.api.callRemoteApi('loadProductGroup',{}, function(result){
			if (result.resultCode !=0){
	    		console.log("[loadProductGroup] wrong request : " + result.resultMsg);
	    		alert("[loadProductGroup] wrong request : " + result.resultMsg);
	    		return;
	    	}
	    	var groupList = result.searchResult;
	    	$.each(groupList, function(index, group){
	    		var groupCode = group.grp_code;
	    		var groupName = group.grp_name;
	    		var posMenuGroupSeq  = group.pos_menugroup_seq;    	
	    		console.log(groupCode + " : " + groupName);			
	    		
	    		var $groupItem = $('<li>' + groupName +'</li>').appendTo(context.$productGroupListContainer);
	    		$groupItem.attr('group_name',groupName );
	    		$groupItem.attr('group_code',groupCode);
	    		
	    		$groupItem.click(function(event){
	    			context.$productGroupListContainer.find('.selected').removeClass('selected');
	    			$(this).addClass('selected'); 
	    			
	    			context.selectedProductGroupCode = groupCode;   // 선택한 메뉴 그룹 코드 
	    			context.selectedProductGroupName= groupName;   // 선택한 메뉴 그룹 이름 
	    			context.selectedProductCode = -1;    // 선택한 해당 상품 코드 
	    			context.selectedProductName = '';    // 선택한 해당 상품 이름 
	    			
	    			var displayCate = context.selectedProductGroupName? context.selectedProductGroupName: "Category"; 
	    			var displayPro = context.selectedProductName ? context.selectedProductName : "선택 메뉴";
	    			 
	    			context.$orderWindow.find('.selected_cate_product').text(displayCate + "/" + displayPro );
	    			
	    			EggbonEditor.api.callRemoteApi('loadProductByProductGroup', { group_code : $(this).attr('group_code')}, function(result){
	    				if (result.resultCode !=0){
	    					console.log("[loadProductByProductGroup] wrong request : " + result.resultMsg);
	    					alert("[loadProductByProductGroup] wrong request : " + result.resultMsg);
	    					return;
	    				}
	    				var itemList = result.searchResult; 
	    				context.$productListContainer.empty();
	    				$.each(itemList, function(index, item){
	    					var itemName = item.item_name;
	    					var itemCode = item.item_code;
	    					var itemStock = item.stock;
	    					var itemPrice = item.price;
	    					
	    					var $item = $( '<li>' + itemName + '<span>(' + itemPrice+ ')</span></li>').appendTo(context.$productListContainer);
	    					$item.attr('item_code',itemCode);
	    					$item.attr('item_name',itemName);
	    					$item.attr('item_price',itemPrice);
	    					$item.attr('item_stock',itemStock);
	    					
	    					$item.click(function(event){
	    						context.$productListContainer.find('.selected').removeClass('selected');
	    						$(this).addClass('selected');
	    						
	    						context.selectedProductName = itemName; 
	    						context.selectedProductCode = itemCode;
	    						context.selectedProductPrice = itemPrice;  
	    						context.selectedProductStock = itemStock;  
	    					
	    						var displayCate = context.selectedProductGroupName ? context.selectedProductGroupName : "Category"; 
	    						var displayPro = context.selectedProductName ? context.selectedProductName : "선택 메뉴";
	    						context.$orderWindow.find('.selected_cate_product').text(displayCate + "/" + displayPro );
	    					});
	    				});
	    			});
	    		});
    		context.$productGroupListContainer.find('li:first').trigger('click');
    	});
    		});
       },
    	
       show : function(){
    		
    		var context = this; 
    		this.isProductSelected =  false; 
    		
    		this.$orderWindow = $(EggbonEditor.orderWindowHTML);
    		this.$orderWindow.prependTo($('body'));
    		this.$addMenu = this.$orderWindow.find('button.btn_add_product');

    		this.$addMenu.click(function(event){
    			context.$addMenuContainer = $(EggbonEditor.addMenuContainerHTML);
    			
    			$('body').prepend(context.$addMenuContainer );
    			context.$addMenuContainer.find('#add_memu_iframe').attr('src',location.protocol + "//" + location.host + '/web.action?mode=3300');
    			context.$addMenuContainer.css('position', 'absolute');
    			context.$addMenuContainer.css('z-index', '999999999');
    			context.$addMenuContainer.css('left', '50%');
    			context.$addMenuContainer.css('top', '50%');
    			context.$addMenuContainer.css('width', '1400px');
    			context.$addMenuContainer.css('height', '800px');
    			context.$addMenuContainer.css('margin-top', '-400px');
    			context.$addMenuContainer.css('margin-left', '-700px');
    			context.$addMenuContainer.css({
    				'border-radius': '10px 10px 10px 10px',
					'-moz-border-radius': '10px 10px 10px 10px',
					'-webkit-border-radius': '10px 10px 10px 10px',
					'border': '0px solid #000000'
    			});
    			
    			context.$addMenuContainer.find('.close_menu').click(function(event){
    				context.$addMenuContainer.hide();
    				context.$addMenuContainer.remove();
    				//메뉴 추가 프레임을 닫을 경우 상품 정보 재 로딩
    				context.loadMenuGroupInfo();
    				
    			});
    		});
    		
    		this.$productGroupListContainer = this.$orderWindow.find('.productGroupListContainer');
    		this.$productListContainer = this.$orderWindow.find('.productListContainer');
    		
			 this.loadMenuGroupInfo();
    		
    		this.$orderWindow.find('.choose').click(function(event){
    			if (context.selectedProductGroupCode == -1 || context.selectedProductCode == -1){
    				alert("옳바른 상품 정보를 선택해주세요");
    				return;
    			}else {
    				var selectedComponent = EggbonEditor.getSelectedComponent();
    				if (selectedComponent.type != 'order' ){
    					alert("wrong operation");
    					return;
    				}
    				selectedComponent.setProduct(
    					context.selectedProductCode, 
    					context.selectedProductName,
    					context.selectedProductPrice,
    					context.selectedProductStock 
    					);
    				context.close();
    			}
    			
    		});
    		
    		this.$orderWindow.find('.close').click(function(event){
    			context.close();
    		});
    		this.$orderWindow.find('.btn_close_order').click(function(event){
    			context.close();
    		});
    		return; 
    	},
    	
    	close: function () {
    		this.isProductSelected  = false;
    		this.selectedProductGroupCode  =  -1,
    		this.selectedProductCode  =  -1,
    		this.$orderWindow.hide();
    		this.$orderWindow.remove;
    	}
    };
    EggbonEditor.orderWindow.init();
});


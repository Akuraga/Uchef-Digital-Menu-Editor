EggbonEditor = EggbonEditor || {};

EggbonEditor.componentBorderLine =
     ' <div class="component_border component_border_common component_border_top"></div>' +
      '<div class="component_border component_border_common component_border_left"></div>' +
      '<div class="component_border component_border_common component_border_right"></div>' +
      '<div class="component_border component_border_common component_border_bottom"></div>';

EggbonEditor.resizingBorderStr =
     ' <div class="grip resizing_grip griptopleft actionTrigger topLeftActionTrigger"></div>' +
      '<div class="grip resizing_grip griptopcenter actionTrigger topMiddleActionTrigger"></div>' +
      '<div class="grip resizing_grip griptopright actionTrigger topRightActionTrigger"></div>' +
      '<div class="grip resizing_grip gripmiddleleft actionTrigger leftMiddleActionTrigger"></div>' +
      '<div class="grip resizing_grip gripmiddleright actionTrigger rightMiddleActionTrigger"></div>' +
      '<div class="grip resizing_grip gripbottomleft actionTrigger bottomLeftActionTrigger"></div>' +
      '<div class="grip resizing_grip gripbottomcenter actionTrigger bottomMiddleActionTrigger"></div>' +
      '<div class="grip resizing_grip gripbottomright actionTrigger bottomRightActionTrigger"></div>' +
      '<div class="grip resizing_grip gripbottonline actionTrigger bottomActionTrigger" style ="display:none"></div>';

EggbonEditor.grayPanelstr ='<div class="gray_panel" style ="z-index: 8000"></div>';
EggbonEditor.multiSelectStr ='<div class = "multi_select" style ="border:1px solid  #34A7C1; position:absolute"></div>';

EggbonEditor.previewWindowHTML =
    '<div class="preBg" style="display:none">'+
        '<div class="preWrap">'+
            '<div class="preContent">'+
                '<div class="preview_content" style= "position:relative;overflow : hidden"></div>'+
                '<div class="preClose"><img src="/ne/images/icon_closed.svg" /></div>'+
                '<div class="preTop"></div>'+
                '<div class="preBottom"></div>'+
                '<div class="prePage"></div>'+
                '<div class="btnex"><i class="fa fa-angle-right" aria-hidden="true"></i></div>'+
                '<div class="btpre"><i class="fa fa-angle-left" aria-hidden="true"></i></div>'+
            '</div>'+
        '</div>'+
    '</div>';
    
 EggbonEditor.orderWindowHTML =
'<div class="menuselect_bg" >'+
	'<div class="menuselect">'+
		'<div class="menuselect_title">'+
			'<p >Menu Select</p><span class="btn-close-page"><a class ="btn_close_order" href="javascript:void(0)">X</a></span>'+
		'</div>'+
		'<div class="menuselect_current">Current Menu :&nbsp;&nbsp;'+
			'<span class ="selected_cate_product"> Category &nbsp;/&nbsp; 선택메뉴</span>'+ 
			'<button type="button" class="menuselect_btn btn_add_product"> + Control Menu</button>'+
		'</div>'+
		'<div class="menuselect_left">'+
			'<h2>Category</h2>'+
			'<div class="menuselect_box">'+
				'<ul class ="productGroupListContainer">'+
				'</ul>'+
			'</div>'+
		'</div>'+
		'<div class="menuselect_right">'+
			'<h2>Menu<small>(Price)</small></h2>'+
			'<div class="menuselect_box">'+
				'<ul class ="productListContainer">'+
				'</ul>'+
			'</div>'+
		'</div>'+
		'<div class="menuselect_btns">'+
			'<button type="button" class="menuselect_btn choose"> Choose </button>'+
			'<button type="button" class="menuselect_btn close"> Cancel </button>'+
		'</div>'+
	'</div>'+
'</div>';

EggbonEditor.newProjectWindowHTML =
'<div class="nProject_bg">' +
'<div class="nProject">' +
	'<div class="npTop">' +
		'New Project ' +
		'<span id ="btn_close_new_project"><img src="http://www.uchef.co.kr/webeditor/menupan/img/btn_popclose.png" /><span>' +
	'</div>' +
	'<ul class="npContent">' +
		'<li>' +
			'<span>Project name</span>' +
			'<input type="text" id="pjname">' +
		'</li> ' +
		'<li>' +
			'<span>Resolution</span>' +
			'<select id="pjsize"> ' +
				'<option>Phone(720*1020)-추천</option>	' +
				'<option>Phone(1440*1840)</option>' +
				'<option>Tablet(480*800)</option>' +
				'<option>Tablet(1280*800)</option>' +
				'<option>Tablet(1280*600)</option>' +
				'<option>Other(768*1280)</option>' +
			'</select>' +
			'<input type="text" id="pjwidth" > x <input type="text" id="pjheight">' +
		'</li>' +
		'<li>' +
			'<span>Category</span>' +
			'<div class="catebox">' +
				'<h3><img src="http://www.uchef.co.kr/webeditor/menupan/img/object_layer_arrow_open_normal.png" /> Tablet</h3>' +
				'<ul>	' +
					'<li>Tablet</li>' +
					'<li>Tablet</li>' +
					'<li>Tablet</li>' +
					'<li>Tablet</li>' +
				'</ul>' +
				'<h3><img src="http://www.uchef.co.kr/webeditor/menupan/img/object_layer_arrow_open_normal.png" /> 목차</h3>' +
				'<ul>' +
					'<li>커피숍</li>' +
					'<li>주점</li>' +
					'<li>아시안</li>' +
					'<li>웨스턴</li>' +
				'</ul>' +
				'<h3><img src="http://www.uchef.co.kr/webeditor/menupan/img/object_layer_arrow_open_normal.png" /> 메뉴</h3>' +
				'<ul>' +
					'<li>커피숍</li>' +
					'<li>주점</li>' +
					'<li>아시안</li>' +
					'<li>웨스턴</li>' +
				'</ul>' +
				'<h3><img src="http://www.uchef.co.kr/webeditor/menupan/img/object_layer_arrow_open_normal.png" /> 주문</h3>' +
				'<ul>' +
					'<li>커피숍</li>' +
					'<li>주점</li>' +
					'<li>아시안</li>' +
					'<li>웨스턴</li>' +
				'</ul>' +
			'</div>' +
			'<label><input type="checkbox" value="">Template으로 저장</label>' +
		'</li>' +
	'</ul>' +
	'<div class="npBottom">' +
		'<button class="btn_np btn_npcreate">Create</button>' +
		'<button class="btn_np btn_npcancel">Cancel</button>' +
	'</div>' +
'</div>' +
'</div>';

EggbonEditor.newPageWindowHTML =
        '<div class="newpage_bg">' +
        '<div class="newpage">' +
            '<div class="newpage_title >' +
                '<p ">New Page</p>' +
                '<span class ="btn-close-page"><a href="javascript:void(0)">X</a></span>' +
            '</div>' +
            '<div class="newpage_left">' +
                '<h3 class ="empty_page">Empty Page</h3>' +
            '</div>' +
            '<div class="newpage_right">' +
                '<ul class="template">' +
                '</ul>' +
                '<ul class="page-set">' +
                '</ul>' +
            '</div>' +
            '<div class="newpage_btns">' +
                '<button type="button" class="newpage_btn newpage_btn_preview">Preview</button>' +
                '<button type="button" class="newpage_btn newpage_btn_insert">Insert</button>' +
                '<button type="button" class="newpage_btn newpage_btn_close">Cancel</button>' +
            '</div>' +
        '</div>' +
    '</div>';

EggbonEditor.selectionAfterSelectionStr =
    '<div class = "align_container">' +
         '<div class="fa fa-align-left align_action"      data-action ="left-most"       title ="align left" style =""float : left"></div>' +
         '<div class="fa fa-align-center align_action"  data-action ="top-most"       title ="align top" style =""float : left"></div>' +
         '<div class="fa fa-align-justify align_action"  data-action ="bottom-most"  title ="align bottom" style =""float : left"></div>' +
         '<div class="fa fa-align-right align_action"    data-action ="right-most"      title ="align right" style =""float : left"></div>' +
           '<div class="fa fa-close align_action"  data-action ="align-close"  title ="align right" style =""float : left"></div>' +
    '</div>';

EggbonEditor.contextHTML =
'<ul id="menu" class="context-menu-list">' +
        '<li class="context-menu-item buttonmenu">' +
            '<div>' +
                '<div class="btncontainer_title">' +
                    'Insert' +
                '</div>' +
            '<div class="btncontainer">' +
                '<button type="button" class="rbtn imgbtn image_btn action" data-action ="in_img">img</button> ' +
                '<button type="button" class="rbtn txtbtn text_btn action" data-action ="in_txt">txt</button> ' +
                '<button type="button" class="rbtn linkbtn link_btn action" data-action ="in_link">link</button> ' +
                '<button type="button" class="rbtn orderbtn order_btn action" data-action ="in_order" >order</button>' +
                '<button type="button" class="rbtn popupbtn popup_btn action" data-action ="in_popup">popup</button>' +
                '<button type="button" class="rbtn listbtn list_btn action" data-action ="in_list">list</button> ' +
                 '<button type="button" class="rbtn listrowbtn listrow_btn action" data-action ="in_listrow">row</button> ' +
             '</div></div>' +
         '</li>' +
         '<li style ="display:none;"  class="context-menu-item action" data-action ="clear_all" ><span class = "action_text">Clear all</span><span class ="shortcut"></span></li>' +
         '<li style ="cursor:pointer;" class="context-menu-item action" data-action ="toggle_grid_line"><span class = "action_text toggle_grid_text">Hide Grid</span><span class ="shortcut"></span></li>' +
         '<li style ="cursor:pointer;" class="context-menu-item action" data-action ="copy" ><span class = "action_text">Copy</span><span class ="shortcut">Ctrl+C</span></li>' +
         '<li style ="cursor:pointer;" class="context-menu-item action" data-action ="cut"><span class = "action_text">Cut</span><span class ="shortcut">Ctrl+X</span></li>' +
         '<li style ="cursor:pointer;" class="context-menu-item action" data-action ="paste"><span class = "action_text">Paste</span><span class ="shortcut">Ctrl+V</span></li>' +
         '<li style ="cursor:pointer;" class="context-menu-item action" data-action ="delete"><span class = "action_text">Delete</span><span class ="shortcut">Ctrl+D</span></li>' +
         '<li style ="cursor:pointer;display:none" disabled style ="display:none" class="context-menu-item action" data-action ="front"><span class = "action_text">Front</span><span class ="shortcut">Ctrl+F</span></li>' +
         '<li style ="cursor:pointer;display:none" disabled style ="display:none" class="context-menu-item action" data-action ="back"><span class = "action_text">Back</span><span class ="shortcut">Ctrl+B</span></li>' +
         '<li style ="cursor:pointer;" class="context-menu-item action" data-action ="new_page"><span class = "action_text">New Page</span><span class ="shortcut">Ctrl+N</span></li>' +
        '</ul>';
        
EggbonEditor.ajaxCenterLoadingHTML = '<img class ="ajax_center_loading" src="images/ajax_center_loading.svg">';
EggbonEditor.addMenuContainerHTML = 
'<div class ="add_menu_container">'+
	'<div style ="position:relative" class ="add_menu_title_container"><span class ="add_menu_title">Control Menu</span><span class ="close_menu">X</span></div>'+
	'<iframe id ="add_memu_iframe" src ="https://www.uchef.co.kr/web.action?mode=3300"  scrolling="no" style ="position:relative;border-width : 0px;width:100%;height:100%"></iframe>'+
'</div>';

EggbonEditor.clipArtHTML = 
 '<div class="newpage_bg">' +
'<div class="newpage">'+
	'<div class="newpage_title">'+
		'<p>Clipart</p>'+
		'<span class="btn-close-page"><a href="javascript:void(0)">X</a></span>'+
	'</div>'+
	'<div class="newpage_left" id = "clip_cate_tree"></div>'+
	'<div class="newpage_right iconbox">'+
		'<div class="icontype">'+
			'<a href="javascript: void(0)" class="select sort" data-sort ="name">Name</a> | <a href="javascript: void(0)" class ="sort" data-sort ="type">Type</a> | <a href="javascript: void(0)" data-sort ="size" class ="sort">Size</a> | <a href="javascript: void(0)" data-sort ="modified" class ="sort">Modified</a>'+ 
			'<span class="type">'+
				'<a href="javascript:void(0)" class="view_th" ><img src="images/th.png" /></a> <a class ="view_list" href="javascript:void(0)"><img src="images/list.png" /></a>'+
			'</span>'+
		'</div>'+
		'<ul class="iconlist_a" id ="icon_container">'+
		'</ul>'+
	'</div>'+
	'<div class="newpage_btns">'+
		'<button type="button" class="newpage_btn newpage_btn_preview" style="display: none;">Preview</button>'+
		'<button type="button" class="newpage_btn newpage_btn_close">Cancel</button>'+
	'</div>'+
'</div>'+
'</div>';








    

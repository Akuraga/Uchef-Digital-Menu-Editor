EggbonEditor = EggbonEditor || {};
$(function () {
    EggbonEditor.resource = {
    	projectImageRootPath : 'http://s3-ap-northeast-1.amazonaws.com/uchef',

    	defualtImageImgPath : location.protocol + '//' +location.host + "/ne/images/img_image.png",
    	defaultLinkImgPath 	  : location.protocol + '//' +location.host + "/ne/images/img_link.png",
    	defaultOrderImgPath  : location.protocol + '//' +location.host + "/ne/images/img_order.png",
    	
        init: function () {},
        
        getImageResourcePath : function(memberSeq, projectSeq, fileName, type){
        	if (fileName && fileName !='' && fileName !='undefined'){
	        	console.log("프로젝트 이미지 ImagePath : " + [this.projectImageRootPath, 'M'+memberSeq, 'P' + projectSeq, fileName].join('/'));
        		return [this.projectImageRootPath, 'M'+memberSeq, 'P' + projectSeq, fileName].join('/');
        	}else {
        		switch (type){
        			case 'image':return this.defualtImageImgPath;
        			case 'link':return this.defaultLinkImgPath;
        			case 'order':return this.defaultOrderImgPath;
        		}
        	}
        },
        
        getDefaultResourcePath : function(type){
        	switch (type){
        	case 'image':return this.defualtImageImgPath;
        	case 'link':return this.defaultLinkImgPath;
        	case 'order':return this.defaultOrderImgPath;
        	}
        },
    	
    	getImageResourcePathByBasePath: function(base_path, fileName, type){
    		if (fileName.indexOf("http") != -1) return fileName;
    		if (fileName == '' || fileName == 'undefined' || fileName == 'none') {
    			return this.getDefaultResourcePath(type);
    		}
    		
    		if (base_path && base_path!='' && base_path !='undefined' && base_path !='none' && fileName && fileName !='' && fileName !='undefined' && fileName !='none'){
        		if (base_path.charAt(base_path.length -1) == '/'){
	        		return base_path + fileName;
        		}else {
	        		return base_path +'/'+ fileName;
        		}
        	}else {
        		switch (type){
        			case 'image':return this.defualtImageImgPath;
        			case 'link':return this.defaultLinkImgPath;
        			case 'order':return this.defaultOrderImgPath;
        		}
        	}
    	},
    	
        getFontSize : function(str){
        	if (!str || str == '' || str =='undefined'){
        		return '35pt';
        	}else {
        		return str;
        	}
        },
        
        getFontFamily : function(str){
        	if (!str || str == '' || str =='undefined'){
        		return 'Open Sans';
        	}else {
        		return str;
        	}
        },
        
        getFontColor : function(str){
        	if (!str || str == '' || str =='undefined'){
        		return '#FF862D';
        	}else {
        		return str;
        	}
        },
        
        createYoutubeLInk : function(url){
        	var objectId = url.substring(url.lastIndexOf('/')+1);
        	var src = 'https://www.youtube.com/embed/'+ objectId;
        	console.log("유튜브 동영상 : " + src);
        	return src;
        }
    };
    
    EggbonEditor.resource.init();
});


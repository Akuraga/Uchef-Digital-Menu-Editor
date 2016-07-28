EggbonEditor = EggbonEditor || {};

$(function () {
    EggbonEditor.api = {
    
        rootUrl: '',
        apiUrl: '',
        apiInfo: {
            loadCode: { apiCode: 10011, requestMethod: 'get' },
            getSupportedResolutions: { apiCode: 10011, requestMethod: "get" },
            loadTemplates : { apiCode: 10012, requestMethod:  "get" },
            loadTemplate : { apiCode: 10006, requestMethod:  "get" },
            loadClipArts : {apiCode: 10015, requestMethod:  "get" },
            /* prj_name  이 있을 경우, 해당 프로젝트만(배열 0번째), 없을 경우 해당 회원원의 모든 프로젝트 로딩*/
            loadProjectList : { apiCode: 10001, requestMethod: "get" },  
            loadUserInfo: { apiCode: 10010, requestMethod: "get" },
            saveProject :  {apiCode: 10002, requestMethod: "post" },
            uploadImage: { apiCode: 10020, requestMethod: "post" }, 
            sustainSession: { apiCode: 10021, requestMethod: "get" },
            loadProductGroup: { apiCode: 10013, requestMethod: 'get' },  // 삼품 그룹 정보 목록
            loadProductByProductGroup: {apiCode: 10014, requestMethod: 'get' },  // 상품 그룹에 의한 세부 상품 목록 
			
			/*신규 api 에는 특정 템플릿을 가져오는 부분이 없고, 신규 loadProjectList는 자신의 것만 불러올 수 있기 때문에
			 * 일단 준비가 될 때까지 특정 템플릿을 가져오는 api 기존 api 이용한다.
			 * */ 
            oldApi_loadProjectList : {apiCode: 5511, requestMethod: 'get' }  // 상품 그룹에 의한 세부 상품 목록 
            
            //createProject: { apiCode: 5512, requestMethod: "get" },
            //deleteProject: { apiCode: 5510, requestMethod: "get" },
            //saveAsDefaultProject: { apiCode: 5510, requestMethod: "get" },
            //saveAs: { apiCode: 5503, requestMethod: "get" },
        },
        
        init : function(){
            this.rootUrl = "/";
            this.apiUrl = "editor.action?mode=";
        },

        makeApiUrl : function(apiName, data){
            var url = this.rootUrl + this.apiUrl + this.apiInfo[apiName].apiCode;
  			//구버젼으로 프로젝트 정보를 가져오기 위한 것으로 , 신규 api 가 준비되면 삭제
            if (apiName =='oldApi_loadProjectList'){
            	 url = 'jsonApi.action?mode=5511';
            }
            return url;
        },

        /*
            api 외부 호출 인터페이스
            params 
            apiName : 호출 api 이름 
            dataOption :  요청 데이타 
        */

        callRemoteApi: function (apiName, data, callback) {
            var requestUrl = this.makeApiUrl(apiName);
            //console.log('API Call  : ' + apiName+' - ' +requestUrl);
			if (apiName == 'sustainSession'){
				$('.ajax_top_loading').attr('title', apiName);
				$('.ajax_top_loading').css('visibility','visible');
			}else {
	            if ($('.ajax_center_loading').length < 1) {
					this.$centerLoadIngProgress = $(EggbonEditor.ajaxCenterLoadingHTML);
	        		$('body').prepend(this.$centerLoadIngProgress);
	            }
            }
            //this.$centerLoadIngProgress.show(); 			
            
            if (this.apiInfo[apiName].requestMethod == 'get') {
                this.sendGetJson(requestUrl, apiName, data, callback);
            } else {
                this.sendPostJson(requestUrl, apiName, data, callback);
            }
        },

        /*get request */
        sendGetJson: function (requestUrl, apiName, data, callback) {
			var context = this;

            $.getJSON(requestUrl, data, function (result) {
                if (callback && typeof callback == "function") {
                	$('.ajax_top_loading').css('visibility','hidden');
					context.$centerLoadIngProgress.hide();
                	context.$centerLoadIngProgress.remove();
					callback(result);
                } else {
                   	$('.ajax_top_loading').css('visibility','hidden');
                    context.$centerLoadIngProgress.hide();
                	context.$centerLoadIngProgress.remove();
                	
                    this.handleResponse(apiName , result);
                }
           
            });
        },

        /*post request */
        sendPostJson: function (requestUrl, apiName, data, callback) {
        	var context = this;
            $.ajax({
                type: "POST",
                url: requestUrl,
                data: data,
                success: function (result) {
                    if (callback && typeof callback == "function") {
                    	$('.ajax_top_loading').css('visibility','hidden');
                    	context.$centerLoadIngProgress.hide();
                		context.$centerLoadIngProgress.remove();
                        callback(result);
                    } else {
                       	$('.ajax_top_loading').css('visibility','hidden');
                    	context.$centerLoadIngProgress.hide();
                		context.$centerLoadIngProgress.remove();
                        this.handleResponse(apiName, result);
                    }
                },
                dataType: 'json'
            });
        },

        //콜백 개체가 없을 처리 호출되는 핸들러 함수 
        handleResponse : function(apiName, jsonResult){
            switch (apiName) {
                case 'getSupportedResolutions':break;
                case 'getProjectInfo':break;
                case 'getAllProjectList':break;
                case 'getMemberData':break;
                case 'saveAs':break;
                case 'saveAsDefaultProject':break;
                case 'createProject':break;
                case 'deleteProject':break;
                case 'uploadImage':break;
                case 'checkSession':break;
            }
        }
    };
    EggbonEditor.api.init();
});

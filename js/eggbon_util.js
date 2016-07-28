EggbonEditor = EggbonEditor || {};
EggbonEditor.util = {
    genUUID : function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    },


	getParameter : function (name) {
		var _tempUrl = window.location.search.substring(1);
		//url에서 처음부터 '?'까지 삭제
		var _tempArray = _tempUrl.split('&');
		// '&'을 기준으로 분리하기

		for (var i = 0; _tempArray.length; i++) {
			var _keyValuePair = _tempArray[i].split('=');
			// '=' 을 기준으로 분리하기

			if (_keyValuePair[0] == paramName) {// _keyValuePair[0] : 파라미터 명
				// _keyValuePair[1] : 파라미터 값
				return _keyValuePair[1];
			}
		}
	},
	

	getUrlParams : function() {
		var params = {};
		window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
			params[key] = value;
		});
		return params;
	}, 


    getScrollbarWidth: function () {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    },

    array: {
        movePageToFirst: function (pageArr,sPage) {
            var sIndex = -1;
            $.each(pageArr, function (index, page) {
                if (page.UUID == sPage.UUID) {
                    sIndex = index;
                }
            });
            var addArrElim = EggbonEditor.project.pages[sIndex];
            EggbonEditor.project.pages.splice(sIndex, 1).unshift(addArrElim);
        },

        movePageToLast: function (pageArr, sPage) {
            var sIndex = -1;
            $.each(pageArr, function (index, page) {
                if (page.UUID == sPage.UUID) {
                    sIndex = index;
                }
            });
            var addArrElim = EggbonEditor.project.pages[sIndex];
            EggbonEditor.project.pages.splice(sIndex, 1).push(addArrElim);
        },

        movePageToIndex : function (pages, index, sPage) {
            var sIndex = -1;
            $.each(pageArr, function (index, page) {
                if (page.UUID == sPage.UUID) {
                    sIndex = index;
                }
            });
            var addArrElim = EggbonEditor.project.pages[sIndex];
            EggbonEditor.project.pages.splice(sIndex, 1).push(addArrElim);
        },

        movePageBefore: function (pages, sPage, tPage) {
            var sIndex = -1;
            var tIndex = -1;
            $.each(pages, function (index, page) {
                if (page.UUID == tPage.UUID) {
                    tIndex = index;
                }
            });
            EggbonEditor.project.pages.splice(tIndex, 1);
            $.each(pages,function (index, page) {
                if (page.UUID == sPage.UUID) {
                    sIndex = index;
                }
            });
            EggbonEditor.project.pages.splice(sIndex - 1, 0, tPage);
        },

        movePageAfter: function (pages, target_page, moved_page) {
            var target_page_inx = -1;
            var moved_page_inx = -1;
            $.each(pages, function (index, page) {
                if (page.UUID == moved_page.UUID) {
                    moved_page_inx = index;
                }
            });
            EggbonEditor.project.pages.splice(moved_page_inx, 1);
           
            $.each(pages, function (index, page) {
                if (page.UUID == target_page.UUID) {
                    target_page_inx = index;
                }
            });
            EggbonEditor.project.pages.splice(target_page_inx, 0, moved_page);
        }
    }
};


(function () {
    if (!String.format) {
        String.format = function (format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                  ? args[number]
                  : match
                ;
            });
        };
    }

})();

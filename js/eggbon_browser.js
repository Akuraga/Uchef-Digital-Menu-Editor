EggbonEditor = EggbonEditor || {};
(function () {
    'use strict';

    if (!EggbonEditor.browser) {
        EggbonEditor.browser = {};
    }

    var NS = EggbonEditor.NS;

    var supportsSvg_ = (function () {
        return !!document.createElementNS && !!document.createElementNS(NS.SVG, 'svg').createSVGRect;
    }());

    EggbonEditor.browser.supportsSvg = function () { return supportsSvg_; };
    if (!EggbonEditor.browser.supportsSvg()) {
        window.location = 'browser-not-supported.html';  
        return;
    }

    var userAgent = navigator.userAgent;
    var svg = document.createElementNS(NS.SVG, 'svg');

    // Note: Browser sniffing should only be used if no other detection method is possible
    var isOpera_ = !!window.opera;
    var isWebkit_ = userAgent.indexOf('AppleWebKit') >= 0;
    var isGecko_ = userAgent.indexOf('Gecko/') >= 0;
    var isIE_ = userAgent.indexOf('MSIE') >= 0;
    var isChrome_ = userAgent.indexOf('Chrome/') >= 0;
    var isWindows_ = userAgent.indexOf('Windows') >= 0;
    var isMac_ = userAgent.indexOf('Macintosh') >= 0;
    var isTouch_ = 'ontouchstart' in window;

    var supportsSelectors_ = (function () {
        return !!svg.querySelector;
    }());

    var supportsXpath_ = (function () {
        return !!document.evaluate;
    }());

    // segList functions (for FF1.5 and 2.0)
    var supportsPathReplaceItem_ = (function () {
        var path = document.createElementNS(NS.SVG, 'path');
        path.setAttribute('d', 'M0,0 10,10');
        var seglist = path.pathSegList;
        var seg = path.createSVGPathSegLinetoAbs(5, 5);
        try {
            seglist.replaceItem(seg, 1);
            return true;
        } catch (err) { }
        return false;
    }());

    var supportsPathInsertItemBefore_ = (function () {
        var path = document.createElementNS(NS.SVG, 'path');
        path.setAttribute('d', 'M0,0 10,10');
        var seglist = path.pathSegList;
        var seg = path.createSVGPathSegLinetoAbs(5, 5);
        try {
            seglist.insertItemBefore(seg, 1);
            return true;
        } catch (err) { }
        return false;
    }());

    // text character positioning (for IE9)
    var supportsGoodTextCharPos_ = (function () {
        var svgroot = document.createElementNS(NS.SVG, 'svg');
        var svgcontent = document.createElementNS(NS.SVG, 'svg');
        document.documentElement.appendChild(svgroot);
        svgcontent.setAttribute('x', 5);
        svgroot.appendChild(svgcontent);
        var text = document.createElementNS(NS.SVG, 'text');
        text.textContent = 'a';
        svgcontent.appendChild(text);
        var pos = text.getStartPositionOfChar(0).x;
        document.documentElement.removeChild(svgroot);
        return (pos === 0);
    }());

    var supportsPathBBox_ = (function () {
        var svgcontent = document.createElementNS(NS.SVG, 'svg');
        document.documentElement.appendChild(svgcontent);
        var path = document.createElementNS(NS.SVG, 'path');
        path.setAttribute('d', 'M0,0 C0,0 10,10 10,0');
        svgcontent.appendChild(path);
        var bbox = path.getBBox();
        document.documentElement.removeChild(svgcontent);
        return (bbox.height > 4 && bbox.height < 5);
    }());

    // Support for correct bbox sizing on groups with horizontal/vertical lines
    var supportsHVLineContainerBBox_ = (function () {
        var svgcontent = document.createElementNS(NS.SVG, 'svg');
        document.documentElement.appendChild(svgcontent);
        var path = document.createElementNS(NS.SVG, 'path');
        path.setAttribute('d', 'M0,0 10,0');
        var path2 = document.createElementNS(NS.SVG, 'path');
        path2.setAttribute('d', 'M5,0 15,0');
        var g = document.createElementNS(NS.SVG, 'g');
        g.appendChild(path);
        g.appendChild(path2);
        svgcontent.appendChild(g);
        var bbox = g.getBBox();
        document.documentElement.removeChild(svgcontent);
        return (bbox.width == 15);
    }());

    var supportsEditableText_ = (function () {
        return isOpera_;
    }());

    var supportsGoodDecimals_ = (function () {
        var rect = document.createElementNS(NS.SVG, 'rect');
        rect.setAttribute('x', 0.1);
        var crect = rect.cloneNode(false);
        var retValue = (crect.getAttribute('x').indexOf(',') == -1);
        if (!retValue) {
            $.alert('NOTE: This version of Opera is known to contain bugs in SVG-edit.\n' +
            'Please upgrade to the <a href="http://opera.com">latest version</a> in which the problems have been fixed.');
        }
        return retValue;
    }());

    var supportsNonScalingStroke_ = (function () {
        var rect = document.createElementNS(NS.SVG, 'rect');
        rect.setAttribute('style', 'vector-effect:non-scaling-stroke');
        return rect.style.vectorEffect === 'non-scaling-stroke';
    }());

    var supportsNativeSVGTransformLists_ = (function () {
        var rect = document.createElementNS(NS.SVG, 'rect');
        var rxform = rect.transform.baseVal;
        var t1 = svg.createSVGTransform();
        rxform.appendItem(t1);
        return rxform.getItem(0) == t1;
    }());

    // Public API

    EggbonEditor.browser.isOpera = function () { return isOpera_; };
    EggbonEditor.browser.isWebkit = function () { return isWebkit_; };
    EggbonEditor.browser.isGecko = function () { return isGecko_; };
    EggbonEditor.browser.isIE = function () { return isIE_; };
    EggbonEditor.browser.isChrome = function () { return isChrome_; };
    EggbonEditor.browser.isWindows = function () { return isWindows_; };
    EggbonEditor.browser.isMac = function () { return isMac_; };
    EggbonEditor.browser.isTouch = function () { return isTouch_; };

    EggbonEditor.browser.supportsSelectors = function () { return supportsSelectors_; };
    EggbonEditor.browser.supportsXpath = function () { return supportsXpath_; };

    EggbonEditor.browser.supportsPathReplaceItem = function () { return supportsPathReplaceItem_; };
    EggbonEditor.browser.supportsPathInsertItemBefore = function () { return supportsPathInsertItemBefore_; };
    EggbonEditor.browser.supportsPathBBox = function () { return supportsPathBBox_; };
    EggbonEditor.browser.supportsHVLineContainerBBox = function () { return supportsHVLineContainerBBox_; };
    EggbonEditor.browser.supportsGoodTextCharPos = function () { return supportsGoodTextCharPos_; };
    EggbonEditor.browser.supportsEditableText = function () { return supportsEditableText_; };
    EggbonEditor.browser.supportsGoodDecimals = function () { return supportsGoodDecimals_; };
    EggbonEditor.browser.supportsNonScalingStroke = function () { return supportsNonScalingStroke_; };
    EggbonEditor.browser.supportsNativeTransformLists = function () { return supportsNativeSVGTransformLists_; };

}());

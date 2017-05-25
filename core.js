/*
* Last edited by:  $Author: erhoward $
*             on:  $Date: 2017/05/23 12:00:00 $
*       Filename:  $RCSfile: core.js,v $
*       Revision:  $Revision: 2.0 $
*/

// ************************************************************************************************
// begin core.js
// ************************************************************************************************

/*jshint scripturl:true */
/*global BLK, document, window, alert, location, navigator, ActiveXObject, XMLHttpRequest,
escape, setTimeout */

// ************************************************************************************************
// begin common functions
// ************************************************************************************************

if(typeof global !== "undefined")
{
    var global = window;
}

if(typeof CORE === "undefined")
{
    var CORE = {};
}

// ************************************************************************************************
// events/listeners
// ************************************************************************************************

CORE.listeners = [];

CORE.setupEventListenersCleaner = function()
{
    if(typeof window.attachEvent !== "undefined")
    {
        window.attachEvent("onunload", function()
        {
            var len = CORE.listeners.length;
            //alert("listeners len before: " + CORE.listeners.length);
            var i;
            for(i = len - 1; i >= 0; --i)
            {
                CORE.listeners[i][0].detachEvent(CORE.listeners[i][1], CORE.listeners[i][2]);
            }
            CORE.listeners = [];
        });
    }
}; // end CORE.cleanupEventListeners = function()

CORE.setupEventListenersCleaner();

CORE.addLoadListener = function(fn)
{
    if(typeof window.addEventListener !== "undefined")
    {
        window.addEventListener("load", fn, false);
    }
    else if(typeof document.addEventListener !== "undefined")
    {
        document.addEventListener("load", fn, false);
    }
    else if(typeof window.attachEvent !== "undefined")
    {
        window.attachEvent("onload", fn);
        CORE.listeners[CORE.listeners.length] = [window, "onload", fn];
    }
    else
    {
        var oldFn = window.onload;
        if(typeof window.onload !== "function")
        {
            window.onload = fn;
        }
        else
        {
            window.onload = function()
            {
                oldFn();
                fn();
            };
        }
    }
}; // end CORE.addLoadListener = function(fn)

CORE.attachEventListener = function(target, eventType, functionRef, capture)
{
    if(typeof target.addEventListener !== "undefined")
    {
        target.addEventListener(eventType, functionRef, capture);
    }
    else if(typeof target.attachEvent !== "undefined")
    {
        target.attachEvent("on" + eventType, functionRef);
        CORE.listeners[CORE.listeners.length] = [target, "on" + eventType, functionRef];
    }
    else
    {
        eventType = "on" + eventType;
        if(typeof target[eventType] === "function")
        {
            var oldListener = target[eventType];
            target[eventType] = function()
            {
                oldListener();
                return functionRef();
            };
        }
        else
        {
            target[eventType] = functionRef;
        }
    }
}; // end CORE.attachEventListener = function(target, eventType, functionRef, capture)

/*
CORE.detachEventListener(target, eventType, functionRef, capture)
{
if(typeof target.removeEventListener !== "undefined")
{
target.removeEventListener(eventType, functionRef, capture);
}
else if(typeof target.detachEvent !== "undefined")
{
target.detachEvent("on" + eventType, functionRef);
// ****************************************************************************************
// ****************************************************************************************
var found = false;
var foundAt = -1;
for(var i = 0; i < CORE.listeners.length; i++)
{
if(target === CORE.listeners[i][0])
{
found = true;
foundAt = i;
break;
} // end if (target === CORE.listeners[i][0])
} // end for(var i = 0; i < CORE.listeners.length; i++)
if(found)
{
var temp = [];
var j = 0;
for(j = 0; j < foundAt; j++)
{
temp[temp.length] = CORE.listeners[j];
}
for(j = foundAt + 1; j < CORE.listeners.length; j++)
{
temp[temp.length] = CORE.listeners[j];
}
CORE.listeners = temp;
temp = null;
} // end if(found)
// ****************************************************************************************
// ****************************************************************************************
}
else
{
target["on" + eventType] = null;
}
} // end CORE.detachEventListener(target, eventType, functionRef, capture)
*/


CORE.detachEventListener = function(target, eventType, functionRef, capture)
{
    if(typeof target.removeEventListener !== "undefined")
    {
        target.removeEventListener(eventType, functionRef, capture);
    }
    else if(typeof target.detachEvent !== "undefined")
    {
        target.detachEvent("on" + eventType, functionRef);
    }
    else
    {
        target["on" + eventType] = null;
    }
}; // end CORE.detachEventListener = function(target, eventType, functionRef, capture)


CORE.stopDefaultAction = function (event)
{
    event.returnValue = false;
    if(typeof event.preventDefault !== "undefined")
    {
        event.preventDefault();
    }
}; // end CORE.stopDefaultAction = function(event)

CORE.stopEvent = function(event)
{
    if(typeof event.stopPropagation !== "undefined")
    {
        event.stopPropagation();
    }
    else
    {
        event.cancelBubble = true;
    }
}; // end CORE.stopEvent = function(event)

CORE.getEventTarget = function(event)
{
    var targetElement = null;
    if(typeof event === "undefined")
    {
        event = window.event;
    }
    if(typeof event.target !== "undefined")
    {
        targetElement = event.target;
    }
    else
    {
        targetElement = event.srcElement;
    }
    while(targetElement.nodeType === 3 && targetElement.parentNode !== null)
    {
        targetElement = targetElement.parentNode;
    }
    return targetElement;
}; // end CORE.getEventTarget = function(event)

CORE.triggerEvent = function(target, eventName, canBubble, cancelEvent)
{
    var cancelled = true;
    var clickEvent = null;
    if(!target)
    {
        BLK.EBIZ.trace("triggerEvent - target is null. . .");
        return cancelled;
    }
    if(document.createEvent)
    {
        // ff
        //var ex = null;
        try
        {
            clickEvent = document.createEvent("MouseEvents");
            clickEvent.initEvent(eventName, canBubble, cancelEvent);
            cancelled = true;
            if(typeof target.dispatchEvent === "function")
            {
                cancelled = !target.dispatchEvent(clickEvent);
            }
        }
        catch(ex)
        {
            cancelled = true;
            window.alert(ex.name + "|" + ex.message);
        }
    }
    else
    {
        // ie
        eventName = "on" + eventName;
        cancelled = true;
        if(document.createEventObject)
        {
            var event = document.createEventObject();
            cancelled = !target.fireEvent(eventName, event);
        }
    } // end if(document.createEvent)
    return cancelled;
}; // end CORE.triggerEvent = function(target, eventName, canBubble, cancelEvent)
// ************************************************************************************************

// ************************************************************************************************
// styles/classes
// ************************************************************************************************
CORE.retrieveComputedStyle = function(element, styleProperty)
{
    var computedStyle = null;
    if(typeof element.currentStyle !== "undefined")
    {
        computedStyle = element.currentStyle;
    }
    else
    {
        computedStyle = document.defaultView.getComputedStyle(element, null);
    }
    return computedStyle[styleProperty];
}; // end CORE.retrieveComputedStyle = function(element, styleProperty)

CORE.getElementsByClassName = function(node, className)
{
    var a = [];
    if(!node)
    {
        return a;
    }

    /*
    if(node.getElementsByClassName)
    {
        return node.getElementsByClassName(className);
    }
    */

    //var re = new RegExp("(\\s|^)" + className + "(\\s|$)");
    var re = new RegExp("(^| )" + className + "( |$)");
    var els = node.getElementsByTagName("*");
    var el = null;
    var i = 0;
    for(i = 0; els[i]; i++)
    {
        el = els[i];
        if(re.test(el.className))
        {
            a.push(el);
        }
    }
    return a;
}; // end CORE.getElementsByClassName = function(node, className)

CORE.getElementsByClassNameOld = function(node, className)
{
    var a = [];
    //var re = new RegExp("(\\s|^)" + className + "(\\s|$)");
    var re = new RegExp("(^| )" + className + "( |$)");
    var els = node.getElementsByTagName("*");
    var el = null;
    var i = 0;
    for(i = 0; els[i]; i++)
    {
        el = els[i];
        if(re.test(el.className))
        {
            a.push(el);
        }
    }
    return a;
}; // end CORE.getElementsByClassNameOld = function(node, classname)

CORE.getElementsByMultiTagName = function (ref, tagNameArray)
{
    var tagArray = [];
    var tagList = null;
    var i = 0;
    var j = 0;
    for(i = 0; i < tagNameArray.length; i++)
    {
        tagList = ref.getElementsByTagName(tagNameArray[i]);
        for(j = 0; j < tagList.length; j++)
        {
            tagArray[tagArray.length] = tagList[j];
        }
    }
    return tagArray;
}; // end CORE.getElementsByMultiTagName = function (ref, tagNameArray)

CORE.getElementsByAttribute = function (attribute, attributeValue)
{
    var elementArray = [];
    var matchedArray = [];
    if(typeof document.all !== "undefined")
    {
        elementArray = document.all;
    }
    else
    {
        elementArray = document.getElementsByTagName("*");
    }
    var i = 0;
    for(i = 0; i < elementArray.length; i++)
    {
        if(attribute === "class")
        {
            var pattern = new RegExp("(^| )" + attributeValue + "( |$)");
            if(pattern.test(elementArray[i].className))
            {
                matchedArray[matchedArray.length] = elementArray[i];
            }
            pattern = null;
        }
        else if(attribute === "for")
        {
            if(elementArray[i].getAttribute("htmlFor" || elementArray[i].getAttribute("for")))
            {
                if(elementArray[i].htmlFor === attributeValue)
                {
                    matchedArray[matchedArray.length] = elementArray[i];
                }
            }
        }
        else if(elementArray[i].getAttribute(attribute) === attributeValue)
        {
            matchedArray[matchedArray.length] = elementArray[i];
        }
    }

    elementArray = null;

    return matchedArray;
}; // end CORE.getElementsByAttribute = function (attribute, attributeValue)

CORE.findClass = function (ele, cls)
{
    //return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    return ele.className.match(new RegExp("(^| )" + cls + "( |$)"));
}; // end CORE.findClass = function (ele, cls)

CORE.addClass = function (ele, cls)
{
    if(!CORE.findClass(ele, cls))
    {
        ele.className += " " + cls;
        return true;
    }
    return false;
}; // end CORE.addClass = function (ele, cls)

CORE.removeClass = function (ele, cls)
{
    if(CORE.findClass(ele, cls))
    {
        //var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        var reg = new RegExp("(^| )" + cls + "( |$)");
        ele.className = ele.className.replace(reg, ' ');
    }
    return true;
}; // end CORE.removeClass = function (ele, cls)

CORE.changeClass = function (target, fromClassValue, toClassValue)
{
    if(typeof fromClassValue === "string")
    {
        CORE.removeClass(target, fromClassValue);
        CORE.addClass(target, toClassValue);
        return;
    }
    var i = 0;
    for(i = fromClassValue.length - 1; i >= 0; --i)
    {
        CORE.removeClass(target, fromClassValue[i]);
    }
    CORE.addClass(target, toClassValue);
}; // end CORE.changeClass = function (target, fromClassValue, toClassValue)

CORE.changeClassSingle = function (target, fromClassValue, toClassValue)
{
    CORE.removeClass(target, fromClassValue);
    CORE.addClass(target, toClassValue);
}; // end CORE.changeClassSingle = function (target, fromClassValue, toClassValue)

CORE.changeClassMultiple = function (target, fromClassArray, toClassValue)
{
    var i = 0;
    for(i = fromClassArray.length - 1; i >= 0; --i)
    {
        CORE.removeClass(target, fromClassArray[i]);
    }
    CORE.addClass(target, toClassValue);
}; // end CORE.changeClassMultiple = function (target, fromClassArray, toClassValue)

CORE.findClassMulti = function (target, classValueArray)
{
    var className = target.className;
    var i = 0;
    var len;
    for(i = 0, len = classValueArray.length; i < len; i++)
    {
        var pattern = new RegExp("(^| )" + classValueArray[i] + "( |$)");
        if(pattern.test(className))
        {
            return true;
        }
    }
    return false;
}; // end CORE.findClassMulti = function (target, classValue)

// ************************************************************************************************

// ************************************************************************************************
// position/size
// ************************************************************************************************
CORE.getScrollingPosition = function()
{
    var scrollingPosition = [0, 0];

    if(typeof window.pageYOffset !== "undefined")
    {
        // ff
        //alert("ff");
        scrollingPosition = [window.pageXOffset, window.pageYOffset];
    }
    else if(typeof document.documentElement.scrollTop !== "undefined")
    {
        // ie
        //alert("ie documentelement");
        scrollingPosition = [document.documentElement.scrollLeft, document.documentElement.scrollTop];
    }
    else if(typeof document.body.scrollTop !== "undefined")
    {
        // ie
        //alert("ie body");
        scrollingPosition = [document.body.scrollLeft, document.body.scrollTop];
    }
    //alert("(" + scrollingPosition[0] + "," + scrollingPosition[0] + ")");
    return scrollingPosition;
}; // end CORE.getScrollingPosition = function()

CORE.getCursorPosition = function (event)
{
    if(typeof event === "undefined")
    {
        event = window.event;
    }

    var scrollingPosition = CORE.getScrollingPosition();
    var cursorPosition = [0, 0];
    if(typeof event.pageX !== "undefined" &&
        typeof event.x !== "undefined")
    {
        cursorPosition[0] = event.pageX;
        cursorPosition[1] = event.pageY;
    }
    else
    {
        cursorPosition[0] = event.clientX + scrollingPosition[0];
        cursorPosition[1] = event.clientY + scrollingPosition[1];
    }
    return cursorPosition;
}; // end CORE.getCursorPosition = function (event)

CORE.getViewportSize = function()
{
    var size = [0, 0];
    if(typeof window.innerWidth !== "undefined")
    {
        size = [window.innerWidth, window.innerHeight];
    }
    else if(typeof document.documentElement !== "undefined" &&
        typeof document.documentElement.clientWidth !== "undefined" &&
        document.documentElement.clientWidth !== 0)
    {
        size = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    }
    else
    {
        size = [document.getElementsByTagName("body")[0].clientWidth,
            document.getElementsByTagName("body")[0].clientHeight];
    }
    return size;
}; // end CORE.getViewportSize = function()

CORE.getPosition = function (theElement)
{
    var positionX = 0;
    var positionY = 0;
    while(theElement !== null)
    {
        positionX += theElement.offsetLeft;
        positionY += theElement.offsetTop;
        theElement = theElement.offsetParent;
    }
    return [positionX, positionY];
}; // end CORE.getPosition = function (theElement)

CORE.getPageDimensions = function()
{
    var body = document.getElementsByTagName("body")[0];
    var bodyOffsetWidth = 0;
    var bodyOffsetHeight = 0;
    var bodyScrollWidth = 0;
    var bodyScrollHeight = 0;
    var pageDimensions = [0, 0];

    if(typeof document.documentElement !== "undefined" &&
        typeof document.documentElement.scrollWidth !== "undefined")
    {
        pageDimensions[0] = document.documentElement.scrollWidth;
        pageDimensions[1] = document.documentElement.scrollHeight;
    }
    bodyOffsetWidth = body.offsetWidth;
    bodyOffsetHeight = body.offsetHeight;
    bodyScrollWidth = body.scrollWidth;
    bodyScrollHeight = body.scrollHeight;
    if(bodyOffsetWidth > pageDimensions[0])
    {
        pageDimensions[0] = bodyOffsetWidth;
    }
    if(bodyOffsetHeight > pageDimensions[1])
    {
        pageDimensions[1] = bodyOffsetHeight;
    }
    if(bodyScrollWidth > pageDimensions[0])
    {
        pageDimensions[0] = bodyScrollWidth;
    }
    if(bodyScrollHeight > pageDimensions[1])
    {
        pageDimensions[1] = bodyScrollHeight;
    }
    return pageDimensions;
}; // end CORE.getPageDimensions = function()
// ************************************************************************************************

// ************************************************************************************************
// miscellaneous
// ************************************************************************************************
/*
CORE.buildDynamicScriptTag = function (url, data, defer)
{
var headObj = document.getElementsByTagName("head")[0];
var scriptObj = document.createElement("script");
var id = new Date().getTime();
var requestId = "?requestId=" + id;
//scriptObj.src = url + requestId + data;
scriptObj.setAttribute("id", id);
scriptObj.setAttribute("type", "text/javascript");

if(defer)
{
scriptObj.setAttribute("defer", "defer");
}
//window.alert(scriptObj.src);

//window.alert("before. . .");
scriptObj.setAttribute("src", url + requestId + data);
headObj.appendChild(scriptObj);
//window.alert("after. . .");

return id;
} // end CORE.buildDynamicScriptTag = function (url, data, defer)
*/

/*
CORE.buildDynamicScriptTag = function (url, data, defer)
{
var headObj = document.getElementsByTagName("head")[0];
var scriptObj = document.createElement("script");
var id = new Date().getTime();
var requestId = "?requestId=" + id;
scriptObj.setAttribute("id", id);
scriptObj.setAttribute("type", "text/javascript");


CORE.callback()
{
window.alert("finished. . .");
}
if(scriptObj.readyState)
{
//IE
script.onreadystatechange = function()
{
if (scriptObj.readyState == "loaded" ||
scriptObj.readyState == "complete")
{
scriptObj.onreadystatechange = null;
callback();
}
};
}
else
{
//Others
scriptObj.onload = function ()
{
callback();
};
}

scriptObj.setAttribute("src", url + requestId + data);
headObj.appendChild(scriptObj);

return id;
} // end CORE.buildDynamicScriptTag = function (url, data, defer)
*/

// ************************************************************************************************
// begin get configuration/environment
// ************************************************************************************************
// old version with hard coding
/*
CORE.loadConfigFiles = function (fileNameArray)
{
var id = 0;
var idArray = [];
var hostName = location.hostname;
var src = "";
var found = false;
var prefix = "https://www2.blackrock.com/content/groups/globaltemplates/js/";
var scriptList = document.getElementsByTagName("script");
for(var k = 0; k < scriptList.length; k++)
{
src = scriptList[k].getAttribute("src");
if(src === null || src === "")
{
continue;
}
src = src.toLowerCase();
if(src.indexOf("common.js") !== -1)
{
found = true;
if(src.indexOf("www2.blackrock.com/content/groups/globaltemplates/js/") !== -1)
{
// prod
prefix = "https://www2.blackrock.com/content/groups/globaltemplates/js/";
}
else if(src.indexOf("consumptiontst.blackrock.com/content/groups/globaltemplates/js/") !== -1)
{
// test
prefix = "https://consumptiontst.blackrock.com/content/groups/globaltemplates/js/";
}
else if(src.indexOf("pcctvapp12.bfm.com") !== -1)
{
// dev
//prefix = "http://pcctvapp12:911/blackrock/GENERIC/js/";
prefix = "http://pcctvapp12:911/blackrock/roark/forprod/GENERIC/js/";
}
else
{
// prod
prefix = "https://www2.blackrock.com/content/groups/globaltemplates/js/";
}
break;
} // end if(src.indexOf("common.js") !== -1)
} // end for(var k = 0; k < scriptList.length; k++)

for(var i = 0; i < fileNameArray.length; i++)
{
id = buildDynamicScriptTag(prefix + fileNameArray[i], "", false);
idArray[i] = id;
} // end for(var i = 0; i < fileNameArray.length; i++)
return idArray;
} // end CORE.loadConfigFiles = function (fileNameArray)
*/

// new version without hard coding by Warren Jackter
/*
CORE.loadConfigFiles = function (fileNameArray)
{
var id = 0;
var idArray = [];
var hostName = location.hostname;
var src = "";

var scripts = document.getElementsByTagName("script");
var index = -1;
var prefix = "";
var src_split = [];
for (var x = 0; x < scripts.length; x++)
{
src = scripts[x].getAttribute("src");
if (src === null || src === "")
{
continue;
}
src = src.toLowerCase();
src_split = src.split("/");
if (src_split[src_split.length - 1] === "common.js")
{
index = src.indexOf("common.js");
prefix = src.substring(0, index);
break;
}
}

for(var i = 0; i < fileNameArray.length; i++)
{
id = buildDynamicScriptTag(prefix + fileNameArray[i], "", false);
idArray[i] = id;
} // end for(var i = 0; i < fileNameArray.length; i++)
return idArray;
} // end CORE.loadConfigFiles = function (fileNameArray)

//loadConfigFiles(["envSetting.js", "envConfig.js"]);
loadConfigFiles(["envConfig.js"]);
*/
// ************************************************************************************************
// end get configuration/environment
// ************************************************************************************************

CORE.collToArray = function (coll)
{
    // iterating through a HTML collection can be slower than
    // iterating through an array
    // copy HTML collection into array
    for(var i = 0, a = [], len = coll.length; i < len; i++)
    {
        a[i] = coll[i];
    }
    return a;
}; // end CORE.collToArray = function (coll)

CORE.yieldToUI = function (fxn, delay)
{
    setTimeout(function() { setTimeout(function() { fxn(); }, delay); }, delay);
}; // end CORE.yieldToUI = function (fxn, delay)

CORE.compareDates = function (dOne, dTwo)
{
    if(+dOne < +dTwo)
    {
        return -1;
    }
    else if(+dOne === +dTwo)
    {
        return 0;
    }
    else
    {
        return 1;
    }
}; // end CORE.compareDates = function (dOne, dTwo)

CORE.compareNumbers = function (nOne, nTwo)
{
    return nOne - nTwo;
}; // end CORE.compareNumbers = function (nOne, nTwo)

CORE.getInnerText = function (target)
{
    var innerText = "";
    var outerText = "";
    var value = "";
    var foundInnerText = false;
    var foundOuterText = false;
    var length = 0;
    var node = null;
    if(target.childNodes.length > 0)
    {
        length = target.childNodes.length;
        for(var i = 0; i < length; ++i)
        {
            node = target.childNodes[i];
            if(node.nodeType === 3)
            {
                if(node.nodeValue !== "")
                {
                    foundOuterText = true;
                    outerText += node.nodeValue;
                }
            } // end if(target.childNodes[i].nodeType === 3)
            else if(node.nodeType === 1)
            {
                if(node.childNodes.length > 0)
                {
                    if(node.firstChild.nodeType === 3)
                    {
                        foundInnerText = true;
                        innerText += node.firstChild.nodeValue;
                    }
                }
            } // end if(target[i].nodeType === 1)
        } // end for(var i = 0; i < target.childNodes.length; i++)
    } // end if(target.hasChildNodes())
    if(foundInnerText)
    {
        value = innerText;
    }
    else if(foundOuterText)
    {
        value = outerText;
    }
    else
    {
        value = "";
    } // end if(foundInnerText)
    return value;
}; // end CORE.getInnerText = function (target)

CORE.getInternalText = function (target)
{
    var elementChildren = target.childNodes;
    var internalText = "";
    var elementChildrenLength = elementChildren.length;
    for(var i = 0; i < elementChildrenLength; i++)
    {
        var elementChildrenItem = elementChildren[i];
        if(elementChildrenItem.nodeType === 3)
        {
            var pattern = /^\s*$/;
            //if(!/^\s*$/.test(elementChildrenItem.nodeValue))
            if(!pattern.test(elementChildrenItem.nodeValue))
            {
                internalText += elementChildrenItem.nodeValue;
            }
        }
        else
        {
            internalText += CORE.getInternalText(elementChildrenItem);
        }
    }
    return internalText;
}; // end CORE.getInternalText = function (target)

CORE.getInternalTextOld = function (target)
{
    var elementChildren = target.childNodes;
    var internalText = "";
    for(var i = 0; i < elementChildren.length; i++)
    {
        if(elementChildren[i].nodeType === 3)
        {
            var pattern = /^\s*$/;
            //if(!/^\s*$/.test(elementChildren[i].nodeValue))
            if(!pattern.test(elementChildren[i].nodeValue))
            {
                internalText += elementChildren[i].nodeValue;
            }
        }
        else
        {
            internalText += CORE.getInternalTextOld(elementChildren[i]);
        }
    }
    return internalText;
}; // end CORE.getInternalTextOld = function (target)

CORE.getNextSibling = function (beginNode)
{
    var endNode = beginNode.nextSibling;
    while(endNode && endNode.nodeType !== 1)
    {
        endNode = endNode.nextSibling;
    }
    return endNode;
}; // end CORE.getNextSibling = function (beginNode)

CORE.getPreviousSibling = function (beginNode)
{
    var endNode = beginNode.previousSibling;
    while(endNode && endNode.nodeType !== 1)
    {
        endNode = endNode.previousSibling;
    }
    return endNode;
}; // end CORE.getPreviousSibling = function (beginNode)

CORE.getParentNodeWithTagName = function (nodeIn, tagNameIn)
{
    var node = nodeIn;
    while(node !== null)
    {
        if(node.nodeName.toLowerCase() === tagNameIn.toLowerCase())
        {
            break;
        }
        node = node.parentNode;
    }
    return node;
}; // end CORE.getParentNodeWithTagName = function (nodeIn, tagNameIn)

CORE.identifyBrowser = function()
{
    var agent = navigator.userAgent.toLowerCase();

    if(typeof navigator.vendor !== "undefined" &&
        navigator.vendor === "KDE" &&
        typeof window.sidebar !== "undefined")
    {
        return "kde";
    }
    else if(typeof window.opera !== "undefined")
    {
        var version = parseFloat(agent.replace(/.*opera[\/ ]([^ $]+).*/, "$1"));
        if(version >= 7)
        {
            return "opera7";
        }
        else if(version >= 5)
        {
            return "opera5";
        }
        return "";
    }
    else if(typeof document.all !== "undefined")
    {
        if(typeof document.getElementById !== "undefined")
        {
            var browser = agent.replace(/.*ms(ie[\/ ][^ $]+).*/, "$1").replace(/ /, "");
            if(typeof document.uniqueID !== "undefined")
            {
                if(browser.indexOf("5.5") !== -1)
                {
                    return browser.replace(/(.*5\.5).*/, "$1");
                }
                else
                {
                    return browser.replace(/(.*)\..*/, "$1");
                }
            }
            else
            {
                return "ie5mac";
            }
        }
        return "";
    }
    else if(typeof document.getElementById !== "undefined")
    {
        if(navigator.vendor.indexOf("Apple Computer, Inc.") !== -1)
        {
            if(typeof window.XMLHttpRequest !== "undefined")
            {
                return "safari1.2";
            }
            return "safari1";
        }
        else if(agent.indexOf("gecko") !== -1)
        {
            return "mozilla";
        }
    }
    return "";
}; // end CORE.identifyBrowser = function()

CORE.identifyOS = function()
{
    var agent = navigator.userAgent.toLowerCase();
    if(agent.indexOf("win") !== -1)
    {
        return "win";
    }
    else if(agent.indexOf("mac") !== -1)
    {
        return "mac";
    }
    else
    {
        return "unix";
    }
    return "";
}; // end CORE.identifyOS = function()

CORE.randomBetween = function (min, max)
{
    return min + Math.floor(Math.random() * (max - min + 1));
}; // end CORE.randomBetween = function (min, max)

CORE.roundTo = function (number, places)
{
    var result = "";
    result = ((number * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places);
    return result;
}; // end CORE.roundTo = function (number, places)

CORE.readyForRegExp = function (textIn)
{
    var textOut = "";
    var charIn = "";
    var regExpChar = "\\^$*+?.[]-{}()|";

    for(var i = 0; i < textIn.length; ++i)
    {
        charIn = textIn.charAt(i);
        if(regExpChar.indexOf(charIn) !== -1)
        {
            textOut += "\\" + charIn;
        }
        else
        {
            textOut += charIn;
        }
    }
    return textOut;
}; // end CORE.readyForRegExp = function (textIn)

CORE.trim = function (stringIn)
{
    if(stringIn === "" || stringIn === null)
    {
        return "";
    }
    else
    {
        //return stringIn.replace(/^\s*/, "").replace(/\s*$/, "");
        return stringIn.replace(/^\s+/, "").replace(/\s\s*$/, "");
    }
}; // end CORE.trim = function (stringIn)

CORE.getValueFromURL = function (urlNameIn)
{
    var urlValue = "";
    var urlName = CORE.readyForRegExp(urlNameIn);
    var search = CORE.trim(location.search);
    if(search === "")
    {
        return "";
    }

    // [\?&]open=(\w+)&?
    var pattern = new RegExp("[\\?&]" + urlName + "=(\\w+)&?");

    urlValue = "";
    if(pattern.test(search))
    {
        urlValue = RegExp.$1;
    }
    return urlValue;
}; // end CORE.getValueFromURL = function (urlNameIn)

CORE.printErrorCode = function()
{
    var val = CORE.getCleanCookie('SITECORE_ERROR_CODE');
    var siteCoreErrorCodeRef = null;
    if(val !== "")
    {
        siteCoreErrorCodeRef = document.getElementById('siteCoreErrorCode');
        if(siteCoreErrorCodeRef)
        {
            siteCoreErrorCodeRef.innerHTML = "Error Code: " + val;
        }
    }
}; // end CORE.printErrorCode = function()

// ************************************************************************************************

// ************************************************************************************************
// cookies
// ************************************************************************************************
/*
>  Once the specified date is reached, the cookie expires and is deleted.
>  If expires is not specified, the cookie will be deleted when the browser is closed.
>  If expires is set to a date in the past, the cookie is deleted immediately.
This is how to delete a cookie (some browsers may take a few seconds to actually delete the cookie).
>  In theory, computers should be able to accept any future date but in reality,
UNIX computers will not currently accept a date after 03:14 on 18 Jan 2038 and many Macintosh
computers will not currently accept a date after 06:28 6 Feb 2040 or the same date as that for UNIX.
These are the UNIX and Macintosh equivalent of the millennium bug.
*/
CORE.setCookie = function (cookieName, value, expireDays, secure)
{
    var expDate = new Date();

    var expiresResult = "";
    if(expireDays === 0)
    {
        // session cookie
        expiresResult = "";
    }
    else
    {
        expDate.setDate(expDate.getDate() + expireDays);
        expiresResult = "; expires=" + expDate.toGMTString();
    }

    var secureResult = "";
    if(secure === undefined)
    {
        secureResult = "";
    }
    else if(secure === true)
    {
        secureResult = "; secure";
    }
    else
    {
        secureResult = "";
    }

    //document.cookie = CORE.trim(cookieName) + "=" + escape(value) + expiresResult + secureResult;
    document.cookie = CORE.trim(cookieName) + "=" + encodeURIComponent(value) + expiresResult + "; path=/"+ secureResult;

    expDate = null;
}; // end CORE.setCookie = function (cookieName, value, expireDays, secure)

BLK.EBIZ.setCookie = function(cookieName, value, expireDays, secure)
{
    var expDate = new Date();

    var expiresResult = "";
    if(expireDays === 0)
    {
        // session cookie
        expiresResult = "";
    }
    else
    {
        expDate.setDate(expDate.getDate() + expireDays);
        expiresResult = "; expires=" + expDate.toGMTString();
    }

    var secureResult = "";
    if(secure === undefined)
    {
        secureResult = "";
    }
    else if(secure === true)
    {
        secureResult = "; secure";
    }
    else
    {
        secureResult = "";
    }

    document.cookie = CORE.trim(cookieName) + "=" + encodeURIComponent(value) + expiresResult + "; path=/"+ secureResult;

    expDate = null;
}; // end BLK.EBIZ.setCookie = function(cookieName, value, expireDays, secure)

CORE.setCookieOld = function (cookieName, value, expireDays, secure)
{
    var expDate = new Date();
    expDate.setDate(expDate.getDate() + expireDays);
    if(secure === undefined)
    {
        document.cookie = CORE.trim(cookieName) + "=" +
        escape(value) + ((expireDays === null) ? "" : ";expires=" + expDate.toGMTString());
    }
    else if(secure === true)
    {
        document.cookie = CORE.trim(cookieName) + "=" +
        escape(value) + ((expireDays === null) ? "" : ";expires=" + expDate.toGMTString() + ";secure");
    }
    else
    {
        document.cookie = CORE.trim(cookieName) + "=" +
        escape(value) + ((expireDays === null) ? "" : ";expires=" + expDate.toGMTString());
    }

    expDate = null;
}; // end CORE.setCookieOld = function (cookieName, value, expireDays, secure)

CORE.setCookieWithPath = function (cookieName, value, expireDays, secure, path)
{
    var expDate = new Date();
    var expiresResult = "";
    if(expireDays === 0)
    {
        // session cookie
        expiresResult = "";
    }
    else
    {
        expDate.setDate(expDate.getDate() + expireDays);
        expiresResult = "; expires=" + expDate.toGMTString();
    }

    var secureResult = "";
    if(secure === undefined)
    {
        secureResult = "";
    }
    else if(secure === true)
    {
        secureResult = "; secure";
    }
    else
    {
        secureResult = "";
    }

    var pathResult = "";
    pathResult = ";path=" + path;

    //document.cookie = CORE.trim(cookieName) + "=" + escape(value) + expiresResult + secureResult + pathResult;
    document.cookie = CORE.trim(cookieName) + "=" + encodeURIComponent(value) + expiresResult + secureResult + pathResult;

    expDate = null;
}; // end CORE.setCookieWithPath = function (cookieName, value, expireDays, secure, path)

BLK.EBIZ.setCookieWithPath = function(cookieName, value, expireDays, secure, path)
{
    var expDate = new Date();
    var expiresResult = "";
    if(expireDays === 0)
    {
        // session cookie
        expiresResult = "";
    }
    else
    {
        expDate.setDate(expDate.getDate() + expireDays);
        expiresResult = "; expires=" + expDate.toGMTString();
    }

    var secureResult = "";
    if(secure === undefined)
    {
        secureResult = "";
    }
    else if(secure === true)
    {
        secureResult = "; secure";
    }
    else
    {
        secureResult = "";
    }

    var pathResult = "";
    pathResult = "; path=" + path;
    document.cookie = CORE.trim(cookieName) + "=" + encodeURIComponent(value) + expiresResult + secureResult + pathResult;

    expDate = null;
}; // end BLK.EBIZ.setCookieWithPath = function(cookieName, value, expireDays, secure, path)

CORE.getCookie = function (searchName)
{
    var cookies = document.cookie.split(";");
    var found = false;
    var cookieCrumbs = [];
    var cookieName = "";
    var cookieValue = "";

    for(var i = 0; i < cookies.length && !found; i++)
    {
        cookieCrumbs = cookies[i].split("=");
        if(cookieCrumbs.length < 2)
        {
            continue;
        }
        cookieName = cookieCrumbs[0];
        cookieName = CORE.trim(cookieName);

        //cookieValue = CORE.trim(cookieCrumbs[1]);
        cookieValue = decodeURIComponent(CORE.trim(cookieCrumbs[1]));

        if(cookieName === searchName)
        {
            found = true;
        }
    }
    if(!found)
    {
        cookieValue = "";
    }

    return cookieValue;
}; // end CORE.getCookie = function (searchName)

BLK.EBIZ.getCookie = function (searchName)
{
    var cookies = document.cookie.split(";");
    var found = false;
    var cookieCrumbs = [];
    var cookieName = "";
    var cookieValue = "";

    for(var i = 0; i < cookies.length && !found; i++)
    {
        cookieCrumbs = cookies[i].split("=");
        if(cookieCrumbs.length < 2)
        {
            continue;
        }
        cookieName = cookieCrumbs[0];
        cookieName = CORE.trim(cookieName);

        cookieValue = decodeURIComponent(CORE.trim(cookieCrumbs[1]));

        if(cookieName === searchName)
        {
            found = true;
        }
    }
    if(!found)
    {
        cookieValue = "";
    }

    return cookieValue;
}; // end BLK.EBIZ.getCookie = function (searchName)

CORE.getSubCookie = function (cookieName, subCookieName)
{
    var cookies = document.cookie.split(";");
    for(var i = 0; i < cookies.length; i++)
    {
        var cookieCrumbs = cookies[i].split("=");

        //cookieCrumbs[0] = cookieCrumbs[0].replace(/^\s+/, "");
        cookieCrumbs[0] = cookieCrumbs[0].replace(/^\s\s*/, "");

        if(cookieCrumbs[0] === cookieName)
        {
            var cookieValue = cookieCrumbs[1];

            //cookieValue = unescape(cookieValue);
            cookieValue = decodeURIComponent(CORE.trim(cookieCrumbs[1]));

            var subCookies = cookieValue.split("/");
            for(var j = 0; j < subCookies.length; j++)
            {
                var subCookieCrumbs = subCookies[j].split(":");
                if(subCookieCrumbs[0] === subCookieName)
                {
                    return subCookieCrumbs[1];
                }
            }
        }
    }
    return "";
}; // end CORE.getSubCookie = function (cookieName, subCookieName)

BLK.EBIZ.getSubCookie = function(cookieName, subCookieName)
{
    var cookies = document.cookie.split(";");
    for(var i = 0; i < cookies.length; i++)
    {
        var cookieCrumbs = cookies[i].split("=");

        //cookieCrumbs[0] = cookieCrumbs[0].replace(/^\s+/, "");
        cookieCrumbs[0] = cookieCrumbs[0].replace(/^\s\s*/, "");

        if(cookieCrumbs[0] === cookieName)
        {
            var cookieValue = cookieCrumbs[1];

            cookieValue = decodeURIComponent(cookieValue);

            var subCookies = cookieValue.split("/");
            for(var j = 0; j < subCookies.length; j++)
            {
                var subCookieCrumbs = subCookies[j].split(":");
                if(subCookieCrumbs[0] === subCookieName)
                {
                    return subCookieCrumbs[1];
                }
            }
        }
    }
    return "";
}; // end BLK.EBIZ.getSubCookie = function(cookieName, subCookieName)

CORE.getCleanCookie = function (cookieName)
{
    var x = CORE.getCookie(cookieName);
    var returnCookie = (typeof (x) === "undefined") ? "" : x;
    //alert ( cookieName+ " : " + returnCookie);
    return returnCookie;
    //return getCookie(cookieName);
}; // end CORE.getCleanCookie = function (cookieName)

CORE.getIPFromCookie = function (searchNameIn)
{
    var DEFAULT_SEARCH_NAME = "blk_clip";
    var searchName = DEFAULT_SEARCH_NAME;
    if(typeof searchNameIn !== "undefined")
    {
        searchName = searchNameIn;
    }
    //var searchName = "blk_clip";
    var cookies = document.cookie.split("; ");
    var found = false;
    var cookieCrumbs = [];

    var cookieName = "";
    var cookieValue = "";

    function trim(stringIn)
    {
        if(stringIn === "" || stringIn === null)
        {
            return "";
        }
        else
        {
            return stringIn.replace(/^\s+/, "").replace(/\s\s*$/, "");
        }
    } // end function trim(stringIn)

    for(var i = 0; i < cookies.length; i++)
    {
        cookieCrumbs = cookies[i].split("=");
        cookieName = cookieCrumbs[0];
        cookieName = trim(cookieName);

        cookieValue = decodeURIComponent(cookieCrumbs[1]);

        if(decodeURIComponent(cookieName) === searchName)
        {
            found = true;
            break;
        }
    }

    if(!found)
    {
        cookieValue = "";
    }
    return cookieValue;
}; // end CORE.getIPFromCookie = function (searchNameIn)

// ************************************************************************************************
// validation
// ************************************************************************************************
CORE.validContentId = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    //re = /^\d{5}$/i;
    re = /^(\d{5}|\d{10})$/i;

    blnValid = re.test(strText);

    //alert(strText + " is " + (blnValid ? "valid" : "invalid"));
    return blnValid;
}; // end CORE.validContentId = function (strText)

CORE.validInteger = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    re = /^\d+$/i;
    blnValid = re.test(strText);
    //alert(strText + " is " + (blnValid ? "valid" : "invalid"));
    return blnValid;
}; // end CORE.validInteger = function (strText)

CORE.validFloat = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    re = /^\d+\.\d+$/i;
    blnValid = re.test(strText);
    //alert(strText + " is " + (blnValid ? "valid" : "invalid"));
    return blnValid;
}; // end CORE.validFloat = function (strText)

CORE.validEmailAddress = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    // erhoward@prodigy.net
    re = /^[^@]+@([a-z0-9\-]+\.)+[a-z]{2,4}$/i;
    blnValid = re.test(strText);
    return blnValid;
}; // end CORE.validEmailAddress = function (strText)

CORE.validPhoneNumber = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    // 609-882-2489 or (609) 882-2489
    re = /^((\d{3}-\d{3}-\d{4})|(\(\d{3}\)\s\d{3}-\d{4}))$/i;

    blnValid = re.test(strText);
    return blnValid;
}; // end CORE.validPhoneNumber = function (strText)

CORE.validSocialSecurityNumber = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    re = /^\d{3}-\d{2}-\d{4}$/i;
    blnValid = re.test(strText);
    //alert(strText + " is " + (blnValid ? "valid" : "invalid"));
    return blnValid;
}; // end CORE.validSocialSecurityNumber = function (strText)

CORE.validZipCode = function (strText)
{
    var blnValid;
    var re;

    if(strText === "" || strText === null)
    {
        return true;
    }
    re = /^\d{5}-\d{4}$/i;
    blnValid = re.test(strText);
    //alert(strText + " is " + (blnValid ? "valid" : "invalid"));
    return blnValid;
}; // end CORE.validZipCode = function (strText)

CORE.validDate = function (strText)
{
    var blnValid;
    var nDate;

    if(strText === "" || strText === null)
    {
        return true;
    }
    nDate = Date.parse(strText);
    blnValid = true;
    if(isNaN(nDate))
    {
        blnValid = false;
    }

    //alert(strText + " is " + (blnValid ? "valid" : "invalid"));
    return blnValid;
}; // end CORE.validDate = function (strText)
// ************************************************************************************************

// ************************************************************************************************
// memory reclamation
// ************************************************************************************************
CORE.purge = function (d)
{
    var a = d.attributes, i, l, n;
    if(a)
    {
        l = a.length;
        for(i = 0; i < l; i += 1)
        {
            n = a[i].name;
            if(typeof d[n] === "function")
            {
                d[n] = null;
            }
        }
    }
    a = d.childNodes;
    if(a)
    {
        l = a.length;
        for(i = 0; i < l; i += 1)
        {
            CORE.purge(d.childNodes[i]);
        }
    }
}; // end CORE.purge = function (d)
// ************************************************************************************************

// ************************************************************************************************
// xml
// ************************************************************************************************
var g_xmlDoc = null;
CORE.loadXmlFile = function (fileName, fxn, async)
{
    var fileLoaded = false;
    try
    {
        if(window.ActiveXObject)
        {
            // code for IE
            g_xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            g_xmlDoc.async = false;
            g_xmlDoc.load(fileName);
            fxn();
            fileLoaded = true;
        }
        else if(document.implementation &&
            document.implementation.createDocument)
        {
            // code for Mozilla, Firefox, Opera, etc.
            g_xmlDoc = document.implementation.createDocument("", "", null);

            //g_xmlDoc.async = false;
            if(typeof async === "undefined")
            {
                g_xmlDoc.async = false;
            }
            else if(typeof async === "boolean")
            {
                if(async)
                {
                    g_xmlDoc.async = true;
                }
                else
                {
                    g_xmlDoc.async = false;
                }
            } // end if(typeof async === "undefined")

            //g_xmlDoc.onload = fxn;
            //g_xmlDoc.load(fileName);

            if(g_xmlDoc.async)
            {
                g_xmlDoc.onload = fxn;
                g_xmlDoc.load(fileName);
            }
            else
            {
                g_xmlDoc.load(fileName);
                fxn();
            }
            fileLoaded = true;
        }
        else
        {
            BLK.EBIZ.trace("File load not supported.");
            g_xmlDoc = null;
            fileLoaded = false;
        }
    }
    catch(e)
    {
        if(typeof e.message === "undefined")
        {
            BLK.EBIZ.trace("Could not create XML document.");
        }
        else
        {
            BLK.EBIZ.trace(e.message);
        }
        fileLoaded = false;
    }
    return fileLoaded;
}; // end CORE.loadXmlFile = function (fileName, fxn)
// ************************************************************************************************

// ************************************************************************************************
// iframes
// ************************************************************************************************
CORE.locationReplaceIE5 = function (url)
{
    this.iframeRef.setAttribute("src", url);
    return true;
}; // end CORE.locationReplaceIE5 = function (url)

CORE.createIframeRPC = function (iframeRpcId)
{
    var body = document.getElementsByTagName("body")[0];
    var iframe = document.createElement("iframe");
    iframe.setAttribute("id", iframeRpcId);
    body.appendChild(iframe);
    if(typeof iframe.document !== "undefined" &&
        typeof iframe.contentDocument === "undefined" &&
        typeof iframe.contentWindow === "undefined")
    {
        body.removeChild(iframe);
        var iframeHTML = '<iframe id="iframeRPC"></iframe>';
        body.innerHTML += iframeHTML;

        iframe = document.getElementById(iframeRpcId);
        iframe.contentWindow = {};
        iframe.contentWindow.document = {};
        iframe.contentWindow.document.location = {};
        iframe.contentWindow.document.location.iframeRef = iframe;
        iframe.contentWindow.document.location.replace = CORE.locationReplaceIE5;
    }
    iframe.style.position = "absolute";
    iframe.style.left = "-1500em";
    iframe.style.top = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.setAttribute("tabIndex", "-1");

    body = null;
    iframe = null;

    return true;
}; // end functtion createIframeRPC = function()

CORE.executeIframeRPC = function (iframeRpcId, url)
{
    var iframe = document.getElementById(iframeRpcId);
    var iframeDocument = null;
    if(typeof iframe.contentDocument !== "undefined")
    {
        iframeDocument = iframe.contentDocument;
    }
    else if(typeof iframe.contentWindow !== "undefined")
    {
        iframeDocument = iframe.contentWindow.document;
    }
    else
    {
        iframe = null;
        return false;
    }
    iframeDocument.location.replace(url);
    iframe = null;

    return true;
}; // end CORE.executeIframeRPC = function (url)

CORE.createIframeLayer = function (menu, zIndex)
{
    var layer = document.createElement("iframe");
    layer.tabIndex = "-1";
    layer.src = "javascript:false;";
    layer.className = "iframeOverSelectElements";
    menu.parentNode.appendChild(layer);

    layer.style.position = "absolute";
    if(typeof zIndex !== "undefined")
    {
        layer.style.zIndex = zIndex;
    }
    layer.style.border = "none";

    layer.style.left = menu.offsetLeft + "px";
    layer.style.top = menu.offsetTop + "px";
    layer.style.width = menu.offsetWidth + "px";
    layer.style.height = menu.offsetHeight + "px";
}; // end CORE.createIframeLayer = function (menu)

CORE.removeIframeLayer = function (menu)
{
    var layers = menu.parentNode.getElementsByTagName("iframe");
    while(layers.length > 0)
    {
        layers[0].parentNode.removeChild(layers[0]);
    }
}; // end CORE.removeIframeLayer = function (menu)
// ************************************************************************************************

// ************************************************************************************************
// xml http request
// ************************************************************************************************
var g_xmlHttpReqObj = null;
var g_ajaxCallbackFn = null;

CORE.ajaxResponse = function()
{
    if(g_xmlHttpReqObj.readyState === 4)
    {
        if(g_xmlHttpReqObj.status === 200 || g_xmlHttpReqObj.status === 304)
        {
            if(typeof g_ajaxCallbackFn === "function")
            {
                g_ajaxCallbackFn();
            }
            else
            {
                alert("Callback function not defined.");
            }
        }
        else if(g_xmlHttpReqObj.status === 401)
        {
            alert("Access unauthorized.");
        }
        else if(g_xmlHttpReqObj.status === 403)
        {
            alert("Access forbidden.");
        }
        else if(g_xmlHttpReqObj.status === 404)
        {
            alert("Requested URL not found.");
        }
        else
        {
            alert("Request failed: " + g_xmlHttpReqObj.statusText);
            //alert("Request failed.");
        }
    }
}; // end CORE.ajaxResponse = function()

CORE.getXmlHttpReqObj = function()
{
    var xmlHttpReqObj = null;
    try
    {
        // ff, op
        xmlHttpReqObj = new XMLHttpRequest();
    }
    catch(e1)
    {
        // ie
        try
        {
            xmlHttpReqObj = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch(e2)
        {
            try
            {
                xmlHttpReqObj = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(e3)
            {
                xmlHttpReqObj = null;
            }
        }
    }
    return xmlHttpReqObj;
}; // end CORE.getXmlHttpReqObj = function()

CORE.ajaxRequest = function (fileName, data, method)
{
    // filename must be name of file on server
    // data must be in form &name1=value1&name2=value2&name3=value3
    // method must be get or post
    g_xmlHttpReqObj = CORE.getXmlHttpReqObj();

    if(g_xmlHttpReqObj === null)
    {
        alert("Cannot complete request.");
        return false;
    }
    g_xmlHttpReqObj.onreadystatechange = CORE.ajaxResponse;

    var requestId = "requestId=" + new Date().getTime();

    if(method.toLowerCase() === "get")
    {
        var url;
        if(data === "")
        {
            url = fileName + "?" + requestId;
        }
        else
        {
            url = fileName + "?" + requestId + data;
        }
        //alert(url);
        try
        {
            g_xmlHttpReqObj.open("GET", url, true);
            g_xmlHttpReqObj.send(null);
        }
        catch(ex1)
        {
            if(typeof ex1.message === "undefined")
            {
                window.alert(ex1);
            }
            else
            {
                window.alert(ex1.message);
            }
        }
    }
    else
    {
        // method post
        if(data === "")
        {
            data = requestId;
        }
        else
        {
            data = requestId + data;
        }
        //alert(data);
        try
        {
            g_xmlHttpReqObj.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            g_xmlHttpReqObj.open("POST", fileName, true);
            g_xmlHttpReqObj.send(data);
        }
        catch(ex2)
        {
            if(typeof ex2.message === "undefined")
            {
                window.alert(ex2);
            }
            else
            {
                window.alert(ex2.message);
            }
        }
    }
    return true;
}; // end CORE.ajaxRequest = function (fileName, data, method)
// ************************************************************************************************

// ************************************************************************************************
// end common functions
// ************************************************************************************************

// ************************************************************************************************
// end core.js
// ************************************************************************************************


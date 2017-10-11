/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

/**
 * This is a collection of extentions to built-in types. This in in leu of creating subclasses which we should do
 * in the future.
 */
define(
["dijit/DialogUnderlay",
"dijit/layout/TabContainer",
"dijit/layout/TabController",
"dijit/form/Button",
"dojo/dnd/Manager","dojo/_base/lang", "dijit/layout/TabController", "dojo/dnd/common", "dojo/dom-style", "dojo/dom-geometry", "dojo/has", "dojo/sniff",
"dojo/_base/window"],
    function(DialogUnderlay, TabContainer, TabController, Button, Manager,lang, _TabButton, dnd, style, geometry, has, sniff, baseWin){


lang.extend(TabContainer, {baseClass : "pentahoTabContainer"});

lang.extend(DialogUnderlay,
    {
      templateString: "<div class='glasspane'><div class='' data-dojo-attach-point='node'></div></div>",

      _setClassAttr: function(clazz){
        this.node.className = clazz;
        this._set("class", clazz);
      }
    });

lang.extend(_TabButton, {baseClass : "pentaho-tabWidget"});

// killing the autoscroll of the page when dragging nodes
dnd.autoScroll = function(e){};

// Custom version which allows overflowdivs to be ignored if marked with preventAutoScroll="true"
dnd.autoScrollNodes = function(e){
  // summary:
  //    a handler for onmousemove event, which scrolls the first avaialble
  //    Dom element, it falls back to dojo.dnd.autoScroll()
  // e: Event
  //    onmousemove event

  // FIXME: needs more docs!
  for(var n = e.target; n;){
    if((!n.getAttribute || !n.getAttribute('preventAutoScroll') || n.getAttribute('preventAutoScroll') == "false") && n.nodeType == 1 && (n.tagName.toLowerCase() in dnd._validNodes)){
      var s = style.getComputedStyle(n);
      if(s.overflow.toLowerCase() in dnd._validOverflow){
        var b = geometry.getContentBox(n, s), t = geometry.position(n, true);
        //console.log(b.l, b.t, t.x, t.y, n.scrollLeft, n.scrollTop);
        var w = Math.min(dnd.H_TRIGGER_AUTOSCROLL, b.w / 2),
            h = Math.min(dnd.V_TRIGGER_AUTOSCROLL, b.h / 2),
            rx = e.pageX - t.x, ry = e.pageY - t.y, dx = 0, dy = 0;
        if(has("webkit")){
          // FIXME: this code should not be here, it should be taken into account
          // either by the event fixing code, or the geometry.position()
          // FIXME: this code doesn't work on Opera 9.5 Beta
          rx += baseWin.body.scrollLeft;
          ry += dojo.body().scrollTop;
        }
        if(rx > 0 && rx < b.w){
          if(rx < w){
            dx = -w;
          }else if(rx > b.w - w){
            dx = w;
          }
        }
        //console.log("ry =", ry, "b.h =", b.h, "h =", h);
        if(ry > 0 && ry < b.h){
          if(ry < h){
            dy = -h;
          }else if(ry > b.h - h){
            dy = h;
          }
        }
        var oldLeft = n.scrollLeft, oldTop = n.scrollTop;
        n.scrollLeft = n.scrollLeft + dx;
        n.scrollTop  = n.scrollTop  + dy;
        if(oldLeft != n.scrollLeft || oldTop != n.scrollTop){ return; }
      }
    }
    try{
      n = n.parentNode;
    }catch(x){
      n = null;
    }
  }
  dnd.autoScroll(e);
};

});

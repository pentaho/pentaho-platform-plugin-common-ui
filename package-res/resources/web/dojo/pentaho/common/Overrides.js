/**
 * This is a collection of extentions to built-in types. This in in leu of creating subclasses which we should do
 * in the future.
 */
dojo.provide("pentaho.common.Overrides");
dojo.require("dijit.DialogUnderlay");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.TabController");
dojo.require("dijit.form.Button");
dojo.require("dojo.dnd.Manager");
dojo.extend(dijit.layout.TabContainer, {baseClass : "pentahoTabContainer"});

dojo.extend(dijit.DialogUnderlay,
    {
      templateString: "<div class='glasspane'><div class='' dojoAttachPoint='node'></div></div>",

      _setClassAttr: function(clazz){
        this.node.className = clazz;
        this._set("class", clazz);
      }
    });

dojo.extend(dijit.layout._TabButton, {baseClass : "pentaho-tabWidget"});

// killing the autoscroll of the page when dragging nodes
dojo.dnd.autoScroll = function(e){};

// Custom version which allows overflowdivs to be ignored if marked with preventAutoScroll="true"
dojo.dnd.autoScrollNodes = function(e){
  // summary:
  //    a handler for onmousemove event, which scrolls the first avaialble
  //    Dom element, it falls back to dojo.dnd.autoScroll()
  // e: Event
  //    onmousemove event

  // FIXME: needs more docs!
  for(var n = e.target; n;){
    if((!n.getAttribute || !n.getAttribute('preventAutoScroll') || n.getAttribute('preventAutoScroll') == "false") && n.nodeType == 1 && (n.tagName.toLowerCase() in dojo.dnd._validNodes)){
      var s = dojo.getComputedStyle(n);
      if(s.overflow.toLowerCase() in dojo.dnd._validOverflow){
        var b = dojo._getContentBox(n, s), t = dojo.position(n, true);
        //console.log(b.l, b.t, t.x, t.y, n.scrollLeft, n.scrollTop);
        var w = Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL, b.w / 2),
            h = Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL, b.h / 2),
            rx = e.pageX - t.x, ry = e.pageY - t.y, dx = 0, dy = 0;
        if(dojo.isWebKit || dojo.isOpera){
          // FIXME: this code should not be here, it should be taken into account
          // either by the event fixing code, or the dojo.position()
          // FIXME: this code doesn't work on Opera 9.5 Beta
          rx += dojo.body().scrollLeft;
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
  dojo.dnd.autoScroll(e);
};

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
define([
  "dojo/_base/declare",
  "dojo/data/ItemFileReadStore",
  "dijit/registry",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/layout/ContentPane",
  "dijit/layout/BorderContainer",
  "dijit/form/HorizontalSlider",
  "dijit/form/TextBox",
  "dijit/form/ComboBox",
  "dijit/form/Select",
  "dijit/form/CheckBox",
  "dijit/TitlePane",
  "dojo/on",
  "dojo/query",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/html",
  "dojo/dom-construct",
  "dojo/string",
  "dojo/dom-class",
  "dojo/dnd/Target",
  "dojo/dnd/Source",
  "dojo/dnd/Manager",
  "dojo/Evented",
  "dojo/topic",
  "dojo/dom",
  "dojo/dom-geometry",
  "dojo/aspect",
  "pentaho/common/Messages",
  "pentaho/common/propertiesPanel/Configuration"
], function(declare, ItemFileReadStore,
            registry, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ContentPane,
            BorderContainer, HorizontalSlider, TextBox, ComboBox,
            Select, CheckBox, TitlePane,
            on, query, array, lang, html, construct, string, domClass,
            Target, Source, ManagerClass, Evented, topic, dom, geometry, aspect,
            Messages, Configuration) {

  /* eslint-disable dot-notation, new-cap */

  var nextId = 0;
  function newId(prefix) {
    return prefix + (++nextId);
  }

  var Panel = declare("pentaho.common.propertiesPanel.Panel", [ContentPane, Evented], {

    captionTemplate: "<div class='caption'><span class='caption-text'>${ui.caption:i18n}</span><i class='captionIcon'></i></div>",
    seperatorTemplate: "<div class='propPanel-seperator'></div>",
    propUIs: null,
    groups:  null,
    previousGroupsOpenState: null,
    gutters: false,
    baseClass: "pentahoPropertiesPanel",
    minHeightDeviation: 0,
    _gemUIByGemId: null,

    constructor: function(propertiesConfiguration) {
      this.configuration = propertiesConfiguration;
      this._gemUIByGemId = {};
    },

    postCreate: function() {
      array.forEach(this.configuration.items, lang.hitch(this, "initializeItem"));

      //var placeholderPanel = new dijit.layout.ContentPane({region: "center", splitter: false});
      //this.domNode.appendChild(placeholderPanel.domNode);
      this.inherited(arguments);
    },

    resize: function() {
      this.minHeightDeviation = 0; // zero out adjustments
      this.inherited(arguments);
    },

    initializeItem: function(item) {
      if(item.ui.hidden) { return; }

      // Lookup class impl from map
      var LayoutItemClass = Panel.registeredTypes[item.ui.type];
      if(!LayoutItemClass) {
        throw "No Properties Panel UI implementation found for " + item.ui.type;
      }

      var propUI;
      // check to see if it's a factory class
      if(LayoutItemClass.create) {
        propUI = LayoutItemClass.create({model: item, propPanel: this});
      } else {
        propUI = new LayoutItemClass({model: item, propPanel: this});
      }

      var targetNode = this.domNode;

      // If the property is grouped, create the group or add it to the existing one.
      var groupId = item.ui.group;
      if(groupId) {
        var group = this._getOrCreateGroup(groupId);
        if(group) { targetNode = group.content; }
      }

      // Items can request a separator to be inserted before themselves
      if(item.ui.seperator) {
        targetNode.appendChild(construct.toDom(this.seperatorTemplate));
      }

      // Items can have a caption.
      // If specified, create and add it before the property UI component
      if(item.ui.caption) {
        var cap = construct.toDom(string.substitute(this.captionTemplate, item, null,
            {
              i18n: function(value, key) {
                var s = Messages.getString(value, value);

                // Since BACKLOG-8367 (Pentaho 7.1), the usage of colons has been moved to
                // stylesheets and are thus theme-dependent.
                // The following block ensures the captions do not contain a terminal colon :,
                // as there could have been custom visualizations defining custom properties with
                // captions containing a terminal colon, which could lead to the weird-looking stituation
                // that a caption terminates with consecutive two colons.
                if(s.length && s[s.length - 1] === ":"){
                  return s.slice(0, -1);
                }

                return s;
              }
            }));

        // support the new Themeable way
        var img = query("i", cap);
        if(img && img != null && img.length > 0) {
          img = img[img.length - 1]; //select the last i tag found
          if(item.ui.captionIcon) {
            domClass.add(img, item.ui.captionIcon);
          } else {
            img.style.display = "none";
          }
        }

        targetNode.appendChild(cap);
      }

      // Route UI events to onPropertyChange
      this.setupEventHandling(propUI);

      if(propUI instanceof GemUI) this.registerGemUI(propUI);

      this.propUIs.push(propUI);
      this.own(on(propUI, "UIEvent", lang.hitch(this, "onUIEvent")));
      domClass.add(propUI.domNode, "propPanelItem")

      targetNode.appendChild(propUI.domNode);

      this.resize();
    },

    _getOrCreateGroup: function(groupId) {
      var group = this.groups[groupId];
      if(!group) {
        var groupConfig = this.configuration.groups[groupId];
        if(groupConfig)
          group = this._createGroup(groupId, groupConfig);
      }
      return group;
    },

    _createGroup: function(groupId, groupConfig) {
      var group = new TitlePane({
            title:    Messages.getString(groupConfig.title, groupConfig.title),
            content:  document.createElement("div"),
            region:   'top',
            splitter: false
          });

      if (this.previousGroupsOpenState !== null && typeof this.previousGroupsOpenState[groupId] !== 'undefined') {
        if (group.open && this.previousGroupsOpenState[groupId].open === false) {
          //just setting the group.open variable doesn't ensure that the label arrow is coherent with the open state
          group.toggle();
        }
      }

      aspect.after(group, "resize", lang.hitch(this, function() {
        this._resizeGroup(group);
      }));

      aspect.after(group._wipeOut, "onEnd", lang.hitch(this, "resize"));
      aspect.after(group._wipeIn,  "onEnd", lang.hitch(this, "resize"));

      this.domNode.appendChild(group.domNode);

      return (this.groups[groupId] = group);
    },

    _resizeGroup: function(group) {
      var lastChild = geometry.position(this.domNode.children[this.domNode.children.length - 1]);
      var totalNumOfGroups = 0;
      var totalGroupHeight = 0;
      var totalNonGroupHeight = 0;

      var minHeightAdjustment = 0;
      for(var g in this.groups) {
        totalNumOfGroups++;
        var gp = this.groups[g];
        var titleBarHeight = geometry.position(gp.titleBarNode).h
        totalGroupHeight += (gp.open) ? titleBarHeight + gp.hideNode.scrollHeight : 0;
        if(gp.open) {
          minHeightAdjustment += (gp.usingMinHeight) ? gp.heightAdjustment : 0;
        } else {
          minHeightAdjustment += titleBarHeight;
        }
      }

      array.forEach(this.domNode.children, function(node) {
        if(!node.className.match(/dijitTitlePane/)) {
          totalNonGroupHeight += geometry.position(node).h;
        }
      });

      var panelHeight = geometry.position(this.domNode).h;
      // if(totalGroupHeight + totalNonGroupHeight < panelHeight - /*margins*/ 20){
      //   // plenty of space, make natural size
      //   var gHeight = geometry.position(group.titleBarNode).h + group.hideNode.scrollHeight;
      //   group.domNode.style.height = gHeight + "px";
      //   group.hideNode.style.height = (gHeight - geometry.position(group.titleBarNode).h)+ "px";
      // } else {
      // divide up available room based on relative sizes of panels
      var remainderToDivide = geometry.position(this.domNode).h - totalNonGroupHeight - minHeightAdjustment;

      var titleCoords = geometry.position(group.titleBarNode);
      var titleBarHeight = titleCoords.h;
      var titleBarWidth = titleCoords.w;
      if(group.open) {
        var naturalHeight = titleBarHeight + group.hideNode.scrollHeight;

        var calculatedHeight = (naturalHeight / totalGroupHeight) * remainderToDivide;
        if(calculatedHeight > naturalHeight) {
          // No need to scroll
          group.hideNode.style.overflow = "hidden";
          //previously scrolling divs don't always relayout when scrolling is disabled. set width to fix
          group.wipeNode.style.width = titleBarWidth + "px";
        } else {
          group.hideNode.style.overflow = "auto";
          group.wipeNode.style.width = "";
        }

        // ensure minimum height
        var minHeightFactor = 2.2;
        if(calculatedHeight < titleBarHeight * minHeightFactor) {
          group.usingMinHeight = true;
          group.heightAdjustment = titleBarHeight * minHeightFactor - calculatedHeight;
          calculatedHeight = titleBarHeight * minHeightFactor;
        } else {
          group.usingMinHeight = false;
        }

        if(!isNaN(calculatedHeight)) {
          group.domNode.style.height = calculatedHeight + "px";
        }

        if(geometry.position(group.domNode).h > 0) {
          group.hideNode.style.height = Math.min((geometry.position(group.domNode).h - titleBarHeight), group.hideNode.scrollHeight) + "px";
        }
      } else {
        if(!isNaN(titleBarHeight)) {
          group.domNode.style.height = titleBarHeight + "px";
        }
        group.usingMinHeight = false;
      }
      group.domNode.style.width = "";

      // }

      // setTimeout(function(){
      //   group._splitterWidget.domNode.style.top = Math.min(parseInt(group._splitterWidget.domNode.style.top), (parseInt(group.domNode.style.top) + parseInt(group.domNode.style.height))) + "px";
      // });
    },

    onUIEvent: function(type, args) {
      on.emit(this, type, args);
    },

    registerGemUI: function(gemUI) {
      this._gemUIByGemId[gemUI.model.id] = gemUI;
    },

    unregisterGemUI: function(gemUI) {
      delete this._gemUIByGemId[gemUI.model.id];
    },

    getGemUIById: function(id) {
      if(id) {
        var m = /^gem_(.*?)(:?_\d+)?$/.exec(id);
        if(m) id = m[1];
        return this._gemUIByGemId[id];
      }
    },

    setupEventHandling: function(ui) {
      this.own(on(ui, "contextMenu", function(e) {
        this.onUIEvent("onContextMenu", {item: ui, args: [ui, e]});
      }));
      this.own(on(ui, "click", function(e) {
        this.onUIEvent("onClick", {item: ui, args: [ui, e]});
      }));
      this.own(on(ui, "dblclick", function(e) {
        this.onUIEvent("onDblClick", {item: ui, args: [ui, e]});
      }));
    },

    setConfiguration: function(configJson) {
      this._setConfiguration(new Configuration(configJson));
    },

    _setConfiguration: function(config) {
      if(this.propUIs && this.propUIs.length) this._destroyChildrenDeferred();

      if (this.groups) {
        this.previousGroupsOpenState = {};
        for (var groupName in this.groups) {
          if (this.groups.hasOwnProperty(groupName)) {
            this.previousGroupsOpenState[groupName] = {};
            this.previousGroupsOpenState[groupName].open = this.groups[groupName].open || false;
          }
        }
      }

      this.propUIs = [];
      this.groups  = {};
      this._gemUIByGemId = {};

      // does not work in IE 11 - It will destroy all its corresponding child elements
      // https://social.msdn.microsoft.com/Forums/ie/en-US/0c4231cd-18d0-4557-a5dd-67678812222d/ie11-dom-elements-saved-in-arrays-have-no-innerhtml-when-recalled?forum=iewebdevelopment#b726de77-4dd2-4c23-a048-6db0e24f1a15
      // this.domNode.innerHTML = "";

      while(this.domNode.firstChild !== null) {
        this.domNode.removeChild(this.domNode.firstChild);
      }

      this.configuration = config;
      this.postCreate();
    },

    _destroyChildrenDeferred: function() {
      var oldChildren = this.getChildren();

      function destroyOldChildren() {
        array.forEach(oldChildren, function(w) { w.destroyRecursive(); });
      }

      window.setTimeout(destroyOldChildren, 0);
    },

    reload: function() {
      this._setConfiguration(this.configuration);
    },

    set: function(property, id, value) {
      array.forEach(this.propUIs, function(prop) {
        if(prop.model.id == id) {
          prop.model.set(property, value);
        }
      });
    }
  });

  Panel.registeredTypes = {};

  var StatefulUI = declare([], {
    constructor: function(options) {
      this.model     = options.model;
      this.propPanel = options.propPanel;

      this._watchHandle = this.model.watch(lang.hitch(this, function(propName, prevVal, newVal) {
        switch(propName) {
          case "value":
          case "default":
            if(!this._destroyed) this.set(propName, newVal);
            break;
        }
      }));
    },

    onUIEvent: function(type, args) {
    },

    destroy: function() {
      this.inherited(arguments);

      this.model =
      this.propPanel = null;

      // Otherwise the old widgets get replaced by the new ones when reloading,
      // before being destroyed.
      if(this._watchHandle) {
        this._watchHandle.remove();
        this._watchHandle = null;
      }
    }
  });

  var GemBarUISource = declare([Source], {

    constructor: function(node) {
      this.dropIndicator = document.createElement("div");
      this.dropIndicator.className = "indicator";
      this.dropIndicator.id = "propertyPanelIndicator";
      this.dropIndicator.style.display = "none";

      var line = document.createElement("div");
      line.className = "indicatorLine";

      this.dropIndicator.appendChild(line);

      this.node.parentNode.appendChild(this.dropIndicator);
    },

    destroy: function() {
      this.inherited(arguments);

      if(this.__autoHideDropIndicatorCallback !== null) {
        this.__autoHideDropIndicatorCallback();
      }

      this.gemBar =
      this.dropIndicator =
      this.gemUIbeingInserted = null;
    },

    onDropAtEnd: function(source, nodes, copy) {

      var dropInfo = this.__getEndDropInfo();

      return this.onDrop(source, nodes, copy, dropInfo);
    },

    // @override
    onDrop: function(source, nodes, copy, dropInfoOverride) {
      this.dropZone2Zone = false; // Flag moves from one gembar to another.

      if(!nodes || nodes.length === 0) {
        return false;
      }

      var droppedNode = nodes[0];

      // Passed in by the placeholder source, when to insert at the end of the list.
      // When dropAtEnd, source === this and !this.current,
      // which happens when a gem from this gembar is dropped in the associated placeholderSource,
      // the base method will consider this a noop
      // (how would it be possible to be dropping here a gem from here and yet there was no current?).
      if(dropInfoOverride != null) {
        this.current = dropInfoOverride.anchor;
        this.before = dropInfoOverride.before;
      }

      if(!this.checkAcceptanceAtDropInfo(this, nodes, /* silent: */ true)) {
        return false;
      }

      var gemUI = this.gemBar.propPanel.getGemUIById(droppedNode.id);
      var gem;
      if(gemUI) {
        gem = gemUI.model;
        if(gemUI.gemBar === this.gemBar) { // Reorder, notify model so it can fire an event
          // fire reordered in insertNodes where we know more information
        } else {
          this.dropZone2Zone = true;
          gemUI.gemBar.remove(gemUI, /* suppressEvent: */true);

          // For moves we cache the previous bar in order to add it to the move event
          gemUI.model.previousGemBar = gemUI.gemBar.model;
          gemUI.gemBar = this.gemBar;
        }
      } else {
        gem   = this.createGemFromNode(droppedNode);
        gemUI = this.createGemUI(gem, droppedNode);

        nodes[0] = gemUI.domNode;
      }

      this.gemUIbeingInserted = gemUI;

      var newId = nodes[0].id;
      nodes[0].id = droppedNode.id; // Need to ensure the original id is used when calling superclass.

      // Indirectly calls `insertNodes`.
      this.inherited(arguments);

      nodes[0].id = newId;

      this.sync();
      source.sync();

      var postDrop = source.postDrop || gem.postDrop;

      this._executePostDrop(droppedNode.getAttribute("formula"), postDrop);

      return true;
    },

    // NOTE: used from Analyzer automation API.
    _onDrop: function(formula, dndType, value, gemBar, before, anchor, dndNode, postDrop) {
      var oldGemBar  = this.gemBar;
      var oldDndNode = this.node;

      this.gemBar = gemBar;
      this.node = dndNode;

      var gem = this.createGemByFormula(formula, value);
      this.gemUIbeingInserted = this.createGembarUIFromGembar(gem, gemBar, dndType);

      this.insertNodes(null, null, before, anchor, true);

      this.gemBar = oldGemBar;
      this.node = oldDndNode;

      this._executePostDrop(formula, postDrop);
    },

    _executePostDrop: function(formula, postDrop) {
      if(postDrop) {
        postDrop.f.call(postDrop.scope, formula, this.gemBar.id);
      }
    },

    // region createGem*
    createGemFromNode: function(sourceNode) {
      return this.gemBar.model.createGemFromNode(sourceNode);
    },

    createGemByFormula: function(formula, value) {
      return this.gemBar.model.createGemByFormula(formula, value);
    },

    createGembarUIFromGembar: function(gem, dndType) {
      var UiClass = Panel.registeredTypes["gem"];
      var options = {model: gem, gemBar: this.gemBar, dndType: dndType};
      return UiClass.create ? UiClass.create(options) : new UiClass(options);
    },

    createGemUI: function(gem, sourceNode) {
      return this.gemBar.createGemUI(gem, sourceNode);
    },
    // endregion

    // region drop indicator
    // @override
    onDraggingOver: function() {

      this.inherited(arguments);

      // console.log("onDraggingOver");

      // J.I.C.
      this.__previousDropInfo = undefined;

      this.updateDropIndicatorAtDropInfo();
    },

    // There's no onDragging* equivalent for Move, so have to override the lower level event.
    // @override
    onMouseMove: function() {

      // Calling base first so that this.{isDragging, current, before, targetState} are up-to-date.
      this.inherited(arguments);

      if(this.__isDraggingAndEnabled()) {

        // console.log("onMouseMove");

        this.updateDropIndicatorAtDropInfo();
      }
    },

    // @override
    onDraggingOut: function() {

      this.inherited(arguments);

      // console.log("onDraggingOut");

      if(this.__autoHideDropIndicatorCallback) {
        this.__autoHideDropIndicatorCallback();
      } else {
        this._hideDropIndicator();
      }
    },

    updateDropIndicatorAtEnd: function() {

      var dropInfo = this.__getEndDropInfo();

      this.updateDropIndicatorAtDropInfo(dropInfo);
    },

    updateDropIndicatorAtDropInfo: function(dropInfo) {

      var previousDropInfo = this.__previousDropInfo;

      if(dropInfo === undefined) {
        dropInfo = this.__getCurrentDropInfo();
      }

      if(dropInfo !== null && !this.__shouldShowDropIndicator(dropInfo)) {
        dropInfo = null;
      }

      if(previousDropInfo === undefined || !this.__areEqualDropInfos(dropInfo, previousDropInfo)) {

        this.__previousDropInfo = dropInfo;

        // Check acceptance at dropInfo position.
        var canDrop = dropInfo !== null &&
          this.checkAcceptanceAtDropInfo(this, ManagerClass.manager().nodes, undefined, dropInfo);

        if(canDrop) {
          this.__placeIndicator(dropInfo.anchor, dropInfo.before);
          this.__hideDropIndicatorOnDndEnd();

        } else if(this.__autoHideDropIndicatorCallback) {
          this.__autoHideDropIndicatorCallback();
        } else {
          this._hideDropIndicator();
        }
      }
    },

    __previousDropInfo: undefined,
    __autoHideDropIndicatorCallback: null,

    __hideDropIndicatorOnDndEnd: function() {

      if(this.__autoHideDropIndicatorCallback === null) {

        var cancelHandle;
        var dropHandle;
        var callback = lang.hitch(this, function() {

          this.__previousDropInfo = undefined;
          this.__autoHideDropIndicatorCallback = null;
          this._hideDropIndicator();
          cancelHandle.remove();
          dropHandle.remove();
        });

        cancelHandle = topic.subscribe("/dnd/cancel", callback);
        dropHandle = topic.subscribe("/dnd/drop", callback);

        this.__autoHideDropIndicatorCallback = callback;
      }
    },

    __shouldShowDropIndicator: function(dropInfo) {

      var overChild = dropInfo.anchor;
      if(overChild == null) {
        return false;
      }

      var children = this.node.children;
      var isBeforeOverChild = dropInfo.before;
      var overChildIndex = this.__getChildIndex(overChild);
      var dragNode = ManagerClass.manager().nodes[0];

      // Is the mouse over the node being dragged?
      if(overChild === dragNode) {
        return false;
      }

      // Is AFTER and dragNode is the one after overChild?
      if(!isBeforeOverChild && overChildIndex + 1 < children.length && children[overChildIndex + 1] === dragNode) {
        return false;
      }

      // Is BEFORE and dragNode is the one before overChild?
      if(isBeforeOverChild && overChildIndex > 0 && children[overChildIndex - 1] === dragNode) {
        return false;
      }

      return true;
    },

    // NOTE: used from Analyzer automation API.
    _showDropIndicator: function() {

      var dropInfo = this.__getCurrentDropInfo();

      if(this.__shouldShowDropIndicator(dropInfo)) {
        this.__placeIndicator(dropInfo.anchor, dropInfo.before);
        return dropInfo;
      }

      this._hideDropIndicator();
      return null;
    },

    // NOTE: used from Analyzer automation API.
    _hideDropIndicator: function() {
      if(this.dropIndicator) {
        this.dropIndicator.style.display = "none";
      }
    },

    __placeIndicator: function(anchor, before) {
      var spacing = -5;
      var children = this.node.children;
      var bbPos = geometry.position(this.node, true);
      var dropStyle = this.dropIndicator.style;
      var pos;

      if(anchor == null) {
        if(children.length) {

          anchor = children[children.length - 1];

          pos = geometry.position(anchor, true);

          dropStyle.left = (pos.x - 7 - (bbPos.x - 5)) + "px";

          pos = geometry.position(children[0]);

          dropStyle.top = ((before ? pos.y - spacing : anchor.y + anchor.h + spacing) - (bbPos.y - 5)) + "px";
          dropStyle.width = pos.w + "px";
        } else {
          dropStyle.left = "-2px";
          dropStyle.top = (bbPos.h + 5) + "px";
          dropStyle.width = bbPos.w + "px";
        }
      } else {
        var index = this.__getChildIndex(anchor);
        var L = children.length;

        // Normalize. Only the last element can have after.
        if(!before && (index < L - 1)) {
          before = true;
          index++;
          anchor = children[index];
        }

        pos = geometry.position(anchor, true);

        // The indicator's absolute positioning is relative to its containing block's padding-box...
        // That block is the parent node of this drop zone...
        var bbPad = geometry.getPadExtents(this.dropIndicator.parentNode);

        // The left of the indicator, which shows a bullet, should really align to the padding box.
        // However, because the bullet image has some internal padding, some pixels need to be discounted for...
        var localLeft = pos.x - bbPos.x;
        dropStyle.left = (localLeft - 2) + "px";
        dropStyle.width = pos.w + "px";

        // Cannot measure the drop indicator if hidden.
        this.dropIndicator.style.display = "";
        var indicatorPos = geometry.position(this.dropIndicator, true);
        this.dropIndicator.style.display = "none";

        var centerY;
        var localTop = (pos.y - bbPos.y);
        if(!before) {
          // Must be last child.
          // After last child. Align indicator's center to last.bottom.
          centerY = localTop + pos.h;

        } else if(index === 0) {
          // Before first child. Align indicator's center to first.top.
          centerY = localTop;

        } else {
          // `i > 0`
          // Center between the anchor's top and its previous sibling's bottom.
          var posPrevious = geometry.position(children[index - 1], true);
          var localTopPrevious = (posPrevious.y - bbPos.y);
          var localBottomPrevious = localTopPrevious + posPrevious.h;

          centerY = (localTop + localBottomPrevious) / 2;
        }

        var centerYOffset = bbPad.t - indicatorPos.h / 2;

        dropStyle.top = (centerYOffset + centerY) + "px";
      }

      this.dropIndicator.style.display = "";
    },
    // endregion

    // Must make the child-under-mouse logic be lenient,
    // so that the indicator does not disappear when hovering between gems.
    // @override
    _getChildByEvent: function(e) {

      var child = this.inherited(arguments);
      if(child === null) {
        // Maybe we're in a space between bars?
        var closestChildIndex = this.__getIndexOfChildClosestToMouse(e);
        if(closestChildIndex >= 0) {
          child = this.node.children[closestChildIndex];
        }
      }

      return child;
    },

    __calculateInsertPosition: function(anchor, before) {
      var pos;

      if(anchor == null || (pos = this.__getChildIndex(anchor)) < 0) {
        pos = this.node.children.length;
      } else {
        pos = before ? pos : pos + 1;
      }

      return pos;
    },

    // @override
    insertNodes: function(addSelected, data, before, anchor, suppressInherited) {

      var position = this.__calculateInsertPosition(anchor, before);

      this.gemBar.insertAt(this.gemUIbeingInserted, position, this.dropZone2Zone);

      if(!suppressInherited) {
        this.inherited(arguments);
      }

      this.gemBar.propPanel.resize();
    },

    // region checkAcceptance*
    // This method is called within startDrag, to know if dragging is enabled.
    // When false is returned, this.targetState is set to "Disabled".
    // Otherwise, this.targetState is set to "".
    // That's why this method is testing if any position exists
    // (even if current is defined, which is sometimes the case).
    // @override
    checkAcceptance: function(source, nodes, silent) {

      // At any position.
      var position = null;

      return this.gemBar.checkAcceptance(source, nodes, silent, position);
    },

    checkAcceptanceAtDropInfo: function(source, nodes, silent, dropInfo) {
      if(dropInfo == null) {
        dropInfo = this.__getCurrentDropInfo();
      }

      var position = this.__calculateInsertPosition(dropInfo.anchor, dropInfo.before);

      return this.gemBar.checkAcceptance(source, nodes, silent, position);
    },

    checkAcceptanceAtEnd: function(source, nodes, silent) {

      var dropInfo = this.__getEndDropInfo();

      return this.checkAcceptanceAtDropInfo(source, nodes, silent, dropInfo);
    },
    // endregion

    // region drop infos
    __getCurrentDropInfo: function() {
      return {
        anchor: this.current,
        before: this.before
      };
    },

    __getEndDropInfo: function() {
      var children = this.node.children;
      return {
        anchor: children.length > 0 ? children[children.length - 1] : null,
        before: false
      };
    },

    __areEqualDropInfos: function(dropInfoA, dropInfoB) {
      return dropInfoA === dropInfoB || // including both null
        (dropInfoA !== null &&
          dropInfoB !== null &&
          dropInfoA.before === dropInfoB.before &&
          dropInfoA.anchor === dropInfoB.anchor);
    },
    // endregion

    // region utilities
    __getChildIndex: function(child) {
      return Array.prototype.indexOf.call(this.node.children, child);
    },

    __getIndexOfChildClosestToMouse: function(e) {
      var delta = 6;
      var x = e.clientX;
      var y = e.clientY;
      var closestChildIndex = -1;
      var closestChildYDistance = Infinity;

      var children = this.node.children;
      for(var i = 0; children && i < children.length; ++i) {

        var coords = geometry.position(children[i], true);

        var right = coords.x + coords.w;
        var left = coords.x;
        var top = coords.y;
        var bottom = coords.y + coords.h;

        // Inside the snap-to area?
        if(x >= left - delta && x <= right + delta && y >= top - delta && y <= bottom + delta) {

          // Strictly inside?
          if(x >= left && x <= right && y >= top && y <= bottom) {
            // No need to search more.
            return i;
          }

          var centerY = top + coords.h / 2;
          var childDistance = Math.abs(y - centerY);

          if(closestChildIndex < 0 || childDistance < closestChildYDistance) {
            closestChildIndex = i;
            closestChildYDistance = childDistance;
          }
        }
      }

      return closestChildIndex;
    },

    __isDraggingAndEnabled: function() {
      return this.isDragging && this.targetState !== "Disabled";
    }
    // endregion
  });

  var PlaceholderSource = declare([Target], {
    constructor: function(node, opts) {
      this.dropZone = opts.dropZone;
    },

    onDraggingOver: function() {

      this.inherited(arguments);

      this.dropZone.updateDropIndicatorAtEnd();
    },

    // @override
    onDraggingOut: function() {

      this.inherited(arguments);

      this.dropZone.updateDropIndicatorAtDropInfo(null);
    },

    onDrop: function(source, nodes, copy) {
      return this.dropZone.onDropAtEnd(source, nodes, copy);
    },

    checkAcceptance: function(source, nodes, silent) {
      return this.dropZone.checkAcceptanceAtEnd(source, nodes, silent);
    },

    destroy: function() {
      this.inherited(arguments);
      this.dropZone = null;
    }
  });

  var GemBarUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, StatefulUI], {

    className: "propPanel_gemBar",
    gemLimit: -1,
    templateString:
      "<div class='${className}' data-dojo-type='dijit.layout.BorderContainer' data-dojo-props='gutters:false'>" +
      "<div class='gemDropZone' data-dojo-props='region:center'></div>" +
      "<div class='gemPlaceholder'><span>${placeholderText}</span></div></div>",
    gems:   null,
    accept: ["gem"],
    showPlaceholder: true,
    placeholderText: "Drop Level Here",

    constructor: function(options) {
      this.id = newId(this.model.id + "_ui");
      this.showPlaceholder = this.model.ui.showPlaceholder;

      if(this.model.ui.placeholderText) {
        this.placeholderText = this.model.ui.placeholderText;
      }
    },

    postCreate: function() {
      this.gems = [];

      // Main node

      // Add dataType as css class.
      var dataType = this.model.dataType;
      if(dataType) {
        domClass.add(this.domNode, dataType);
      }

      // Drop zone that contains current gems.
      this.dropZoneNode = this.domNode.firstChild;

      this.dropZone = new GemBarUISource(this.dropZoneNode, {accept: this.model.ui.dndType, gemBar: this});

      // Drop zone to hold a new gem at the end.
      var isGemBarEmpty = this.model.gems.length === 0;
      var showPlaceholder = this.showPlaceholder;
      if(showPlaceholder) {
        var isGemBarFull = !this.model.allowMultiple && !isGemBarEmpty;
        if(isGemBarFull) {
          showPlaceholder = false;
        }
      }

      this.placeholder = query(".gemPlaceholder", this.domNode)[0];
      this.placeholder.style.display = showPlaceholder ? "" : "none";

      if(this.model.required && isGemBarEmpty) {
        domClass.add(this.placeholder, "reqiured");
      }

      if(showPlaceholder) {
        this._placeHolderSource =
          new PlaceholderSource(this.placeholder, {accept: this.model.ui.dndType, dropZone: this.dropZone});
      }

      this.own(
        aspect.after(this.dropZone, "onDndStart", lang.hitch(this, "__onDndStart"), true),
        // `onDndCancel` is always called, whatever the dnd outcome; see `Source#onDndDrop`.
        aspect.after(this.dropZone, "onDndCancel", lang.hitch(this, "__onDndEnd")),

        on(this.domNode, "mouseover", lang.hitch(this, "__onDndOver")),
        on(this.domNode, "mouseout", lang.hitch(this, "_hideOver"))
      );

      array.forEach(this.model.gems, function(gem) {
        var gemUI = this.createGemUI(gem, gem.sourceNode);

        this.dropZoneNode.appendChild(gemUI.domNode);
        this.add(gemUI);
      }, this);

      this.dropZone.sync();

      this.inherited(arguments);
    },

    // region diminish and highlight/over
    __onDndStart: function(source) {
      if(this.dropZone.__isDraggingAndEnabled()) {
        if(source === this.dropZone) {
          // When dragging starts on a gembar,
          // the mouse is over the gem, and not over the gembar.
          // So, the below __onDndOver isn't triggered in this case,
          // until the mouse goes to a free area in the gembar.
          this._showOver();
        }
      } else {
        this._showDiminish();
      }
    },

    __onDndOver: function() {
      if(this.dropZone.__isDraggingAndEnabled()) {
        this._showOver();
      }
    },

    __onDndEnd: function() {
      this._hideDiminish();
      this._hideOver();
    },

    // The gembar's bg color changes when it is possible to
    // add *at any position*, in this Gem Bar.
    // NOTE: used from Analyzer automation API.
    _showOver: function() {
      if(this.domNode) {
        domClass.add(this.domNode, "over");
      }
    },

    // NOTE: used from Analyzer automation API.
    _hideOver: function() {
      if(this.domNode) {
        domClass.remove(this.domNode, "over");
      }
    },

    // The gembar is made semi-transparent when
    // dragging starts and there's no position where the draggeg
    // gem can be added to it.
    _showDiminish: function() {
      if(this.domNode) {
        domClass.add(this.domNode, "dimished");
      }
    },

    _hideDiminish: function() {
      if(this.domNode) {
        domClass.remove(this.domNode, "dimished");
      }
    },
    // endregion

    add: function(gemUI) {
      gemUI.model.gemBar = this.model;
      gemUI.gemBar = this;

      this.gems.push(gemUI);

      this.propPanel.setupEventHandling(gemUI);
      this.propPanel.registerGemUI(gemUI);

      if(this.model.required) {
        domClass.remove(this.placeholder, "reqiured");
      }
    },

    insertAt: function(gemUI, pos, move) {
      var currIdx = array.indexOf(this.gems, gemUI);
      if(currIdx > -1) { // Move.
        this.gems.splice(currIdx, 1); // Remove from old pos.
      }

      this.gems.splice(pos, 0, gemUI); // Add it to the new pos.

      this.propPanel.registerGemUI(gemUI);

      this.model.insertAt(gemUI.model, pos, currIdx, move);

      if(!this.model.allowMultiple) {
        this.placeholder.style.display = "none";
      }

      if(this.model.required) {
        domClass.remove(this.placeholder, "reqiured");
      }
    },

    remove: function(gemUI, suppressEvent) {
      this.dropZoneNode.removeChild(gemUI.domNode);

      var currIdx = array.indexOf(this.gems, gemUI);
      this.gems.splice(currIdx, 1);

      this.model.remove(gemUI.model, suppressEvent);

      if(this.model.allowMultiple || this.model.gems.length === 0) {
        this.placeholder.style.display = "";
      }

      this.propPanel.unregisterGemUI(gemUI);
      this.propPanel.resize();
    },

    onContextMenu: function(event, gem) {
      // to be overwritten
    },

    checkAcceptance: function(source, nodes, silent, position) {
      return this.model.allowMultiple || this.model.gems.length === 0;
    },

    /* extension points */
    validateGem: function(gem) {
      return true;
    },

    createGemFromNode: function(sourceNode) {
      var options = {id: sourceNode.innerHTML};

      return new Configuration.registeredTypes["gem"](options);
    },

    createGemUI: function(gem, sourceNode) {
      var GemUIClass = Panel.registeredTypes["gem"];
      var options = {
        model:      gem,
        postDrop:   gem.postDrop,
        dndType:    gem.dndType,
        gemBar:     this,
        sourceNode: sourceNode
      };

      return GemUIClass.create ? GemUIClass.create(options) : new GemUIClass(options);
    },

    // -----------

    destroyRecursive: function() {
      this.inherited(arguments);

      // destroyRecursive should do this, investigate
      // Actually, the last time I checked, it is calling this.
      // However, leaving this here JIC I'm missing something.
      array.forEach(this.gems, function(gemUI) {
        if(!gemUI._destroyed) {
          gemUI.destroyRecursive();
        }
      });
    },

    destroy: function() {
      if(this.dropZone) {
        this.dropZone.destroy();
        this.dropZone = null;
      }

      if(this._placeHolderSource) {
        this._placeHolderSource.destroy();
        this._placeHolderSource = null;
      }

      this.inherited(arguments);

      // Prevent leak
      this.dropZoneNode =
      this.placeholder  =
      this._startupWidgets =
      this._supportingWidgets = null;
    }
  });

  Panel.registeredTypes["gemBar"] = GemBarUI;

  var GemUI = declare([_WidgetBase, _TemplatedMixin, Evented, StatefulUI], {

    className: "gem",
    templateString: "<div id='${id}' class='${className} dojoDndItem' dndType='${dndType}'><div class='gem-label' title='${model.value}'></div><div class='gemMenuHandle'></div></div>",

    constructor: function(options) {

      options.id = newId("gem_" + this.model.id + "_");

      this.gemBar  = options.gemBar;
      this.dndType = options.dndType;
    },

    detach: function() {
      model.detach();
    },

    destroy: function() {
      this.inherited(arguments);

      this.menuHandle =
      this.postDrop   =
      this.gemBar     =
      this._startupWidgets =
      this._supportingWidgets = null;
    },

    postCreate: function() {
      this.menuHandle = query("div.gemMenuHandle", this.domNode)[0];
      if(!this.menuHandle){
        this.menuHandle=query(".gemMenuHandle", this.domNode)[0];
      }
      var gemLabel = query("div.gem-label", this.domNode)[0];
      if(!gemLabel){
        gemLabel=query(".gem-label", this.domNode)[0];
      }
      gemLabel.innerHTML = this.model.value;

      this.own(
        on(this.domNode, "contextmenu", lang.hitch(this, "onContextMenu")),
        on(this.menuHandle, "mouseover",  function(e) {
          if(!ManagerClass.manager().source) {
            domClass.add(e.target, "over");
          }
        }),
        on(this.menuHandle, "mouseout", function(e) {
          if(!ManagerClass.manager().source) {
            domClass.remove(e.target, "over");
          }
        }),
        on(this.menuHandle, "click", lang.hitch(this,  "onContextMenu")),
        on(this.domNode, "mouseover", lang.hitch(this,  "onMouseOver")),
        on(this.domNode, "mouseout", lang.hitch(this,  "onMouseOut")));

      this.inherited(arguments);
    },

    onMouseOver: function() {
      if(!ManagerClass.manager().source) {
        domClass.add(this.domNode, "over");
      }
    },

    onMouseOut: function() {
      domClass.remove(this.domNode, "over");
    },

    // to be overwritten by container
    onContextMenu: function(e) {
      // console.log("inner onContextMenu");
      // event.stop(e);
    }
  });

  Panel.registeredTypes["gem"] = GemUI;

  var ComboUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented], {

    className: "propPanel_combobox propPanel_control",
    options: null,
    templateString: "<div class='${className}' id='${id}'></div>",

    constructor: function(options) {
      this.name  = this.model.id;
      options.id = newId(this.name, "_wrapper"); // -> this.id

      this.options = [];

      array.forEach(this.model.values, function(val, idx) {
        var opt = {label: val, value: val};

        if(this.model.ui.labels) {
          var lbl = this.model.ui.labels[idx];
          opt.label = Messages.getString(lbl, lbl);
        }

        this.options.push(opt);
      }, this);

      if(this.model.value == null)
        this.model.set('value', this.model.values[0]);

      this.value = this.model.value;
    },

    postCreate: function() {
      var me = this;
      var opts = this.options;

      array.forEach(opts, function(val, idx) {
        if(typeof(me.value) == "undefined") {
          opts['selected'] = true;
        } else {
          if(me.value == val.value) {
            val['selected'] = true;
          }
        }
      }, this);

      if(this.isMobile()) {
        // create native select widget

        var selectId  = this.id + "_select";
        var selectBox = construct.create("select", {id: selectId});

        array.forEach(opts, function(val, idx) {
          var selOpt;
          if(typeof(val.selected) != "undefined" && val.selected == true) {
            selOpt = {label: val.label, value: val.value, selected: true};
          } else {
            selOpt = {label: val.label, value: val.value};
          }
          construct.create("option", selOpt, selectBox);
        }, this);


        this.domNode.appendChild(selectBox);

        this.own(on(selectBox, "onchange", function() {
          me.model.set('value', this.value);
          me.value = this.value;
        }));

      } else {

        // use the styled drop down

        domClass.add(this.domNode, this.className);

        var sel = this.selNode = new Select({
          options: opts,
          onChange: function() {
            me.model.set('value', this.value);
            me.value = this.value;
          }
        });
        sel.placeAt(this.domNode);
      }

      this.inherited(arguments);
    },

    isMobile: function() {
      return this.isMobileSafari() || window.orientation !== undefined;
    },

    isMobileSafari: function() {
      return navigator.userAgent.match(/(iPad|iPod|iPhone)/) != null;
    },

    destroy: function() {

      this.inherited(arguments);

      if(this.selNode) {
        this.selNode.destroyRecursive();
        this.selNode = null;
      }

      // Prevent leak
      this._startupWidgets = null;
      this._supportingWidgets = null;
    }
  });

  Panel.registeredTypes["combo"] = ComboUI;

  var SliderUI = declare([HorizontalSlider, StatefulUI, Evented], {

      className: "propPanel_slider propPanel_control",
      minimum: 0,
      maximum: 100,
      style: "width: 100%",
      intermediateChanges: true,
      discreteValues: true,

      constructor: function(options) {

        options.id = newId(this.model.id + "_slider"); // -> this.id

        this.value = this.model.value;

        if(this.model.minimum) { this.minimum = this.model.minimum; }
        if(this.model.maximum) { this.maximum = this.model.maximum; }

        this.discreteValues = this.maximum - this.minimum + 1;
      },

      onChange: function() {
        this.model.set('value', this.value);
      }
    });
  Panel.registeredTypes["slider"] = SliderUI;

  var TextboxUI = declare([TextBox, StatefulUI, Evented], {
    className: "propPanel_control",

    constructor: function(options) {
      this.disabled = this.model.disabled;
      this.value    = this.model.value;

      options.id = null;

      this.inherited(arguments);
    },

    onChange: function() {
      this.model.set('value', this.value);
    }
  });
  Panel.registeredTypes["textbox"] = TextboxUI;

  var CheckBoxUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented], {

    className: "propPanel_checkbox propPanel_control",
    value: false,
    templateString: "<div class='${className}'><label for='${checkBoxId}'>${label}</label></div>",

    constructor: function(options) {

      options.id = null; // auto

      this.checkBoxId = newId(this.model.id + "_checkbox");

      if(this.model.value != null) {
        this.value = this.model.value;
      } else {
        this.model.set('value', this.value);
      }

      this.label = Messages.getString(this.model.ui.label, this.model.ui.label);
    },

    postCreate: function() {
      var id = this.checkBoxId;

      this.checkbox = new CheckBox({
            id:       id,
            name:     id,
            checked:  this.model.get('value'),
            onChange: lang.hitch(this, function(value) { this.model.set('value',  value); })
          }, id);

      this.checkbox.placeAt(this.domNode, "first");
    },

    destroy: function() {

      this.inherited(arguments);

      if(this.checkbox) {
        this.checkbox.destroyRecursive();
        this.checkbox = null;
      }

      // Prevent leak
      this._startupWidgets =
      this._supportingWidgets = null;
    }
  });
  Panel.registeredTypes["checkbox"] = CheckBoxUI;

  var ButtonUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented], {

    templateString: "<div class='button-wrapper'><button id='${buttonId}' name='${buttonId}' data-dojo-type='dijit.form.Button' type='button' >${label}</button></div>",

    constructor: function(options) {
      this.buttonId = newId(this.model.id + "_button");
      this.disabled = this.model.disabled;

      options.id = null; // auto

      var lbl = this.model.ui.label;
      this.label = Messages.getString(lbl, lbl);

      this.inherited(arguments);
    },

    postCreate: function() {
      var button = registry.byId(this.buttonId);
      this.own(
        on(button, "click", lang.hitch(this, "onClick")));
    },

    onClick: function() {
      this.model.set('clicked', true);
    },

    destroy: function() {
      this.inherited(arguments);

      // Prevent leak
      this._startupWidgets =
      this._supportingWidgets = null;
    }
  });
  Panel.registeredTypes["button"] = ButtonUI;

  return Panel;
});

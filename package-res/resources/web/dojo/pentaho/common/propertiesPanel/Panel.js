dojo.provide("pentaho.common.propertiesPanel.Panel");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.TitlePane");


dojo.declare(
    "pentaho.common.propertiesPanel.Panel",
    [dijit.layout.ContentPane],
    {
      captionTemplate: "<div class='caption'><span class='caption-text'>${caption}</span></div>",
      propUIs: [],
      groups: {},
      baseClass: "pentahoPropertiesPanel",
      constructor:function (propertiesConfiguration) {
        this.configuration = propertiesConfiguration || [];
      },
      postCreate:function () {
        dojo.forEach(this.configuration.items, dojo.hitch(this, "initializeItem"));
      },
      initializeItem:function (item) {
        var layoutClass = pentaho.common.propertiesPanel.Panel.registeredTypes[item.uiType];
        if (!layoutClass) {
          throw "No Properties Panel UI implementation found for " + item.uiType;
        }
        var propUi = new layoutClass({model: item});
        var targetNode = this.domNode;

        if(item.group){
          var group = this.groups[item.group];
          if(!group){
            var groupContents = document.createElement("div");

            group = new dijit.TitlePane({
              title: item.groupTitle,
              content: groupContents
            });
            this.groups[item.group] = group;
          }
          targetNode = group.content;
          this.domNode.appendChild(group.domNode);
        }
        if(item.caption){
          var cap = dojo._toDom(dojo.string.substitute(this.captionTemplate, item));
          targetNode.appendChild(cap);
        }

        this.propUIs.push(propUi);
        targetNode.appendChild(propUi.domNode);

      },
      setConfiguration: function(config){

        this.propUIs.forEach(function(widget){
          widget.destroyRecursive();
        });
        this.propUIs = [];
        this.groups = {},
            this.domNode.innerHTML = "";
        this.configuration = config;
        this.postCreate();
      },
      set: function(property, id, value){
        dojo.forEach(this.propUIs, function(prop){
          if(prop.model.id == id){
            prop.model.set(property, value);
          }
        })
      }
    }

);
pentaho.common.propertiesPanel.Panel.registeredTypes = {};


dojo.declare(
    "pentaho.common.propertiesPanel.StatefulUI",
    [],
    {
      constructor: function(options){
        this.model = options.model;
        var outterThis = this;
        this.model.watch(function(propName, prevVal, newVal){
          outterThis.set(propName, newVal);
        });
      }
    }
);

dojo.declare("pentaho.common.propertiesPanel.GemBarUISource", [dojo.dnd.Source],{


  onDrop:function (source, nodes, copy) {

    if (!nodes || nodes.length == 0) {
      return false;
    }
    var droppedNode = nodes[0];
    var gemUI = dijit.byId(droppedNode.id);
    var gem;
    if(gemUI){
      gem = gemUI.model;
      gemUI.gemBar.remove(gemUI);
    } else {
      var gem = this.createGemFromNode(nodes[0]);
      gemUI = this.createGemUI(gem);
    }
    this.gemBar.add(gemUI);
    this.sync();
    return true;

  },

  createGemFromNode:function (sourceNode) {
    return new pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"]({id: sourceNode.innerHTML, value: sourceNode.innerHTML}, this.gemBar);
  },
  createGemUI:function (gem) {
    return new pentaho.common.propertiesPanel.GemUI(gem, this.gemBar);
  }
});

dojo.declare(
    "pentaho.common.propertiesPanel.GemBarUI",
    [dijit._Widget, dijit._Templated, pentaho.common.propertiesPanel.StatefulUI],
    {
      className:"propPanel_gemBar",
      gemLimit:-1,
      widgetsInTemplate: true,
      templateString:"<div class='${className}'></div>",
      gems: [],
      handles: [],
      accept: ["gem"],
      constructor:function (options) {
        this.id = this.model.id+"_ui";
      },
      postCreate: function(){

        this.dropZone = new pentaho.common.propertiesPanel.GemBarUISource(this.domNode, {accept: [this.model.dndType], gemBar: this});
        // this.handles.push[dojo.connect(this.dropZone, "onDrop", this, "onDrop")];
        this.handles.push[dojo.connect(this.dropZone, "createDropIndicator", this, "createDropIndicator")];
        this.handles.push[dojo.connect(this.dropZone, "placeDropIndicator", this, "placeDropIndicator")];
        this.handles.push[dojo.connect(this.dropZone, "onMouseOver", this, "onMouseOver")];
        this.handles.push[dojo.connect(this.dropZone, "onMouseOut", this, "onMouseOut")];
        this.handles.push[dojo.connect(this.dropZone, "onDraggingOver", this, "onDraggingOver")];
        this.handles.push[dojo.connect(this.dropZone, "checkAcceptance", this, "checkAcceptance")];

      },
      add: function(gemUI){
        this.model.add(gemUI.model);
        this.domNode.appendChild(gemUI.domNode);
      },
      remove: function(gemUI){
        this.domNode.removeChild(gemUI.domNode);
      },
      createDropIndicator:function () {

      },
      placeDropIndicator:function (e) {

      },
      onMouseOver:function () {
        this.mouseMoveHandle = this.connect(window, "onMouseMove", this, "placeDropIndicator");
      },
      onMouseOut:function () {
        if (this.mouseMoveHandle) {
          dojo.disconnect(this.mouseMoveHandle);
        }
      },
      onDraggingOver:function () {
        var accept = this.checkAcceptance(dojo.dnd.manager().source, dojo.dnd.manager().nodes);
        if (accept) {
          return this.inherited(arguments);
        }
      },
      checkAcceptance: function(source, nodes){
        var i=0;
      },


      onDrop:function (source, nodes, copy) {
        if (!nodes || nodes.length == 0) {
          return false;
        }
        var droppedNode = nodes[0];
        var gem = (droppedNode.isGem) ? droppedNode.gem : this.createGemFromNode(nodes[0]);
        this.gems.push(gem);
        var gemUI = (droppedNode.isGem) ? droppedNode : this.createGemUI(gem);
        this.gems.push(gemUI);
        this.domNode.appendChild(gemUI.domNode);
        return true;
      },
      init:function () {
        dojo.forEach(this.model.gems, dojo.hitch(this, "createGems"));
      },
      createGems:function (gem) {
        var gemUI = createGemUI(gem);
        this.handles.push[dojo.connect(gemUI, "onClick", dojo.hitch(this, "_selectGem", gem))];
        this.handles.push[dojo.connect(gemUI, "onClick", dojo.hitch(this, "onSelection", gem))];
        this.handles.push[dojo.connect(gemUI, "onDblClick", dojo.hitch(this, "_selectGem", gem))];
        this.handles.push[dojo.connect(gemUI, "onDblClick", dojo.hitch(this, "onExecute", gem))];
        this.handles.push[dojo.connect(gemUI, "onContextMenu", dojo.hitch(this, "onContextMenu", gem))];
        this.domNode.appendChild(gemUI.domNode);
      },
      _selectGem:function (gem) {
        this.selectedGem = gem;
      },


      /* extension points */
      validateGem:function (gem) {
        return true;
      },
      createGemFromNode:function (sourceNode) {
        return new pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"]({id: sourceNode.innerHTML});
      },
      createGemUI:function (gem) {
        return new pentaho.common.propertiesPanel.GemUI(gem, this.className);
      },
      onSelection:function (gem) {

      },
      onExecute:function (gem) {

      },
      onContextMenu:function (gem) {

      },
      destroyRecursive: function(){
        this.inherited(arguments);
        // destroyRecursive should do this, investigate
        dojo.forEach(this.gems, function(gem){
          gem.destroy();
        });
        this.destroy();
        dojo.forEach(this.handles, dojo.disconnect);
      }
    }
);

pentaho.common.propertiesPanel.Panel.registeredTypes["gemBar"] = pentaho.common.propertiesPanel.GemBarUI;

dojo.declare(
    "pentaho.common.propertiesPanel.GemUI",
    [dijit._Widget, dijit._Templated],
    {
      className: "gem",
      gem:null,
      templateString:"<div id='${id}' class='${className} dojoDndItem' dndType='gem'>${gem.value}</div>",
      constructor:function (gem) {
        this.gem = gem;
      },
      detach: function(){
        gem.detach();
      }
    }
);

dojo.declare(
    "pentaho.common.propertiesPanel.ComboUI",
    [dijit.form.Select, pentaho.common.propertiesPanel.StatefulUI],
    {
      className:"propPanel_combobox",
      options: [],
      constructor:function (options) {
        this.inherited(arguments);

        this.name = options.id;

        dojo.forEach(this.model.values, function(val){
          this.options.push({label: val, value: val});
        }, this);


      },
      onChange: function(){
        this.model.set('value', this.value);
      }
    }
);
pentaho.common.propertiesPanel.Panel.registeredTypes["combo"] = pentaho.common.propertiesPanel.ComboUI;

dojo.declare(
    "pentaho.common.propertiesPanel.SliderUI",
    [dijit.form.HorizontalSlider, pentaho.common.propertiesPanel.StatefulUI],
    {
      className:"propPanel_slider",
      minimum: 0,
      maximum: 100,
      style: "width: 100%",
      intermediateChanges: true,
      constructor:function (options) {
        this.inherited(arguments);
        this.value = this.model.value;
        this.id = this.model.id+"_slider";
      },
      onChange: function(){
        this.model.set('value', this.value);
      }
    }
);
pentaho.common.propertiesPanel.Panel.registeredTypes["slider"] = pentaho.common.propertiesPanel.SliderUI;

dojo.declare(
    "pentaho.common.propertiesPanel.TextboxUI",
    [dijit.form.TextBox, pentaho.common.propertiesPanel.StatefulUI],
    {
      constructor:function (options) {
        this.disabled = this.model.disabled;
        this.inherited(arguments);
      },
      onChange: function(){
        this.model.set('value', this.value);
      }
    }
);
pentaho.common.propertiesPanel.Panel.registeredTypes["textbox"] = pentaho.common.propertiesPanel.TextboxUI;


dojo.declare(
    "pentaho.common.propertiesPanel.CheckBoxUI",
    [dijit._Widget, dijit._Templated, pentaho.common.propertiesPanel.StatefulUI],
    {
      className: "propPanel_checkbox",
      widgetsInTemplate: true,
      templateString: "<div class='${className}'><input id='${model.id}_checkbox' name='${model.id}_checkbox' dojoType='dijit.form.CheckBox' checked='${model.value}'/> <label for='${model.id}_checkbox'>${model.label}</label></div>",
      constructor:function (options) {
        this.inherited(arguments);
      },
      postCreate: function(){
        this.checkbox = dijit.byId(this.model.id+"_checkbox");
        var outterThis = this;
        this.connect(this.checkbox, "onChange", function(){
          outterThis.model.set('value', outterThis.checkbox.checked);
        });

      },
      set: function(prop, newVal){
        if(this.checkbox){
          this.checkbox.set(prop, newVal);
        }

      },
      onChange: function(){

      }
    }
);
pentaho.common.propertiesPanel.Panel.registeredTypes["checkbox"] = pentaho.common.propertiesPanel.CheckBoxUI;


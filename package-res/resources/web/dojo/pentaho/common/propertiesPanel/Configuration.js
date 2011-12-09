dojo.provide("pentaho.common.propertiesPanel.Configuration");
dojo.require("dojo.dnd.Source");
dojo.require("dojo.Stateful");

dojo.declare(
    "pentaho.common.propertiesPanel.Configuration",
    dojo.Stateful,
    {
      constructor: function(items){
        this.items = [];
        dojo.forEach(items, this.initializeItem, this);
      },
      initializeItem: function(item){

        var propertyClass = pentaho.common.propertiesPanel.Configuration.registeredTypes[item.uiType];
        if (!propertyClass) {
          throw "No Properties Panel UI implementation found for " + item.uiType;
        }
        var propItem = new propertyClass(item);
        var outterThis = this;
        propItem.watch(function(propName, prevVal, newVal){
          outterThis.onPropertyChange(this, propName, prevVal, newVal);
        });
        this.items.push( propItem );
      },
      onPropertyChange: function(item, propName, prevVal, newVal){

      },
      byId: function(id){
        for(var i=0; i<this.items.length; i++){
          if(this.items[i].id == id){
            return this.items[i];
          }
        }
      }

    });
pentaho.common.propertiesPanel.Configuration.registeredTypes = {};

dojo.declare(
    "pentaho.common.propertiesPanel.Property",
    [dojo.Stateful],
    {
      constructor: function(item){
        this.item = item;
        dojo.mixin(this, item);
      },
      value: null,
      setValue: function(value){
        this.value = value;
        onValueChange(value);
      },
      onValueChange: function(val){

      }
    });



dojo.declare(
    "pentaho.common.propertiesPanel.GemBar",
    [pentaho.common.propertiesPanel.Property],
    {
      gems: [],
      constructor: function(item){
        this.inherited(arguments);
        dojo.safeMixin(this, item);
      },
      postCreate: function(){

      },
      remove: function(gem){
        this.gems.splice(this.gems.indexOf(gem), 1);
      },
      add: function(gem){
        this.gems.push(gem);
      },

      gems: [],
      selectedGem: null

    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["gemBar"] = pentaho.common.propertiesPanel.GemBar;



dojo.declare(
    "pentaho.common.propertiesPanel.Gem",
    [pentaho.common.propertiesPanel.Property],
    {
      constructor: function(item, gembar){
        this.gemBar = gembar;
        this.inherited(arguments);
      },
      detach: function(){
        this.gemBar.remove(this);
      }
    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"] = pentaho.common.propertiesPanel.Gem;




dojo.declare(
    "pentaho.common.propertiesPanel.Combo",
    [pentaho.common.propertiesPanel.Property],
    {
      constructor: function(item){
        this.inherited(arguments);
      }
    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["combo"] = pentaho.common.propertiesPanel.Combo;


dojo.declare(
    "pentaho.common.propertiesPanel.Slider",
    [pentaho.common.propertiesPanel.Property],
    {
      constructor: function(item){
        this.inherited(arguments);
      }
    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["slider"] = pentaho.common.propertiesPanel.Slider;


dojo.declare(
    "pentaho.common.propertiesPanel.Textbox",
    [pentaho.common.propertiesPanel.Property],
    {
      constructor: function(item){
        this.inherited(arguments);
      }
    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["textbox"] = pentaho.common.propertiesPanel.Textbox;




dojo.declare(
    "pentaho.common.propertiesPanel.CheckBox",
    [pentaho.common.propertiesPanel.Property],
    {
      constructor: function(item){
        this.inherited(arguments);
      }
    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["checkbox"] = pentaho.common.propertiesPanel.CheckBox;



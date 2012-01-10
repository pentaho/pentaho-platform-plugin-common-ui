dojo.provide("pentaho.common.propertiesPanel.Configuration");
dojo.require("dojo.dnd.Source");
dojo.require("dojo.Stateful");

dojo.declare(
    "pentaho.common.propertiesPanel.Configuration",
    dojo.Stateful,
    {
      constructor: function(configuration){
        this.items = [];
        this.rawConfiguration = configuration;
        if(configuration && configuration.properties){
          dojo.forEach(configuration.properties, this.initializeItem, this);
        }
      },
      initializeItem: function(item){

        var propertyClass = pentaho.common.propertiesPanel.Configuration.registeredTypes[item.ui.type];
        if (!propertyClass) {
          throw "No Properties Panel UI implementation found for " + item.ui.type;
        }
        var propItem = new propertyClass(item);
        propItem.postCreate();
        var outterThis = this;
        dojo.connect(propItem, "onModelEvent", function(eventName, args){
          outterThis.onModelEvent(propItem, eventName, args);
        });
        this.items.push( propItem );
      },

      onModelEvent: function(item, eventName, args){

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
      postCreate: function(){},
      value: null,
      setValue: function(value){
        this.value = value;
        onValueChange(value);
      },
      onModelEvent: function(prop, args){
        // stub which others can connect to to "listen"
      }
    });



dojo.declare(
    "pentaho.common.propertiesPanel.GemBar",
    [pentaho.common.propertiesPanel.Property],
    {
      gems: [],
      constructor: function(item){
      },
      initializeGem: function(gemJson){
        var gem = new pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"](gemJson);
        gem.postCreate();
        this.gems.push(gem);
      },
      postCreate: function(){
        var originalGems = this.gems;
        this.gems = [];
        dojo.forEach(originalGems, this.initializeGem, this);

      },
      remove: function(gem){
        this.gems.splice(this.gems.indexOf(gem), 1);

        // fire event
        this.set("gems", this.gems);
        this.onModelEvent("removeGem", {gem: gem});
      },
      add: function(gem){
        this.gems.push(gem);

        // fire event
        this.set("gems", this.gems);
        this.onModelEvent("appendGem", {gem: gem});
      },
      reordered: function(){
        this.set("gems", this.gems);
        this.onModelEvent("reorderedGems", {});
      },

      gems: [],
      selectedGem: null

    }
);
pentaho.common.propertiesPanel.Configuration.registeredTypes["gemBar"] = pentaho.common.propertiesPanel.GemBar;
pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"] = pentaho.common.propertiesPanel.Property;
pentaho.common.propertiesPanel.Configuration.registeredTypes["combo"] = pentaho.common.propertiesPanel.Property;
pentaho.common.propertiesPanel.Configuration.registeredTypes["slider"] = pentaho.common.propertiesPanel.Property;
pentaho.common.propertiesPanel.Configuration.registeredTypes["textbox"] = pentaho.common.propertiesPanel.Property;
pentaho.common.propertiesPanel.Configuration.registeredTypes["checkbox"] = pentaho.common.propertiesPanel.Property;
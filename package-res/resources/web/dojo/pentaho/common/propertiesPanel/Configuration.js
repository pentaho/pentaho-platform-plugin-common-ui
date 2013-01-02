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
        propItem.watch(function(propName, old, now){
          outterThis.onModelEvent(propItem, propName, {prevVal: old, newVal: now});
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
      allowMultiple: true,
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
        this.onModelEvent("removedGem", {gem: gem});
      },
      add: function(gem){
        this.gems.push(gem);

        // fire event
        this.set("gems", this.gems);
        this.onModelEvent("insertAt", {gem: gem, idx: this.gems.length, oldIdx: -1});
      },
      reorder: function(){
        this.set("gems", this.gems);
        this.onModelEvent("reorderedGems", {});
      },
      insertAt: function(gem, newIdx, oldIdx){
        var currIdx = dojo.indexOf(this.gems, gem);
        this.gems.splice(newIdx, 0, gem); // add it to the new pos
        var oldIdx = currIdx;
        if(currIdx > -1) { //reorder
          if(currIdx >=newIdx){
            currIdx++;
          }
          this.gems.splice(currIdx, 1); // remove from old pos
        }
        // adjust new index to account for a move
        if(currIdx > -1 && currIdx < newIdx){
          newIdx--;
        }
        this.onModelEvent("insertAt", {gem: gem, idx: newIdx, oldIdx: oldIdx});
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
pentaho.common.propertiesPanel.Configuration.registeredTypes["button"] = pentaho.common.propertiesPanel.Property;
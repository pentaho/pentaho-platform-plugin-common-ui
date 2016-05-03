define([
  "pentaho/util/object",
  "pentaho/util/logger",
  "pentaho/data/filter",
  "pentaho/visual/base/types/selectionModes"
], function(O, logger, filter, selectionModes) {
  "use strict";

  return {
    // Temporary. Used for demos of BACKLOG-5985,BACKLOG-5989
    _init: function() {
      this.base();
      var me = this;
      window.addEventListener("keypress", function(e) {
        var ignoreTags = ["TEXTAREA", "INPUT"];

        if(ignoreTags.includes(e.target.tagName)) return;

        var mode = {
          "KeyA": selectionModes.ADD,
          "KeyD": selectionModes.REMOVE,
          "KeyR": selectionModes.REPLACE,
          "KeyT": selectionModes.TOGGLE
        };
        var selectionMode = mode[e.code];
        if(selectionMode) me.model.set("selectionMode", selectionMode);
      }, false);

      this.model.on("will:select",  this._onWillSelect.bind(this));

      this.model.set("doExecute",   this._googleSearch.bind(this));
      this.model.on("will:execute", this._onWillExecute.bind(this));

      this.model.on("will:change",  this._onWillChange.bind(this));

      this._renderCounter = 0;
      this._verifyChange = !true;
    },

    // Temporary. Used for demo of BACKLOG-5985
    _onWillSelect: function(event) {
      var multi = this._getAttributeInfosOfRole(this._multiRole);
      if(!multi) return;

      var properties = multi.reduce(function(memo, m) {
        memo.push(m.attr.name);
        return memo;
      }, []);

      // Remove restrictions on the properties that span multiple charts.
      var dataFilter = event.dataFilter.visit(function(node, children) {
        if(children !== null && children.length === 0) return null;

        if(node instanceof filter.AbstractPropertyFilter) {
          if(properties.indexOf(node.property) > -1) return null;
          return node;
        }

        return children;
      });

      event.dataFilter = dataFilter;
      logger.log("Event:" + event.type);
    },

    // Temporary. Used for demo of BACKLOG-5989
    _onWillExecute: function(event) {
      logger.log("Event:" + event.type);
    },

    // Temporary. Used for demo of BACKLOG-5989
    _googleSearch: function(dataFilter) {
      var queryValue = "";

      if(dataFilter.type === "isEqual") {
        queryValue = dataFilter.value;
      } else {
        var operands = O.getOwn(dataFilter, "operands", dataFilter.operand);
        operands.forEach(function(filter, index) {
          queryValue += filter.value + (index === operands.length - 1 ? "" : "+");
        });
      }

      var url = "http://www.google.com/search?as_q=\"" + queryValue + "\"";
      window.open(url, "_blank");

      logger.log("Google Search:" + url);
    },

    _renderCore: function() {
      this.base();
      this._renderCounter++; //BACKLOG-6739
    },

    _onWillChange: function(event) {
      var changeset = event.changeset;
      changeset.propertyNames.forEach(function(propName) {
        var result = true;
        if(this._verifyChange && (propName === "width" || propName === "height")) {
          result = window.confirm(propName + " changed. Do you really want to resize?");
          if(result === false) event.cancel("User canceled");
        }
        //var propChange = changeset.getChange(propName);
        //if(propChange)
        //  logger.log(propName + (result ? " changed!" : " did not change!") + JSON.stringify(propChange.oldValue) + " , " +  JSON.stringify(propChange.newValue));
      }, this);
    }
  };

});
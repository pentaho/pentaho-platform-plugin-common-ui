define([
  "pentaho/util/object",
  "pentaho/data/filter",
], function(O, filter) {
  "use strict";

  return {
    // Temporary. Used for demos of BACKLOG-5985,BACKLOG-5989
    _init: function() {
      this.base();

      this.model.on("will:select", this._onWillSelect.bind(this));

      this.model.set("doExecute", this._googleSearch);
      this.model.on("will:execute", this._onWillExecute);
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
      var dataFilter = event.dataFilter.transform(function(node, children) {
        if(children !== null && children.length === 0) return null;

        if(node instanceof filter.AbstractPropertyFilter) {
          if(properties.indexOf(node.property) > -1) return null;
          return node;
        }

        return children;
      });

      event.dataFilter = dataFilter;
      console.log("Event:", event);
    },

    // Temporary. Used for demo of BACKLOG-5989
    _onWillExecute: function(event) {
      console.log("Event:", event);
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

      //TODO: check why not working inside PDI
      var url = "http://www.google.com/search?as_q=\"" + queryValue + "\"";
      window.open(url, "_blank");

      console.log("Google Search:" + url);
    }
  }

});
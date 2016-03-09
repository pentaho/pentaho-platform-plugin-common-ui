define([
  "./FilterEvent"
], function(FilterEvent) {
  "use strict";

  var type = "will:select";
  return FilterEvent.extend("pentaho.visual.base.events.WillSelect", {
    constructor: function(source, dataFilter, selectionPolicy) {
      this.base(type, source, true, dataFilter);
      this.selectionPolicy = selectionPolicy;
    }
  }, {
    type: type
  });

});
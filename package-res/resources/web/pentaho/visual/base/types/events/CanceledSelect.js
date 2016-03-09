define([
  "./FilterEvent"
], function(FilterEvent) {
  "use strict";

  var type = "canceled:select";
  return FilterEvent.extend("pentaho.visual.base.events.CanceledSelect", {
    constructor: function(source, dataFilter) {
      this.base(type, source, false, dataFilter);
    }
  }, {
    type: type
  });

});
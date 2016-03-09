define([
  "./FilterEvent"
], function(FilterEvent) {
  "use strict";

  var type = "failed:select";
  return FilterEvent.extend("pentaho.visual.base.events.FailedSelect", {
    constructor: function(source, dataFilter, reason) {
      this.base(type, source, false, dataFilter);
      this.reason = reason;
    }
  }, {
    type: type
  });

});
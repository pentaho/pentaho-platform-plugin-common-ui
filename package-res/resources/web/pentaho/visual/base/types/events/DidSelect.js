define([
  "./FilterEvent"
], function(FilterEvent) {
  "use strict";

  var type = "did:select";
  return FilterEvent.extend("pentaho.visual.base.events.DidSelect", {
    constructor: function(source, dataFilter) {
      this.base(type, source, false, dataFilter);
    }
  }, {
    type: type
  });

});
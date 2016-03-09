define([
  "pentaho/lang/Event"
], function(Event) {
  "use strict";

  return Event.extend("pentaho.visual.base.events.FilterEvent", {
    constructor: function(type, source, isCancelable, dataFilter) {
      this.base(type, source, isCancelable);
      this._dataFilter = dataFilter;
      this._isMutable = isCancelable;
    },

    get dataFilter(){
      return this._dataFilter;
    },

    set dataFilter(f){
      if(this._isMutable){
        this._dataFilter = f;
      } else {
        throw TypeError();
      }
    }
  });

});
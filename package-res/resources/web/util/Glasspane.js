pen.define([], function() {

  var gp = {
    fadeInDuration: 0,
    fadeOutDuration: 500,
    $glasspane: undefined,

    /**
     * overlay a translucent panel across the entire window
     */
    show: function(/*Optional|Integer*/ zIndex) {
      // notify glasspane listeners that we are showing an glasspane
      if(window.top.mantle_notifyGlasspaneListeners) {
        window.top.mantle_notifyGlasspaneListeners(true);
      }

      this.$glasspane = $("<div class='glasspane'></div>");
      if(zIndex) {
        this.$glasspane.css({'z-index': '' + zIndex});
      }
      $(window.top.document.body).append(this.$glasspane);
      this.$glasspane.fadeIn(this.fadeInDuration, function() {
        // nothing to do after it fades in...
      });
    },

    /**
     * hide it
     */
    hide: function() {
      // notify glasspane listeners that we are hiding a glasspane
      if(window.top.mantle_notifyGlasspaneListeners) {
        window.top.mantle_notifyGlasspaneListeners(false);
      }
      var that = this;
      this.$glasspane.fadeOut(this.fadeOutDuration, function() {
        if(that.$glasspane) {
          that.$glasspane.remove();
        }
      });
    }

  };

  var glasspane = function() {};
  glasspane.prototype = gp;
  return glasspane;

});
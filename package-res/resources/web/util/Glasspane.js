pen.define([], function() {

  return {
    id: "pentaho-glasspane-overlay",
    fadeInDuration: 200,
    fadeOutDuration: 500,

    /**
     * overlay a translucent panel across the entire window
     */
    show: function() {
      var widget = this.getContainer();

      // only create the DOM element if it's not already there
      if(!widget.get(0)) {
        // be sure to style it with the "glasspane" style found in the pentaho-themes
        var waitHtml = "<div id='" + this.id + "' class='glasspane'></div>";
        $(window.top.document.body).append(waitHtml);
        $(window.top.document).find("#" + this.id).fadeIn(this.fadeInDuration);
      } else {
        // it's already available to use, just show it
        this.getContainer().fadeIn(this.fadeInDuration);
      }

    },

    /**
     * hide it
     */
    hide: function() {
      this.getContainer().fadeOut(this.fadeOutDuration);
    },

    getContainer: function() {
      // no matter where this is called from, it goes all the way to the top
      return $(window.top.document).find("#" + this.id);
    }

  };

});
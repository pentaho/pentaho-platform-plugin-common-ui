pen.define(["common-ui/util/Glasspane", "common-ui/util/PentahoSpinner"], function(glasspane, spin) {

  var busy = function() {};
  busy.prototype = {

    id: "pentaho-busy-indicator",
    fadeInDuration: 200,
    fadeOutDuration: 500,
    spinner: null,
    message: "",
    title: "",

    show: function(/*String*/ title, /*String*/ message) {
      this.message = message;
      this.title = title;
      glasspane.show();
      var widget = this.getContainer();

      if(this.spinner == null) {
        var config = spin.getLargeConfig();
        this.spinner = new Spinner(config);
      }

      // only create the DOM element if it's not already there
      if(!widget.get(0)) {
        var html = "<div id='" + this.id + "' class='busy-indicator-container waitPopup'>" +
            "  <div id='pentaho-busy-indicator-spinner' class='pentaho-busy-indicator-spinner'></div>" +
            "  <div id='pentaho-busy-indicator-msg-container' class='pentaho-busy-indicator-msg-contianer'>" +
            "    <div id='pentaho-busy-indicator-title' class='pentaho-busy-indicator-title waitPopup_title'></div>" +
            "    <div id='pentaho-busy-indicator-message' class='pentaho-busy-indicator-message waitPopup_msg'></div>" +
            "  </div>" +
            "</div>";
        $(window.top.document.body).append(html);
      } else {
        // it's already available to use, just show it
      }

      var msg = $(window.top.document).find("#pentaho-busy-indicator-message");
      msg.html(this.message);

      var title = $(window.top.document).find("#pentaho-busy-indicator-title");
      title.html(this.title);

      this.getContainer().fadeIn(this.fadeInDuration);
      var container = $(window.top.document).find("#pentaho-busy-indicator-spinner");
      this.spinner.spin(container.get(0));

    },

    /**
     * hide it
     */
    hide: function() {
      this.spinner.stop();
      this.getContainer().fadeOut(this.fadeOutDuration);
      glasspane.hide();
    },

    getContainer: function() {
      // no matter where this is called from, it goes all the way to the top
      return $(window.top.document).find("#" + this.id);
    }


  };
  return busy;

});
pen.define(["common-ui/util/Glasspane", "common-ui/util/PentahoSpinner"], function(Glasspane, spin) {

  var busy = {
    id: "pentaho-busy-indicator",
    fadeInDuration: 0,
    fadeOutDuration: 500,
    spinner: null,
    glasspane: undefined,
    $busyIndicator: undefined,
    isShowing: false,

    show: function(/*String*/ title, /*String*/ message) {
      if(this.isShowing) {
        console.log("still showing spinner, don't need another");
        return;
      }
      this.isShowing = true;

      this.glasspane = new Glasspane();

      // if we are busy, no one is above us except the waitPopup (it has zIndex of 20001 by default)
      var zIndex = 20000;
      this.glasspane.show(zIndex);

      if(this.spinner == null) {
        var config = spin.getLargeConfig();
        this.spinner = new Spinner(config);
      }

      // only create the DOM element if it's not already there
      this.$busyIndicator = $(
          "<div class='busy-indicator-container waitPopup'>" +
          "  <div class='pentaho-busy-indicator-spinner'></div>" +
          "  <div class='pentaho-busy-indicator-msg-contianer'>" +
          "    <div class='pentaho-busy-indicator-title waitPopup_title'>" + title + "</div>" +
          "    <div class='pentaho-busy-indicator-message waitPopup_msg'>" + message + "</div>" +
          "  </div>" +
          "</div>"
      );
      $(window.top.document.body).append(this.$busyIndicator);
      // adding the styles after the elements are added to the DOM due to an obscure chrome/safari issue where
      // styles weren't getting applied when added in the html declaration
      this.$busyIndicator.addClass('waitPopup');
      this.$busyIndicator.find('.pentaho-busy-indicator-title').addClass('waitPopup_title');
      this.$busyIndicator.find('.pentaho-busy-indicator-message').addClass('waitPopup_msg');


      var that = this;
      this.$busyIndicator.fadeIn(this.fadeInDuration, function() {
        var container = $(window.top.document).find(".busy-indicator-container > .pentaho-busy-indicator-spinner");
        that.spinner.spin(container.get(0));
      });

    },

    /**
     * hide it
     */
    hide: function() {
      if(this.isShowing) {
        if(this.$busyIndicator) {
          var that = this;
          this.$busyIndicator.fadeOut(this.fadeOutDuration, function() {
            that.spinner.stop();
            if(that.$busyIndicator) {
              that.$busyIndicator.remove();
              that.$busyIndicator = undefined;
            }
            that.isShowing = false;
          });
        }
        if(this.glasspane) {
          this.glasspane.hide();
          this.glasspane = undefined;
        }

      }
    }

  };

  return busy;

});
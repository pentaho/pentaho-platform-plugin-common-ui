pen.define(["common-ui/util/Glasspane", "common-ui/util/PentahoSpinner", "common-ui/util/tripleclick"], function(Glasspane, spin, tripleclick) {

    var busy = {
        id: "pentaho-busy-indicator",
        fadeInDuration: 0,
        fadeOutDuration: 500,
        spinner: null,
        glasspane: undefined,
        $busyIndicator: undefined,
        isShowing: false,
        indicators: [],

        /********************************************
         * Accepts an id to give more granular control for certain situations.
         * Keep reference when id is passed. Don't hide indicator until hide() is called with all
         * referenced id's
         ********************************************/
        show: function(/*String*/ title, /*String*/ message, /*String*/ indicatorId) {

            if( ( indicatorId != null ) && ( typeof indicatorId != 'undefined' ) ){
                this.indicators.push(indicatorId);
            }

            if(this.isShowing) {
                if(typeof console !== 'undefined' && console.log) { console.log("still showing spinner, don't need another"); }
                return;
            }
            this.isShowing = true;

            this.glasspane = new Glasspane();

            // if we are busy, no one is above us except the waitPopup (it has zIndex of 20001 by default)
            var zIndex = 20000;
            this.glasspane.show(zIndex);

            var that = this;
            $(this.glasspane.$glasspane).bind('tripleclick', function() {
              // allow triple-click to forcibly get rid of the busy indicator/glasspane
              that.hide(indicatorId);
            });

            if(this.spinner == null) {
                var config = spin.getLargeConfig();
                this.spinner = new Spinner(config);
            }

            // only create the DOM element if it's not already there
            this.$busyIndicator = $(
                "<div class='busy-indicator-container waitPopup'>" +
                "  <div class='busy-indicator-container-wrapper'>" +
                "    <div class='pentaho-busy-indicator-spinner'></div>" +
                "    <div class='pentaho-busy-indicator-msg-contianer'>" +
                "      <div class='pentaho-busy-indicator-title waitPopup_title'>" + title + "</div>" +
                "      <div class='pentaho-busy-indicator-message waitPopup_msg'>" + message + "</div>" +
                "    </div>" +
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
              var container = that.$busyIndicator.find(".pentaho-busy-indicator-spinner");
              that.spinner.spin(container.get(0));
            });
        },

        /**
         * hide it. Don't hide indicator until hide() is called with all
         * referenced id's
         */
        hide: function(/*String*/ indicatorId) {
            // if passed an id, delete from the array
            if( ( indicatorId != null ) && ( typeof indicatorId != 'undefined' ) ){
                var L = this.indicators.length;
                if (L) {
                    for(var i = L - 1 ; i >= 0; i--) {
                        if(this.indicators[i] === indicatorId) {
                            this.indicators.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            // if there are no more ids, hide
            if(this.indicators.length <= 0){
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
        }
    };

    return busy;

});

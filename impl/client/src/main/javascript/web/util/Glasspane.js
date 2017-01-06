/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

define("common-ui/util/Glasspane", [], function() {

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

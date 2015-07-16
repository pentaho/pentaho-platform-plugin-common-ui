/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

define(['cdf/components/BaseComponent', 'cdf/lib/jquery'], function(BaseComponent, $){
  return BaseComponent.extend({
    viewReportButtonRegistered: false,

    update: function () {
      this.registerSubmitClickEvent();
    },

    // Registers the click event for the parameter 'View Report' button
    // to invoke panel's submit to update report
    registerSubmitClickEvent: function () {
      if (!this.viewReportButtonRegistered) {

        var $container = $("#" + this.htmlObject)
            .empty();

        $("<button type='button' class='pentaho-button'/>")
            .text(this.label)
            .bind("mousedown", this.expressionStart.bind(this))
            .bind("click", function () {
              // Don't let click-event go as first argument.
              this.expression(false);
            }.bind(this))
            .appendTo($container);

        this.viewReportButtonRegistered = true;
      }
    },

    expressionStart: function () {
    }
  });
});

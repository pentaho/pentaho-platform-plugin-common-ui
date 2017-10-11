/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

define(['./PromptLayoutComponent', 'common-ui/jquery-clean'], function(PromptLayoutComponent, $) {
  return PromptLayoutComponent.extend({
    update: function () {
      if (this.components) {
        var $htmlObject = $('#' + this.htmlObject);

        if (this.components.length == 0) {
          $htmlObject.empty();
          return;
        }
        var html = '<div class="prompt-panel">';
        var submitHtml = '<div class="submit-panel">';
        $.each(this.components, function (i, c) {
          if (c.promptType === 'submit') {
            submitHtml += this.getMarkupFor(c);
          } else {
            html += this.getMarkupFor(c);
          }
        }.bind(this));
        html += '</div>' + submitHtml + '</div>';
        $htmlObject.html(html);
      }
    }
  });
});

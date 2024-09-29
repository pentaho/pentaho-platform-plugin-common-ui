/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


define(["./PromptLayoutComponent", "common-ui/jquery-clean"], function(PromptLayoutComponent, $) {
  return PromptLayoutComponent.extend({
    update: function() {
      if(this.components) {
        var $htmlObject = $("#" + this.htmlObject);

        if(this.components.length === 0) {
          $htmlObject.empty();
          return;
        }
        var html = '<div class="prompt-panel">';
        var submitHtml = '<div class="submit-panel">';
        $.each(this.components, function(i, c) {
          if(c.promptType === "submit") {
            submitHtml += this.getMarkupFor(c);
          } else {
            html += this.getMarkupFor(c);
          }
        }.bind(this));
        html += "</div>";

        if(!this.promptPanel.paramDefn.removeSubmitPanel) {
          html += submitHtml + "</div>";
        }

        $htmlObject.html(html);
      }
    }
  });
});

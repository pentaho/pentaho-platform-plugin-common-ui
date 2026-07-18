/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



define(['./PromptLayoutComponent'], function (PromptLayoutComponent) {

  return PromptLayoutComponent.extend({
    buildComponentCell: function (c) {
      return "<td align='left' style='vertical-align: top;'><div id='" + c.htmlObject + "'></div></td>";
    },

    getMarkupFor: function (components) {
      throw new Error('TableBasedPromptLayoutComponent should not be used directly.');
    },

    updateInternal: function () {
      var html = '<table cellspacing="0" cellpadding="0" class="parameter-container" style="width: 100%;">';
      html += '<tr><td><div><table cellspacing="0" cellpadding="0">';

      html += this.getMarkupFor(this.components);

      return html + '</table></div></td></tr></table>';
    }
  });
});

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



define(['./TableBasedPromptLayoutComponent', 'common-ui/jquery-clean'], function (TableBasedPromptLayoutComponent, $) {

  return TableBasedPromptLayoutComponent.extend({
    getMarkupFor: function (components) {
      var html = '<tr>';
      $.each(components, function (i, c) {
        var _class = this.getClassFor(c);
        // Assume components are contained in panels of components
        html += '<td align="left" style="vertical-align: top;"><div id="' + c.htmlObject + '"';
        if (_class) {
          html += ' class="' + _class + '"';
        }
        html += '></div></td>';
      }.bind(this));
      return html + '</tr>';
    }
  });

});

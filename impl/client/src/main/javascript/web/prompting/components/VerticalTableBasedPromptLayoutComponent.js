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


define(['./TableBasedPromptLayoutComponent', 'common-ui/jquery-clean'], function (TableBasedPromptLayoutComponent, $) {

  return TableBasedPromptLayoutComponent.extend({
    getMarkupFor: function (components) {
      var html = '';
      $.each(components, function (i, c) {
        var _class = this.getClassFor(c);
        // Assume components are contained in panels of components
        html += '<tr><td><div id="' + c.htmlObject + '"';
        if (_class) {
          html += ' class="' + _class + '"';
        }
        html += '></div></td></tr>';
      }.bind(this));
      return html;
    }
  });
});

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



define(['./CompositeComponent'], function(CompositeComponent){
  return CompositeComponent.extend({
    getClassFor: function (component) {
      return undefined;
    },

    getMarkupFor: function (component) {
      var _class = this.getClassFor(component);
      var html = '<div id="' + component.htmlObject + '"';
      if (_class) {
        html += ' class="' + _class + '"';
      }
      html += '></div>';
      return html;
    }
  });
});

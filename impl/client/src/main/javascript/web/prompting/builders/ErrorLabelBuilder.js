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



define(['./LabelBuilder'], function (LabelBuilder) {
  return LabelBuilder.extend({
    build: function (args) {
      var widget = this.base(args);
      var label = args.errorMessage;
      widget.isErrorIndicator = true;
      widget.expression = function () {
        return label;
      };
      return widget;
    }
  });
});

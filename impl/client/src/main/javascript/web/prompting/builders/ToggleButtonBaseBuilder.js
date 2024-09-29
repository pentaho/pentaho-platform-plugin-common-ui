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


define(['./ValueBasedParameterWidgetBuilder', 'common-ui/jquery-clean'],
    function (ValueBasedParameterWidgetBuilder, $) {
      return ValueBasedParameterWidgetBuilder.extend({
        build: function (args) {
          var widget = this.base(args);
          return $.extend(widget, {
            defaultIfEmpty: false, // Do not auto-select anything if no selection exists
            verticalOrientation: 'vertical' == args.param.attributes['parameter-layout']
          });
        }
      });

    });

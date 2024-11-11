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


define(['cdf/dashboard/Utils', 'cdf/components/TextComponent', './ParameterWidgetBuilderBase', 'common-ui/jquery-clean'],
    function (Utils, TextComponent, ParameterWidgetBuilderBase, $) {

      return ParameterWidgetBuilderBase.extend({
        build: function (args) {
          var widget = this.base(args);
          var name = widget.name + '-label';
          var label = Utils.escapeHtml(args.param.attributes['label'] || args.param.name);
          $.extend(widget, {
            promptType: 'label',
            name: name,
            htmlObject: name,
            type: 'TextComponent',
            expression: function () {
              return label;
            }
          });
          delete widget.parameter; // labels don't have parameters

          return new TextComponent(widget);
        }
      });
    });

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



define(['./ParameterWidgetBuilderBase', '../components/ParameterPanelComponent', 'common-ui/jquery-clean'],

    function (ParameterWidgetBuilderBase, ParameterPanelComponent, $) {

      return ParameterWidgetBuilderBase.extend({
        build: function (args) {
          var widget = this.base(args);
          var name = 'panel-' + widget.name;
          $.extend(widget, {
            name: name,
            htmlObject: name,
            type: 'ParameterPanelComponent',
            executeAtStart: true,
            components: args.components,
            param: args.param
          });

          return new ParameterPanelComponent(widget);
        }
      });
    });

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

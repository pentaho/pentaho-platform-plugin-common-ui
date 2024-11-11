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


define(['cdf/lib/Base', '../components/HorizontalTableBasedPromptLayoutComponent',
  '../components/FlowPromptLayoutComponent', '../components/VerticalTableBasedPromptLayoutComponent'],
    function(Base, HorizontalTableBasedPromptLayoutComponent, FlowPromptLayoutComponent,
             VerticalTableBasedPromptLayoutComponent){

  return Base.extend({

    _layoutTypes: {
      'horizontal': 'HorizontalTableBasedPromptLayoutComponent',
      'flow': 'FlowPromptLayoutComponent',
      'vertical': 'VerticalTableBasedPromptLayoutComponent'
    },


    _lookupPromptType: function (paramDefn) {
      switch (paramDefn.layout) {
        case 'horizontal':
          return this._layoutTypes.horizontal;
        case 'flow':
          return this._layoutTypes.flow;
        default:
          return this._layoutTypes.vertical;
      }
    },


    build: function (args) {
      var guid = args.promptPanel.generateWidgetGUID();
      var label = undefined;

      var widget = {
        type: this._lookupPromptType(args.promptPanel.paramDefn),
        name: args.paramGroup.name,
        htmlObject: guid,
        promptPanel: args.promptPanel,
        label: label,
        components: args.components,
        cssClass: 'parameter-wrapper flex-row flex-wrap'
      };

      switch (widget.type) {
        case this._layoutTypes.horizontal:
          return new HorizontalTableBasedPromptLayoutComponent(widget);
        case this._layoutTypes.flow:
          return new FlowPromptLayoutComponent(widget);
        case this._layoutTypes.vertical:
          return new VerticalTableBasedPromptLayoutComponent(widget);
      }
    }
  });
});

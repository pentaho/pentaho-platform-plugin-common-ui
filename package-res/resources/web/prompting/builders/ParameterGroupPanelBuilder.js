/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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

    /**
     *
     * @param paramDefn
     * @returns {*}
     * @private
     */
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

    /**
     *
     * @param args
     * @returns {*}
     */
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
        cssClass: 'parameter-wrapper'
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

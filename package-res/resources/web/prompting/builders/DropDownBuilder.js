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

define(['cdf/components/SelectComponent', './ValueBasedParameterWidgetBuilder'],
    function(SelectComponent, ValueBasedParameterWidgetBuilder){

  return ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var widget = this.base(args);

      if (args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection()) {
        // If there is no empty selection, and no value is selected, create one. This way, we can represent
        // the unselected state.
        widget.valuesArray = [['', '']].concat(widget.valuesArray);
      }

      $.extend(widget, {
        type: 'SelectComponent',
        preExecution: function() {
          // SelectComponent defines defaultIfEmpty = true for non-multi selects.
          // We can't override any properties of the component so we must set them just before update() is called. :(
          // Only select the first item if we have no selection and are not ignoring BISERVER-5538
          this.defaultIfEmpty = !args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection();
        }
      });

      return new SelectComponent(widget);
    }
  });
});

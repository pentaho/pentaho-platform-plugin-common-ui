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

/**
 * The Parameter Widget Builder Base Class
 *
 * @name ParameterWidgetBuilderBase
 * @class
 */
define(['cdf/lib/Base'], function(Base){

  return Base.extend({
    build: function (args) {
      var guid = args.promptPanel.generateWidgetGUID();
      return {
        promptType: 'prompt',
        executeAtStart: true,
        param: args.param,
        name: guid,
        htmlObject: guid,
        type: undefined, // must be declared in extension class
        parameter: args.promptPanel.getParameterName(args.param),
        postExecution: function () {
          this.base();
          var tooltip = this.param.attributes['tooltip'];
          if (tooltip) {
            $('#' + this.htmlObject).attr('title', tooltip);
          }
        }
      }
    }
  });
});

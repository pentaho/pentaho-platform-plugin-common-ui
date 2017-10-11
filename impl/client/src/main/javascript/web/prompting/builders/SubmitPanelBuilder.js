/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
 * <h2>The Submit Panel Builder</h2>
 *
 * To use the SubmitPanelBuilder you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/builders/SubmitPanelBuilder' ],
 *     function(SubmitPanelBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and call the <code>build</code> method:
 *
 * <pre><code>
 *   var submitPanelBuilder = new SubmitPanelBuilder();
 *
 *   var flowPromptLayoutComponent = submitPanelBuilder(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for the {@link FlowPromptLayoutComponent}.
 *
 * @name SubmitPanelBuilder
 * @class
 * @extends Base
 */
define(['cdf/lib/Base', '../components/FlowPromptLayoutComponent'],
    function (Base, FlowPromptLayoutComponent) {
      return Base.extend({

        /**
         * Creates and returns a new instance of FlowPromptLayoutComponent.
         *
         * @method
         * @name SubmitPanelBuilder#build
         * @param {Object}
         *          args The arguments to build the widget in accordance with {@link FlowPromptLayoutComponent}
         * @returns {FlowPromptLayoutComponent} The new instance of FlowPromptLayoutComponent
         */
        build: function (args) {
          var guid = args.promptPanel.generateWidgetGUID();

          return new FlowPromptLayoutComponent({
            type: 'FlowPromptLayoutComponent',
            promptType: 'submit',
            name: guid,
            htmlObject: guid,
            executeAtStart: true,
            components: [
              args.promptPanel.createWidgetForSubmitComponent()
            ]
          });
        }
      });
    });

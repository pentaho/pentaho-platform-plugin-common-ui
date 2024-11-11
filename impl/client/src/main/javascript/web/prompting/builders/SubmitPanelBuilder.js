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

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
 * <h2>The Submit Component Builder</h2>
 *
 * To use the SubmitComponentBuilder you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/builders/SubmitComponentBuilder' ],
 *     function(SubmitComponentBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and call the <code>build</code> method:
 *
 * <pre><code>
 *   var submitComponentBuilder = new SubmitComponentBuilder();
 *
 *   var submitPromptComponent = submitComponentBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for the {@link SubmitPromptComponent}.
 *
 * @name SubmitComponentBuilder
 * @class
 * @extends Base
 */
define(['cdf/lib/Base', '../components/SubmitPromptComponent', 'pentaho/common/Messages'],
    function (Base, SubmitPromptComponent, Messages) {
    
      /*
       * Gets a message from the messages bundle.
       *
       * @name SubmitComponentBuilder#_getMessage
       * @method
       *
       * @param  {String} key String the key in the bundle which references the desired string.
       * @param  {Array} substitutionVars Array of String (optional) an array of strings
       * to substitute into the message string.
       * @returns {String} The message that corresponds to the key.
       * @private
       */  
      var _getMessage = function(key, substitutionVars) {
        return Messages.getString(key, substitutionVars);
      }

      return Base.extend({

        /**
         * Creates and returns a new instance of SubmitPromptComponent.
         *
         * @method
         * @name SubmitComponentBuilder#build
         * @param {Object}
         *          args The arguments to build the widget in accordance with {@link SubmitPromptComponent}
         * @returns {SubmitPromptComponent} The new instance of SubmitPromptComponent
         */
        build: function (args) {
          var guid = args.promptPanel.generateWidgetGUID();

          return new SubmitPromptComponent({
            promptType: 'submit',
            type: 'SubmitPromptComponent',
            name: guid,
            htmlObject: guid,
            label: _getMessage('submitButtonLabel', 'Submit'),
            autoSubmitLabel: _getMessage('autoSubmitLabel', 'Auto-Submit'),
            promptPanel: args.promptPanel,
            paramDefn: args.promptPanel.paramDefn,
            executeAtStart: true
          });
        }
      });
    });

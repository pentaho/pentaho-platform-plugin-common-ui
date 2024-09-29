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
 * <h2>The Flow Prompt Layout Component class</h2>
 *
 * <p>The FlowPromptLayoutComponent renders elements with special css class.</p>
 *
 * To use the FlowPromptLayoutComponent you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/components/FlowPromptLayoutComponent' ],
 *     function(FlowPromptLayoutComponent) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * @name FlowPromptLayoutComponent
 * @class
 * @extends PromptLayoutComponent
 */
define(['common-ui/jquery-clean', './PromptLayoutComponent'], function($, PromptLayoutComponent) {

  return PromptLayoutComponent.extend({

    /**
     * Renders component with special flow css class.
     *
     * @method
     * @name FlowPromptLayoutComponent#update
     */
    update: function () {
      $('#' + this.htmlObject).addClass('flow');
      this.base();
    }
  });

});

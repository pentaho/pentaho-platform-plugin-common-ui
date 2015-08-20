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
define(['cdf/lib/jquery', './PromptLayoutComponent'], function($, PromptLayoutComponent){

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

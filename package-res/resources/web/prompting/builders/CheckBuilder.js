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
 * <h2>The Check Builder</h2>
 *
 * To use the CheckBuilder you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/builders/CheckBuilder' ],
 *     function(CheckBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and call the <code>build</code> method:
 *
 * <pre><code>
 *   var checkBuilder = new CheckBuilder();
 *
 *   var checkComponent = checkBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters necessary for the component as per
 * [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:55-CheckComponent:check_component.xcdf/generatedContent}.
 *
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name CheckBuilder
 * @class
 * @extends ToggleButtonBaseBuilder
 */
define([ 'cdf/components/CheckComponent', './ToggleButtonBaseBuilder' ], function(CheckComponent,
  ToggleButtonBaseBuilder) {

  return ToggleButtonBaseBuilder.extend({

    /**
     * Builds the widget and returns a new instance of CDF CheckComponent.
     *
     * @method
     * @name CheckBuilder#build
     * @param {Object}
     *          args The arguments to build the widget in accordance with [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:55-CheckComponent:check_component.xcdf/generatedContent}
     * @param {Parameter}
     *          args.param - The parameter with the properties needed to build the component
     * @returns {CheckComponent} The new instance of CheckComponent
     */
    build : function(args) {
      var widget = this.base(args);
      widget.type = 'CheckComponent';
      return new CheckComponent(widget);
    }
  });
});

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
define(['common-ui/prompting/builders/ParameterGroupPanelBuilder'], function(ParameterGroupPanelBuilder) {

  describe("ParameterGroupPanelBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { },
        paramDefn: {
          layout: ''
        }
      }, 
      param:  {
        values: { },
        attributes: { },
      },
      paramGroup: {
        name: ''
      }
    };

    var parameterPanelBuilder;

    beforeEach(function() {
      parameterPanelBuilder = new ParameterGroupPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(parameterPanelBuilder.build).toThrow();
    });

    it("should return a HorizontalTableBasedPromptLayoutComponent when layout is 'horizontal'", function() {
      args.promptPanel.paramDefn.layout = 'horizontal';
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('HorizontalTableBasedPromptLayoutComponent');
    });

    it("should return a FlowPromptLayoutComponent when layout is 'flow'", function() {
      args.promptPanel.paramDefn.layout = 'flow';
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('FlowPromptLayoutComponent');
    });

    it("should return a VerticalTableBasedPromptLayoutComponent when layout is 'vertical'", function() {
      args.promptPanel.paramDefn.layout = 'vertical';
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('VerticalTableBasedPromptLayoutComponent');
    });

  });

});
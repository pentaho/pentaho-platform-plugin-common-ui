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
define(['common-ui/prompting/builders/SubmitPanelBuilder'], function(SubmitPanelBuilder) {

  describe("SubmitPanelBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { },
        getString: function() { },
        createWidgetForSubmitComponent: function() { }
      }, 
      param:  {
        values: { },
        attributes: { }
      }
    };

    var submitPanelBuilder;

    beforeEach(function() {
      submitPanelBuilder = new SubmitPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      var component;
      try { 
        component = submitPanelBuilder.build(); 
      }
      catch(ex) {
      } 
      expect(component).toBe(undefined);
    });

    it("should return a FlowPromptLayoutComponent", function() {
      var component = submitPanelBuilder.build(args);
      expect(component.type).toBe('FlowPromptLayoutComponent');
    });

  });

});
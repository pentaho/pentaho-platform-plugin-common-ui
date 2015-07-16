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
define(['common-ui/prompting/builders/PromptPanelBuilder'], function(PromptPanelBuilder) {

  describe("PromptPanelBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { },
        buildPanelComponents: function() { },
        _ready: function() { }
      }
    };

    var promptPanelBuilder;

    beforeEach(function() {
      promptPanelBuilder = new PromptPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(promptPanelBuilder.build).toThrow();
    });

    it("should return a ScrollingPromptPanelLayoutComponent", function() {
      var component = promptPanelBuilder.build(args.promptPanel);
      expect(component.type).toBe('ScrollingPromptPanelLayoutComponent');
      expect(component.postExecution).toBeDefined();
    });

    it("should execute _ready on postExecution", function() {
      var component = promptPanelBuilder.build(args.promptPanel); 
      spyOn(args.promptPanel, '_ready').and.callThrough();
      component.postExecution();
      expect(args.promptPanel._ready).toHaveBeenCalled();
    });

  });

});
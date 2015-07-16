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

define([ 'common-ui/prompting/components/VerticalTableBasedPromptLayoutComponent' ], function(
  VerticalTableBasedPromptLayoutComponent) {

  describe("VerticalTableBasedPromptLayoutComponent", function() {
    describe("getMarkupFor", function() {
      var testCss = "test-css";
      var comp;
      beforeEach(function() {
        comp = new VerticalTableBasedPromptLayoutComponent();
        spyOn(comp, "getClassFor").and.callFake(function(component) {
          return component.htmlObject == "test_id_0" ? testCss : undefined;
        });
      });

      it("should return empty string if not exist components", function() {
        var html = comp.getMarkupFor([]);
        expect(html).toBe("");
      });

      it("should return html for components", function() {
        var componentWithCss = jasmine.createSpy("componentWithCss");
        componentWithCss.htmlObject = "test_id_0";
        var simpleComponent = jasmine.createSpy("simpleComponent");
        simpleComponent.htmlObject = "test_id_1";
        var expected = '<tr><td><div id="test_id_0" class="test-css"></div></td></tr>'
          + '<tr><td><div id="test_id_1"></div></td></tr>';

        var components = [ componentWithCss, simpleComponent ];
        var html = comp.getMarkupFor(components);

        expect(html).toBe(expected);
      });
    });
  });
});
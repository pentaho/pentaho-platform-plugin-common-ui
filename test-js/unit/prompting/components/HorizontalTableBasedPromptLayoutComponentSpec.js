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

define(
  [ 'common-ui/prompting/components/HorizontalTableBasedPromptLayoutComponent' ],
  function(HorizontalTableBasedPromptLayoutComponent) {

    describe(
      "HorizontalTableBasedPromptLayoutComponent",
      function() {

        describe(
          "getMarkupFor",
          function() {
            var testClass = "test-class";
            var comp;
            var components;

            beforeEach(function() {
              components = [];
              for (var i = 0; i < 2; i++) {
                var fakeComp = jasmine.createSpy("fakeComp");
                fakeComp.htmlObject = "test_" + i;
                components.push(fakeComp);
              }
              comp = new HorizontalTableBasedPromptLayoutComponent();
            });

            it("should return empty tr if not exist components", function() {
              spyOn(comp, "getClassFor").and.returnValue(testClass);
              var html = comp.getMarkupFor([]);
              expect(html).toBe("<tr></tr>");
              expect(comp.getClassFor).not.toHaveBeenCalled();
            });

            it(
              "should return tr with td for all components",
              function() {
                spyOn(comp, "getClassFor").and.returnValue(testClass);
                var html = comp.getMarkupFor(components);
                expect(html)
                    .toMatch(
                      /<tr>(<td align=\"left\" style=\"vertical-align: top;\"><div id=\"test_\d\" class=\"test-class\"><\/div><\/td>){2}<\/tr>/);
              });

            it("should return tr with td for all components without css class", function() {
              spyOn(comp, "getClassFor");
              var html = comp.getMarkupFor(components);
              expect(html).toMatch(
                /<tr>(<td align=\"left\" style=\"vertical-align: top;\"><div id=\"test_\d\"><\/div><\/td>){2}<\/tr>/);
            });
          });
      });
  });
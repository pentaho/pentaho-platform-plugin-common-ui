/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  [ 'common-ui/prompting/components/TableBasedPromptLayoutComponent' ],
  function(TableBasedPromptLayoutComponent) {

    describe(
      "TableBasedPromptLayoutComponent",
      function() {

        var comp;
        beforeEach(function() {
          comp = new TableBasedPromptLayoutComponent();
        });

        it("buildComponentCell - should add css class 'flow'", function() {
          var paramComponent = jasmine.createSpy("paramComponent");
          paramComponent.htmlObject = "test_id";
          var cell = comp.buildComponentCell(paramComponent);
          expect(cell).toBe(
            "<td align='left' style='vertical-align: top;'><div id='" + paramComponent.htmlObject + "'></div></td>");
        });

        it("getMarkupFor - should throw info message by default", function() {
          expect(function() {
            comp.getMarkupFor();
          }).toThrowError("TableBasedPromptLayoutComponent should not be used directly.");
        });

        it(
          "updateInternal - should return html table",
          function() {
            var internalElem = "<span>test</span>";
            var expected = '<table cellspacing="0" cellpadding="0" class="parameter-container" style="width: 100%;"><tr><td><div><table cellspacing="0" cellpadding="0">'
              + internalElem + '</table></div></td></tr></table>';
            spyOn(comp, "getMarkupFor").and.returnValue(internalElem);
            var html = comp.updateInternal();
            expect(html).toBe(expected);
          });
      });
  });

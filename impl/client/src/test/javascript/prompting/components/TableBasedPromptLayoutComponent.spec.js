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

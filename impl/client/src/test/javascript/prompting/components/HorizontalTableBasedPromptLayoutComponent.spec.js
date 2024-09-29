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
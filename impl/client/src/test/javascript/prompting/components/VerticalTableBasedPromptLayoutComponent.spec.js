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
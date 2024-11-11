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


define([ 'common-ui/prompting/components/PanelComponent' ], function(PanelComponent) {

  describe("PanelComponent", function() {

    describe("getClassFor", function() {
      it("should return undefind by default", function() {
        var comp = new PanelComponent();
        var css = comp.getClassFor();
        expect(css).not.toBeDefined();
      });

      it("should return undefind for concrete component", function() {
        var comp = new PanelComponent();
        var paramComponent = jasmine.createSpy("component");
        var css = comp.getClassFor(paramComponent);
        expect(css).not.toBeDefined();
      });
    });

    describe("getMarkupFor", function() {
      var testId = "test_id";
      var comp;
      var paramComponent;

      beforeEach(function() {
        paramComponent = jasmine.createSpy("component");
        paramComponent.htmlObject = testId;
        comp = new PanelComponent();
      });

      it("should return html template for component", function() {
        spyOn(comp, "getClassFor");
        var html = comp.getMarkupFor(paramComponent);
        expect(html).toBe('<div id="' + testId + '"></div>');
      });

      it("should return html template for component with css", function() {
        var testCss = "test-class";
        spyOn(comp, "getClassFor").and.returnValue(testCss);
        var html = comp.getMarkupFor(paramComponent);
        expect(html).toBe('<div id="' + testId + '" class="' + testCss + '"></div>');
      });
    });
  });
});

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


define([ 'common-ui/prompting/components/PromptLayoutComponent' ], function(PromptLayoutComponent) {

  describe("PromptLayoutComponent", function() {

    describe("getClassFor", function() {
      var paramComponent;
      var comp;
      beforeEach(function() {
        paramComponent = jasmine.createSpy("paramComponent");
        comp = new PromptLayoutComponent();
      });

      it("should return defined result for component", function() {
        paramComponent.param = jasmine.createSpy("param");
        var css = comp.getClassFor(paramComponent);
        expect(css).toBe('parameter');
      });

      it("should not return specific css result for component", function() {
        var testCss = "test-css";
        paramComponent.param = jasmine.createSpy("param");
        paramComponent.cssClass = testCss;
        var css = comp.getClassFor(paramComponent);
        expect(css).toBe('parameter');
      });

      it("should return undefined result if not exist param", function() {
        var css = comp.getClassFor(paramComponent);
        expect(css).not.toBeDefined();
      });
    });
  });
});

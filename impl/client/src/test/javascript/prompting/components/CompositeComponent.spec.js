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


define([ 'common-ui/jquery-clean', 'cdf/dashboard/Utils', 'common-ui/prompting/components/CompositeComponent' ], function($,
  Utils, CompositeComponent) {

  describe("CompositeComponent", function() {

    describe("getComponents", function() {
      it("should return undefind by default", function() {
        var comp = new CompositeComponent();
        var components = comp.getComponents();
        expect(components).not.toBeDefined();
      });

      it("should return not empty array of components", function() {
        var internalComponent = jasmine.createSpy('component');
        var comp = new CompositeComponent();
        comp.components = [ internalComponent ];
        var components = comp.getComponents();
        expect(components).toEqual([ internalComponent ]);
      });
    });

    describe("clear", function() {
      it("should execute export method", function() {
        var comp = new CompositeComponent();
        comp.clear();
      });

      it("should clear components and execute super method", function() {
        var internalComponent = jasmine.createSpyObj('component', [ "clear" ]);
        var comp = new CompositeComponent();
        comp.components = [ internalComponent ];
        comp.clear();
        expect(internalComponent.clear).toHaveBeenCalled();
      });
    });

    it("should get css class of component", function() {
      var internalComponent = jasmine.createSpy('component');
      internalComponent.cssClass = "test-css-selector";
      var comp = new CompositeComponent();
      var css = comp.getClassFor(internalComponent);
      expect(css).toBe(internalComponent.cssClass);
    });

    describe("getMarkupFor", function() {
      var internalComponent;
      var testCssSelector = "test_css";
      var comp;
      beforeEach(function() {
        internalComponent = jasmine.createSpy('component');
        internalComponent.htmlObject = "test_id";
        comp = new CompositeComponent();
      });

      it("should return simple html", function() {
        spyOn(comp, "getClassFor");
        var html = comp.getMarkupFor(internalComponent);
        expect(html).toBe('<div id="' + internalComponent.htmlObject + '"></div>');
      });

      it("should return simple html with css", function() {
        spyOn(comp, "getClassFor").and.returnValue(testCssSelector);
        var html = comp.getMarkupFor(internalComponent);
        expect(html).toBe('<div id="' + internalComponent.htmlObject + '" class="' + testCssSelector + '"></div>');
      });
    });

    describe("update", function() {
      var internalHtml = "<span>comp</span>";
      var comp;
      beforeEach(function() {
        comp = new CompositeComponent();
        comp.htmlObject = "test_id";
        spyOn(comp, "updateInternal").and.returnValue(internalHtml);
        spyOn($.fn, 'html');
        spyOn($.fn, 'addClass');
        spyOn(Utils, "escapeHtml").and.callFake(function(param) {
          return param;
        });
      });

      it("should full update html", function() {
        var internalComponent = jasmine.createSpy('component');
        comp.label = "test_label";
        comp.components = [ internalComponent ];
        comp.cssClass = "test_css_selector";

        comp.update();

        expect(comp.updateInternal).toHaveBeenCalled();
        expect(Utils.escapeHtml).toHaveBeenCalledWith(comp.label);
        expect($.fn.html).toHaveBeenCalledWith(
          "<fieldset><legend>" + comp.label + "</legend><div>" + internalHtml + "</div></fieldset>");
        expect($.fn.addClass).toHaveBeenCalledWith(comp.cssClass);
      });

      it("should set empty html", function() {
        comp.update();

        expect(comp.updateInternal).not.toHaveBeenCalled();
        expect(Utils.escapeHtml).not.toHaveBeenCalled();
        expect($.fn.html).toHaveBeenCalledWith("");
        expect($.fn.addClass).not.toHaveBeenCalled();
      });
    });

    describe("updateInternal", function() {
      var internalHtml = "<span>comp</span>";
      var comp;
      var internalComponent;
      beforeEach(function() {
        internalComponent = jasmine.createSpy('component');
        comp = new CompositeComponent();
        comp.components = [ internalComponent ];
        spyOn(comp, "getMarkupFor").and.returnValue(internalHtml);
      });

      it("should full update html", function() {
        var html = comp.updateInternal();
        expect(html).toBe(internalHtml);
        expect(comp.getMarkupFor).toHaveBeenCalledWith(internalComponent);
      });
    });
  });
});

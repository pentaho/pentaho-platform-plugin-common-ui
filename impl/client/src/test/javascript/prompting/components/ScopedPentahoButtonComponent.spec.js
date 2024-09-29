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


define(["common-ui/prompting/components/ScopedPentahoButtonComponent", "common-ui/jquery-clean"], function(
  ScopedPentahoButtonComponent, $) {

  describe("ScopedPentahoButtonComponent", function() {
    it("should create component", function() {
      var comp = new ScopedPentahoButtonComponent();
      expect(comp.viewReportButtonRegistered).toBeFalsy();
    });

    describe("update", function() {
      it("should register submit event", function() {
        var comp = new ScopedPentahoButtonComponent();
        spyOn(comp, "registerSubmitClickEvent");
        comp.update();
        expect(comp.registerSubmitClickEvent).toHaveBeenCalled();
      });
    });

    describe("registerSubmitClickEvent", function() {
      var testLabel = "test label";
      var id = "test_id";
      var comp;
      var spyElem = jasmine.createSpyObj("spyElem", ["bind", "appendTo"]);
      spyElem.bind.and.returnValue(spyElem);
      spyElem.appendTo.and.returnValue(spyElem);
      beforeEach(function() {
        comp = new ScopedPentahoButtonComponent();
        comp.htmlObject = id;
        comp.label = testLabel;
        spyOn($.fn, "empty");
        spyOn($.fn, "text").and.returnValue(spyElem);
      });

      it("should register event if it's not registered", function() {
        comp.registerSubmitClickEvent();
      });

      it("should not register event if already registered", function() {
        comp.registerSubmitClickEvent();
        comp.registerSubmitClickEvent();
      });

      afterEach(function() {
        expect($.fn.empty).toHaveBeenCalled();
        expect($.fn.text).toHaveBeenCalledWith(testLabel);
        expect(spyElem.bind.calls.argsFor(0)).toEqual(["mousedown", jasmine.any(Function)]);
        expect(spyElem.bind.calls.argsFor(1)).toEqual(["click", jasmine.any(Function)]);
        expect(spyElem.appendTo).toHaveBeenCalled();
      });
    });

    it("should execute expressionStart fn", function() {
      var comp = new ScopedPentahoButtonComponent();
      comp.expressionStart();
    });

    describe("setDisabledButton", function() {
      beforeEach(function() {
        spyOn($.fn, "attr");
      });

      it("should disable the submit button", function() {
        var comp = new ScopedPentahoButtonComponent();
        comp.setDisabledButton(true);
        expect($.fn.attr).toHaveBeenCalledWith("disabled", true);
      });

      it("should enable the submit button", function() {
        var comp = new ScopedPentahoButtonComponent();
        comp.setDisabledButton(false);
        expect($.fn.attr).toHaveBeenCalledWith("disabled", false);
      });
    });
  });
});

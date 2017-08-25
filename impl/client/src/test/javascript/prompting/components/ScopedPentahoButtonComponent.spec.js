/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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

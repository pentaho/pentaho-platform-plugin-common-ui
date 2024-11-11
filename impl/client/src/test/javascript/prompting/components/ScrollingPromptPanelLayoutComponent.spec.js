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


define(["common-ui/prompting/components/ScrollingPromptPanelLayoutComponent", "common-ui/jquery-clean"], function(
  ScrollingPromptPanelLayoutComponent, $) {

  describe("ScrollingPromptPanelLayoutComponent", function() {

    describe("update", function() {
      var id = "test_id";
      var testSpan = "<span>test internal div</span>";
      var comp;
      var paramDefn;

      beforeEach(function() {
        paramDefn = {
          removeSubmitPanel: false
        };

        comp = new ScrollingPromptPanelLayoutComponent();
        comp.htmlObject = id;
        spyOn(comp, "getMarkupFor").and.returnValue(testSpan);
        spyOn($.fn, "empty");
        spyOn($.fn, "html");
      });

      describe("should not update", function() {
        it("if components are undefined", function() {
          comp.update();
          expect($.fn.empty).not.toHaveBeenCalled();
        });

        it("without components", function() {
          comp.components = [];
          comp.update();
          expect($.fn.empty).toHaveBeenCalled();
        });

        afterEach(function() {
          expect(comp.getMarkupFor).not.toHaveBeenCalled();
          expect($.fn.html).not.toHaveBeenCalled();
        });
      });

      it("should update", function() {
        var promptComponent = jasmine.createSpy("promptComponent");
        promptComponent.promptType = "prompt";
        var submitComponent = jasmine.createSpy("submitComponent");
        submitComponent.promptType = "submit";
        comp.components = [promptComponent, submitComponent];
        comp.promptPanel = {};

        comp.promptPanel.paramDefn = paramDefn;

        var expectedHtml = '<div class="prompt-panel">' + testSpan + '</div><div class="submit-panel">' + testSpan +
          "</div>";

        comp.update();

        expect(comp.getMarkupFor.calls.count()).toBe(2);
        expect($.fn.empty).not.toHaveBeenCalled();
        expect($.fn.html).toHaveBeenCalledWith(expectedHtml);
      });

      it("should not add submit panel", function() {
        var promptComponent = jasmine.createSpy("promptComponent");
        promptComponent.promptType = "prompt";
        var submitComponent = jasmine.createSpy("submitComponent");
        submitComponent.promptType = "submit";
        comp.components = [promptComponent, submitComponent];

        comp.promptPanel = {};
        comp.promptPanel.paramDefn = paramDefn;
        comp.promptPanel.paramDefn.removeSubmitPanel = true;

        var expectedHtml = '<div class="prompt-panel">' + testSpan + "</div>";

        comp.update();

        expect(comp.getMarkupFor.calls.count()).toBe(2);
        expect($.fn.empty).not.toHaveBeenCalled();
        expect($.fn.html).toHaveBeenCalledWith(expectedHtml);
      });
    });
  });
});

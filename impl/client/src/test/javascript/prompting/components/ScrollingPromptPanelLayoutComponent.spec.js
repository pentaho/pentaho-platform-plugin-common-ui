/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

define([ 'common-ui/prompting/components/ScrollingPromptPanelLayoutComponent', 'common-ui/jquery-clean' ], function(
  ScrollingPromptPanelLayoutComponent, $) {

  describe("ScrollingPromptPanelLayoutComponent", function() {

    describe("update", function() {
      var id = "test_id";
      var testSpan = "<span>test internal div</span>";
      var comp;
      beforeEach(function() {
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
        comp.components = [ promptComponent, submitComponent ];
        var expectedHtml = '<div class="prompt-panel">' + testSpan + '</div><div class="submit-panel">' + testSpan
          + '</div>';

        comp.update();

        expect(comp.getMarkupFor.calls.count()).toBe(2);
        expect($.fn.empty).not.toHaveBeenCalled();
        expect($.fn.html).toHaveBeenCalledWith(expectedHtml);
      });
    });
  });
});

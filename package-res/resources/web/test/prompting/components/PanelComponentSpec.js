/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

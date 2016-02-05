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

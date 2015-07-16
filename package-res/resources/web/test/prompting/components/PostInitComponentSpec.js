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

define([ 'cdf/lib/jquery', 'common-ui/prompting/components/PostInitComponent' ], function($, PostInitComponent) {

  describe("PostInitComponent", function() {

    it("should create PostInitComponent", function() {
      var comp = new PostInitComponent();
      expect(comp).toEqual(jasmine.objectContaining({
        name : "PostInitPromptPanelScrollRestorer",
        type : "base",
        lifecycle : {
          silent : true
        },
        executeAtStart : true,
        priority : 999999999
      }));
    });

    describe("update", function() {
      var comp;
      beforeEach(function() {
        comp = new PostInitComponent();
        comp.promptPanel = "test-panel";
        $("<div id='test-panel'></div>");
        spyOn($.fn, "children").and.returnValue($("<div></div>"));
        spyOn($.fn, "scrollTop");
      });

      it("should do nothing if not exist promptPanelScrollValue", function() {
        comp.update();
        expect(comp.promptPanelScrollValue).not.toBeDefined();
        expect($.fn.children).not.toHaveBeenCalled();
        expect($.fn.scrollTop).not.toHaveBeenCalled();
      });

      it("should restore last scroll position for prompt panel", function() {
        var scrollValue = 100;
        comp.promptPanelScrollValue = scrollValue;
        comp.update();
        expect(comp.promptPanelScrollValue).not.toBeDefined();
        expect($.fn.children).toHaveBeenCalledWith(".prompt-panel");
        expect($.fn.scrollTop).toHaveBeenCalledWith(scrollValue);
      });
    });
  });
});

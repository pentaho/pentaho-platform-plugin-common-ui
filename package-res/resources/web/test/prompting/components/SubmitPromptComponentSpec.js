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

define([ 'common-ui/prompting/components/SubmitPromptComponent', 'common-ui/jquery-clean' ], function(SubmitPromptComponent, $) {

  describe("SubmitPromptComponent", function() {
    
    var id = "test_id";
    var autoSubmitLabel = "test submit label";
    var comp;
    var promptPanel;
    beforeEach(function() {
      promptPanel = jasmine.createSpyObj("promptPanel", [ "_submit", "_submitStart", "getAutoSubmitSetting" ]);
      comp = new SubmitPromptComponent();
      comp.htmlObject = id;
      comp.promptPanel = promptPanel;
      comp.paramDefn = {};
      comp.autoSubmitLabel = autoSubmitLabel;
    });

    describe("expression", function() {
      it("should run submit panel", function() {
        var isInit = true;
        comp.expression(isInit);
        expect(promptPanel._submit).toHaveBeenCalledWith({
          isInit : isInit
        });
      });
    });

    describe("expressionStart", function() {
      it("should run submitStart panel", function() {
        comp.expressionStart();
        expect(promptPanel._submitStart).toHaveBeenCalled();
      });
    });

    describe("update", function() {
      var spyElem;
      beforeEach(function() {
        spyElem = jasmine.createSpyObj("spyElem", [ "appendTo", "bind" ]);
        spyOn(comp, "expression");
        spyOn(comp, "_createElement").and.returnValue(spyElem);
        spyElem.appendTo.and.returnValue(spyElem);
      });

      it("should create auto submit elements with unchecked state", function() {
        comp.update();
        expect(comp._createElement).toHaveBeenCalledWith(
          '<label class="auto-complete-checkbox"><input type="checkbox" />' + autoSubmitLabel + '</label>');
        expect(spyElem.appendTo).toHaveBeenCalled();
        expect(spyElem.bind).toHaveBeenCalledWith('click', jasmine.any(Function));
        expect(comp.expression).not.toHaveBeenCalled();
      });

      it("should create auto submit elements with checked state", function() {
        comp.promptPanel.getAutoSubmitSetting.and.returnValue(true);
        comp.update();
        expect(comp._createElement).toHaveBeenCalledWith(
          '<label class="auto-complete-checkbox"><input type="checkbox" checked="checked" />' + autoSubmitLabel
            + '</label>');
        expect(spyElem.appendTo).toHaveBeenCalled();
        expect(spyElem.bind).toHaveBeenCalledWith('click', jasmine.any(Function));
        expect(comp.expression).toHaveBeenCalled();
      });

      it("should not create auto submit elements but force auto submit", function() {
        comp.paramDefn.autoSubmit = true;
        comp.promptPanel.forceAutoSubmit = true;
        comp.update();
        expect(spyElem.appendTo).not.toHaveBeenCalled();
        expect(spyElem.bind).not.toHaveBeenCalled();
        expect(comp.expression).toHaveBeenCalled();
      });
    });
  });
});

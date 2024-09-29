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
    });
  });
});

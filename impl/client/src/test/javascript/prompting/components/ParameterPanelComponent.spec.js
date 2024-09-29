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


define([ 'common-ui/prompting/components/ParameterPanelComponent' ], function(ParameterPanelComponent) {

  describe("ParameterPanelComponent", function() {

    describe("getClassFor", function() {
      it("should return defined result for label", function() {
        var paramComponent = jasmine.createSpy("paramComponent");
        paramComponent.promptType = 'label';
        var comp = new ParameterPanelComponent();
        var css = comp.getClassFor(paramComponent);
        expect(css).toBe('parameter-label');
      });

      it("should return undefined result for another types", function() {
        var paramComponent = jasmine.createSpy("paramComponent");
        paramComponent.promptType = 'prompt';
        var comp = new ParameterPanelComponent();
        var css = comp.getClassFor(paramComponent);
        expect(css).not.toBeDefined();
      });
    });
  });
});

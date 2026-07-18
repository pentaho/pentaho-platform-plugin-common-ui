/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



define([ 'common-ui/jquery-clean', 'common-ui/prompting/components/FlowPromptLayoutComponent' ], function($,
  FlowPromptLayoutComponent) {

  describe("FlowPromptLayoutComponent", function() {

    describe("update", function() {
      it("should add css class 'flow'", function() {
        spyOn($.fn, "addClass");

        var comp = new FlowPromptLayoutComponent();
        comp.update();

        expect($.fn.addClass).toHaveBeenCalledWith('flow');
      });
    });
  });
});
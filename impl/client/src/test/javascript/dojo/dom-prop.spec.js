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



define(["dojo/dom-prop", "dojo/dom"], function(prop, dom) {

  describe("PRD-5440", function() {

    beforeEach(function() {
      spyOn(dom, 'byId');
    });

    it("should quit setProp() function if null is passed", function() {
      prop.set(null);
      expect(dom.byId).not.toHaveBeenCalled();
    });

    it("should quit setProp() function if undefined is passed", function() {
      prop.set(undefined);
      expect(dom.byId).not.toHaveBeenCalled();
    });

  });
})

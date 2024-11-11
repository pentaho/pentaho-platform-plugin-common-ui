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


define(["dojo/dom-geometry", "dojo/dom", "dojo/_base/window"], function(geom, dom, win) {

  describe("PRD-5440", function() {
    it("should mute an error thrown when asking bounds of a node detached from main tree", function() {
      spyOn(dom, 'byId').and.callFake(function(p) {
        return p;
      });
      spyOn(win, 'body');

      var node = {
        getBoundingClientRect: function() {
          throw new Error('Thrown in IE');
        }
      };
      var bounds = geom.position(node);

      expect(bounds.x).toBe(0);
      expect(bounds.y).toBe(0);
      expect(bounds.w).toBe(0);
      expect(bounds.h).toBe(0);
    });
  });
})

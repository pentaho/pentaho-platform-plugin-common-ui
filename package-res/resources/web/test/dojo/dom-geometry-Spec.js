/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2015 Pentaho Corporation. All rights reserved.
 */

define(["dojo/dom-geometry", "dojo/dom", "dojo/_base/window"], function(geom, dom, win) {

  describe("PRD-5440", function() {
    it("should mute an error thrown when asking bounds of a node detached from main tree", function() {
      spyOn(dom, 'byId').andCallFake(function(p) {
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

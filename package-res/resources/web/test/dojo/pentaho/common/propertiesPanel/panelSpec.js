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

define(["pentaho/common/propertiesPanel/Panel", "dijit/registry"], function(Panel, registry) {

  describe("GemUI", function() {

    var testId = 'test-id';

    afterEach(function() {
      registry.remove(testId);
    });

    createStubOptions = function(value) {
      return {
        id: testId,
        gemBar: {},
        dndType: 'test-dnd-type',
        model: {
          watch: function() { /*stub*/ },
          value: value
        }
      };
    };

    it("should encode input data to prevent XSS", function() {
      var options = createStubOptions('<h1>XSS</h1>');

      var gemUi = Panel.registeredTypes["gem"];
      var encodedModelValue = new gemUi(options).model.value;

      var leftBracketIndex = encodedModelValue.indexOf('<');
      expect(leftBracketIndex).toEqual(-1);

      var rightBracketIndex = encodedModelValue.indexOf('>');
      expect(rightBracketIndex).toEqual(-1);
    });

    it("should not spoil correct input data", function() {
      var value = 'Just a label';
      var options = createStubOptions(value);

      var gemUi = Panel.registeredTypes["gem"];
      var encodedModelValue = new gemUi(options).model.value;

      expect(encodedModelValue).toEqual(value);
    });
  })
})

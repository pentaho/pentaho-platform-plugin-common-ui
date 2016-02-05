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

define(["pentaho/common/propertiesPanel/Panel", "dijit/registry", "dojo/query"], function(Panel, registry, query) {

  describe("GemUI", function() {

    var testId = 'test-id';

    var GemUI = Panel.registeredTypes["gem"];

    afterEach(function() {
      registry.remove(testId);
    });

    var createStubOptions = function(value) {
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

    it("should put text value to title", function() {
      var value = 'Just a label';
      var instance = new GemUI(createStubOptions(value));

      var gemLabelNode = query("div.gem-label", instance.domNode)[0];
      expect(gemLabelNode.title).toEqual(value);
    });

    it("should create a text node if html is passed", function() {
      var value = '<h1>XSS</h1>';
      var instance = new GemUI(createStubOptions(value));

      var gemLabelNode = query("div.gem-label", instance.domNode)[0];

      var children = gemLabelNode.childNodes;
      expect(children.length).toEqual(1);
      expect(children[0].nodeType).toEqual(3);       // nodeType = 3 -> Text node
      expect(children[0].nodeValue).toEqual(value);
    });

    it("should not create additional nodes if html is passed", function() {
      var value = '<h1>XSS</h1>';
      var instance = new GemUI(createStubOptions(value));

      var gemLabelNode = query("div.gem-label", instance.domNode)[0];

      var children = gemLabelNode.childNodes;
      for (var i = 0; i < children.length; i++) {
        expect(children[i].nodeType).not.toEqual(1); // nodeType = 1 -> Element node
      }
    });

  })
})

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

    it("should create a element node if html is passed", function() {
      var value = '<h1>XSS</h1>';
      var instance = new GemUI(createStubOptions(value));

      var gemLabelNode = query("div.gem-label", instance.domNode)[0];

      var children = gemLabelNode.childNodes;
      expect(children.length).toEqual(1);
      expect(children[0].nodeType).toEqual(1);       // nodeType = 1 -> Element node
      expect(children[0].outerHTML).toEqual(value);
    });

    it("could create additional nodes if html is passed", function() {
      var value = '<h1>XSS</h1>';
      var instance = new GemUI(createStubOptions(value));

      var gemLabelNode = query("div.gem-label", instance.domNode)[0];

      var children = gemLabelNode.childNodes;
      for (var i = 0; i < children.length; i++) {
        expect(children[i].nodeType).toEqual(1); // nodeType = 1 -> Element node
      }
    });

  })
})

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

define(["common-ui/prompting/pentaho-prompting-components"], function(promptingComponents) {

  describe("StaticAutocompleteBoxComponent.update()", function() {

    var testInteger = "123456";
    var testStringWithNumber = "123456 String";
    createCommonParameters = function(parameter, values) {
      return {
        parameter: parameter,
        param:  {values: [values]},
        name: "staticAutocompleteBoxComponent",
        type: "StaticAutocompleteBoxComponent",
        htmlObject: "",
        valuesArray: []
      };
    };

    it("should not try to parse a string", function() {
      var comp =  new promptingComponents.StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("StringParameter", {
        type: "java.lang.String",
        label: testInteger,
        value: testInteger
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe(testInteger);
      expect(comp.param.values[0].value).toBe(testInteger);
    });

    it("should not try to parse a number", function() {
      var comp = new promptingComponents.StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("IntegerParameter", {
        type: "java.lang.Integer",
        label: testInteger,
        value: testInteger,
        selected: true
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe(testInteger);
      expect(comp.param.values[0].value).toBe(testInteger);
    });

    it("should keep string if failed to to parse a number", function() {
      var comp = new promptingComponents.StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234Integer", {
        type: "java.lang.Integer",
        label: testStringWithNumber,
        value: testStringWithNumber,
        selected: true
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe(testStringWithNumber);
      expect(comp.param.values[0].value).toBe(testStringWithNumber);
    });

  });
})
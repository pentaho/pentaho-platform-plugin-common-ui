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

define(["common-ui/prompting/components/StaticAutocompleteBoxComponent", "dojo/number"], function(StaticAutocompleteBoxComponent, dojoNumber) {

  describe("StaticAutocompleteBoxComponent.update()", function() {

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
      spyOn(dojoNumber, "format");

      var comp =  new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234String", {
        type: "java.lang.String",
        label: "123456",
        value: "123456"
      }));

      comp.update();

      expect(dojoNumber.format).not.toHaveBeenCalled();
      expect(comp.param.values[0].label).toBe("123456");
      expect(comp.param.values[0].value).toBe("123456");
    });

    it("should try to parse a number", function() {
      spyOn(dojoNumber, "format").and.callFake(function(p) {
        // just make a returned value different from the parameter
        return '_' + p;
      });

      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234Integer", {
        type: "java.lang.Integer",
        label: "123456",
        value: "123456",
        selected: true
      }));

      comp.update();

      expect(dojoNumber.format).toHaveBeenCalled();
      expect(comp.param.values[0].label).not.toBe("123456");
      expect(comp.param.values[0].value).not.toBe('123456');
    });

    it("should keep string if failed to to parse a number", function() {
      spyOn(dojoNumber, 'format').and.throwError();

      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234Integer", {
        type: "java.lang.Integer",
        label: "12qw",
        value: "12qw",
        selected: true
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe("12qw");
      expect(comp.param.values[0].label).toBe("12qw");
    });

  })
})

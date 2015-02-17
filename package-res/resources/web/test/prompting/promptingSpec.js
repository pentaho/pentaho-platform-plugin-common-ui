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

  describe("StaticAutocompleteBoxComponent", function() {

    it("dojo should not try to parse a string", function() {
      var comp = promptingComponents.window.StaticAutocompleteBoxComponent;

      comp.parameter = "1234String";
      comp.param = {type: "java.lang.String", label: "123456", value: "123456"};
      comp.update();

      expect(comp.param.label("123456")).toBe("123456");
      expect(comp.param.value("123456")).toBe("123456");
    });

    it("dojo should try to parse a number", function() {
      var comp = promptingComponents.window.StaticAutocompleteBoxComponent;

      comp.parameter = "1234Integer";
      comp.param = {type: "java.lang.Integer", label: "123456", value: "123456"};
      comp.update();

      expect(comp.param.label("123456")).not.toBe("123456");
      expect(comp.param.value("123456")).not.toBe("123456");
    });

    it("dojo should keep string if failed to to parse a number", function() {
      var comp = promptingComponents.window.StaticAutocompleteBoxComponent;

      comp.parameter = "1234Integer";
      comp.param = {type: "java.lang.Integer", label: "12qw", value: "12qw"};
      comp.update();

      expect(comp.param.label("12qw")).toBe("12qw");
      expect(comp.param.value("12qw")).toBe("12qw");
    });

  })
})
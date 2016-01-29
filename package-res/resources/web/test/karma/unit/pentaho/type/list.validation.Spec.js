/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
  "pentaho/type/Context",
  "pentaho/type/list",
  "pentaho/type/value",
  "pentaho/type/number",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, listFactory, valueFactory, numberFactory, error, bundle) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context();
  var Value = context.get(valueFactory);
  var List = context.get(listFactory);
  var Number = context.get(numberFactory);

  describe("pentaho/type/list - Validation -", function() {
    var NumberList = List.extend({
      meta: {of: Number}
    });

    var list;

    beforeEach(function() {
      list = new NumberList([1, 2, 3]);
    });

    describe("this.validate()", function() {
      it("should return null", function() {
        expect(list.validate()).toBe(null);
      });

      it("should call validate of its members", function() {
        var v0 = list.at(0);
        spyOn(v0, "validate");
        var v1 = list.at(1);
        spyOn(v1, "validate");
        var v2 = list.at(2);
        spyOn(v2, "validate");

        list.validate();

        expect(v0.validate).toHaveBeenCalled();
        expect(v1.validate).toHaveBeenCalled();
        expect(v2.validate).toHaveBeenCalled();
      });
    });// end #validate

    describe("List.validate(value)", function() {
      it("should return errors when given an invalid `Value`", function() {
        expect(List.meta.validate(new Value())).not.toBe(null);
      });

      it("should return `null` when given a subclass", function() {
        expect(List.meta.validate(new NumberList())).toBe(null);
      });
    });// end #validate
  });
});

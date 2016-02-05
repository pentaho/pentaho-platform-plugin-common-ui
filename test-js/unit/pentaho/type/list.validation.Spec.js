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

  describe("pentaho.type.List.Meta -", function() {
    var NumberList = List.extend({
      meta: {of: Number}
    });

    describe("#validate(value) -", function() {
      it("should call validateInstance(.) of the list element type with each of its members", function() {
        spyOn(Number.meta, "validateInstance");

        var list = new NumberList([1, 2, 3]);

        list.meta.validate(list);

        expect(Number.meta.validateInstance).toHaveBeenCalledWith(list.at(0));
        expect(Number.meta.validateInstance).toHaveBeenCalledWith(list.at(1));
        expect(Number.meta.validateInstance).toHaveBeenCalledWith(list.at(2));
      });

      it("should return errors when given an invalid `Value`", function() {
        expect(List.meta.validate(new Value())).not.toBe(null);
      });

      it("should return `null` when given a valid instance of a subtype", function() {
        expect(List.meta.validate(new List())).toBe(null);
        expect(List.meta.validate(new NumberList())).toBe(null);
      });
    });// end #validate(value)
  });
});

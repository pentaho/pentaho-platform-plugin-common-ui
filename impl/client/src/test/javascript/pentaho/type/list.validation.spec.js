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
  "pentaho/type/number"
], function(Context, listFactory, numberFactory) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  describe("pentaho.type.List", function() {

    var context = new Context();
    var List = context.get(listFactory);

    describe("#validate() -", function() {
      it("should call _validate(.) of the list element type with each of its members", function() {
        var PentahoNumber = context.get(numberFactory);
        var NumberList = List.extend({
          $type: {of: PentahoNumber}
        });

        spyOn(PentahoNumber.type, "_validate");

        var list = new NumberList([1, 2, 3]);

        list.validate();

        expect(PentahoNumber.type._validate).toHaveBeenCalledWith(list.at(0));
        expect(PentahoNumber.type._validate).toHaveBeenCalledWith(list.at(1));
        expect(PentahoNumber.type._validate).toHaveBeenCalledWith(list.at(2));
      });

      it("should call _validate(.) of each of the list elements' type " +
         "when the list element type is of a base type", function() {
        var PentahoNumber = context.get(numberFactory);
        var PentahoInteger = PentahoNumber.extend();

        var NumberList = List.extend({
          $type: {of: PentahoNumber}
        });

        spyOn(PentahoInteger.type, "_validate");

        var list = new NumberList([new PentahoInteger(1), new PentahoInteger(2), new PentahoInteger(3)]);

        list.validate();

        expect(PentahoInteger.type._validate).toHaveBeenCalledWith(list.at(0));
        expect(PentahoInteger.type._validate).toHaveBeenCalledWith(list.at(1));
        expect(PentahoInteger.type._validate).toHaveBeenCalledWith(list.at(2));
      });
    });
  });
});

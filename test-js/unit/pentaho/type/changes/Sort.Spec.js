/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/type/number",
  "pentaho/type/changes/Sort",
  "pentaho/util/fun"
], function(Context, listFactory, numberFactory, Sort, fun) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context(),
    List = context.get(listFactory),
    PentahoNumber = context.get(numberFactory);

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  describe("pentaho.type.changes.Sort -", function() {
    it("should be defined", function () {
      expect(typeof Sort).toBeDefined();
    });

    describe("instance -", function() {

      describe("#type -", function() {
        it("should return a string with the value `sort`", function() {
          var change = new Sort(function() {});
          expect(change.type).toBe("sort");
        });
      });

      describe("#_type -", function() {
        it("should sort the list values", function() {
          var list = new NumberList([2, 1]);
          var change = new Sort(fun.compare);

          change._apply(list);

          expect(list.count).toBe(2);
          expect(list._elems[0].value).toBe(1);
          expect(list._elems[1].value).toBe(2);
        });
      });

    });
  });
});

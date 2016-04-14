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
  "pentaho/type/changes/Add"
], function(Context, listFactory, numberFactory, Add) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context(),
      List = context.get(listFactory),
      PentahoNumber = context.get(numberFactory);

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  describe("pentaho.type.changes.Add -", function() {
    it("should be defined", function () {
      expect(typeof Add).toBeDefined();
    });

    describe("instance -", function() {
      describe("#type -", function() {
        it("should return a string with the value `add`", function() {
          var change = new Add({}, 0, "key");
          expect(change.type).toBe("add");
        });
      });

      describe("#_apply -", function() {
        it("should add a new element", function() {
          var list = new NumberList([]);
          var elem = list._cast(0);
          var change = new Add(elem, elem.key, 0);

          change._apply(list);

          expect(list.count).toBe(1);
          expect(list.at(0)).toBe(elem);
        });
      });
    });
  });
});

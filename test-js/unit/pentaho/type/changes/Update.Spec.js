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
/*
define([
  "pentaho/type/Context",
  "pentaho/type/complex",
  "pentaho/type/number",
  "pentaho/type/changes/Update"
], function(Context, complexFactory, numberFactory, Update) {
  "use strict";

  /!* global describe:false, it:false, expect:false, beforeEach:false *!/

  var context = new Context(),
    Complex = context.get(complexFactory),
    Derived = Complex.extend({
      type: {props: [{name: "x", type: "string"}]}
    });

  describe("pentaho.type.changes.Update -", function() {
    it("should be defined", function () {
      expect(typeof Update).toBeDefined();
    });

    describe("instance -", function() {
      describe("#type -", function() {
        it("should return a string with the value `update`", function() {
          var change = new Update({}, {});
          expect(change.type).toBe("update");
        });

      });

      describe("#apply -", function() {
        it("should add a new element", function() {
          var derived = new Derived({x: "0"});
          var other = new Derived({x: "2"});

          var change = new Update(derived.get("x"), other.get("x"));

          expect(derived.getv("x")).toBe("0");

          change.apply(/!*list*!/);

          expect(derived.getv("x")).toBe("2");
        });

      });

    });
  });
});*/

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
  "pentaho/type/changes/Update",
  "pentaho/util/fun"
], function(Context, listFactory, numberFactory, Update, fun) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context(),
    List = context.get(listFactory),
    PentahoNumber = context.get(numberFactory);

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  describe("pentaho.type.changes.Update -", function() {
    it("should be defined", function () {
      expect(typeof Update).toBeDefined();
    });

    describe("instance -", function() {

      describe("#type -", function() {
        it("should return a string with the value `update`", function() {
          var change = new Update({}, {});
          expect(change.type).toBe("update");
        });
      });

      describe("#_apply -", function() {
        it("should update a list element", function() {
          var list = new NumberList([2, 1]);
          var elem = list.at(0);
          var other = list.at(1);

          spyOn(elem, "configure");
          var change = new Update(elem, 0, other);

          change._apply(list);

          expect(list.count).toBe(2);
          expect(elem.configure).toHaveBeenCalledWith(other);
        });
      });

    });
  });
});

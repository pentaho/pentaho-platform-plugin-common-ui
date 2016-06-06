/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/ReferenceList",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(ReferenceList, Context, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.ReferenceList", function() {
    it("is a function", function() {
      expect(typeof ReferenceList).toBe("function");
    });

    describe("to(array)", function() {
      it("returns `array` with the new prototype", function() {
        var a = [];
        var refs = ReferenceList.to(a);
        expect(refs).toBe(a);
        expect(refs instanceof ReferenceList).toBe(true);
      });
    });

    describe("#add(container, propType)", function() {
      it("should add one reference", function() {
        var refs = ReferenceList.to([]);
        var container = {};
        var propType  = {};

        refs.add(container, propType);

        expect(refs.length).toBe(1);
        expect(refs[0].container).toBe(container);
        expect(refs[0].property).toBe(propType);
      });

      it("should append reference", function() {
        var refs = ReferenceList.to([]);
        var container = {};
        var propType  = {};

        refs.add({}, {});
        refs.add(container, propType);

        expect(refs.length).toBe(2);
        expect(refs[1].container).toBe(container);
        expect(refs[1].property).toBe(propType);
      });

      it("should add one reference with null propType, when unspecified", function() {
        var refs = ReferenceList.to([]);
        var container = {};

        refs.add(container);

        expect(refs.length).toBe(1);
        expect(refs[0].container).toBe(container);
        expect(refs[0].property).toBe(null);
      });
    });

    describe("#remove(container, propType)", function() {
      it("should work when empty", function() {
        var refs = ReferenceList.to([]);

        expect(refs.length).toBe(0);

        refs.remove({}, {});

        expect(refs.length).toBe(0);
      });

      it("should not remove one reference of same container and of different property", function() {
        var refs = ReferenceList.to([]);
        var container = {};
        var propType  = {};

        refs.add({}, {});
        refs.add(container, propType);

        expect(refs.length).toBe(2);

        refs.remove(container, {});

        expect(refs.length).toBe(2);
      });

      it("should not remove one reference of different container and same property", function() {
        var refs = ReferenceList.to([]);
        var container = {};
        var propType  = {};

        refs.add({}, {});
        refs.add(container, propType);

        expect(refs.length).toBe(2);

        refs.remove({}, propType);

        expect(refs.length).toBe(2);
      });

      it("should remove one reference of same container and null property when given propType null", function() {
        var refs = ReferenceList.to([]);
        var container = {};

        refs.add({}, {});
        refs.add(container, null);

        expect(refs.length).toBe(2);

        refs.remove(container, null);

        expect(refs.length).toBe(1);
      });

      it("should remove one reference of same container and null property when given propType undefined", function() {
        var refs = ReferenceList.to([]);
        var container = {};

        refs.add({}, {});
        refs.add(container, null);

        expect(refs.length).toBe(2);

        refs.remove(container, undefined);

        expect(refs.length).toBe(1);
      });

      it("should remove one reference of same container and null property when not given propType", function() {
        var refs = ReferenceList.to([]);
        var container = {};

        refs.add({}, {});
        refs.add(container, null);

        expect(refs.length).toBe(2);

        refs.remove(container);

        expect(refs.length).toBe(1);
      });

      it("should remove one reference of same container and property when it is the last one", function() {
        var refs = ReferenceList.to([]);
        var container = {};
        var propType  = {};

        refs.add({}, {});
        refs.add(container, propType);

        expect(refs.length).toBe(2);

        refs.remove(container, propType);

        expect(refs.length).toBe(1);

        expect(refs[0].container).not.toBe(container);
        expect(refs[0].property).not.toBe(propType);
      });

      it("should remove one reference of same container and property when it is the middle one", function() {
        var refs = ReferenceList.to([]);
        var container = {};
        var propType  = {};

        refs.add({}, {});
        refs.add(container, propType);
        refs.add({}, {});

        expect(refs.length).toBe(3);

        refs.remove(container, propType);

        expect(refs.length).toBe(2);

        expect(refs[0].container).not.toBe(container);
        expect(refs[0].property).not.toBe(propType);

        expect(refs[1].container).not.toBe(container);
        expect(refs[1].property).not.toBe(propType);
      });
    });
  }); // pentaho.type.ReferenceList
});
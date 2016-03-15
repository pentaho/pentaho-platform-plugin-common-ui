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
  "pentaho/lang/Base",
  "pentaho/visual/base/mixins/mixinDataFilter",
  "pentaho/util/object",
  "tests/pentaho/util/errorMatch"
], function(Base, mixinDataFilter, O, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.visual.base.mixins.mixinDataFilter -", function() {
    var ClassWithMixIn;
    beforeEach(function() {
      ClassWithMixIn = Base.extend("my.mixedin.TestClass").implement(mixinDataFilter);
    });

    it("should have functions and properties mixed-in", function() {
      expect(ClassWithMixIn.prototype._initFilter).toBeDefined();
      expect(typeof ClassWithMixIn.prototype._initFilter).toBe("function");

      var desc = O.getPropertyDescriptor(ClassWithMixIn.prototype, "dataFilter");

      expect(desc).toBeDefined();

      expect(desc.get).toBeDefined();
      expect(typeof desc.get).toBe("function");

      expect(desc.set).toBeDefined();
      expect(typeof desc.set).toBe("function");
    });

    describe("instances -", function() {
      var instanceWithMixIn;

      beforeEach(function() {
        instanceWithMixIn = new ClassWithMixIn();
      });

      it("should have functions and properties mixed-in", function() {
        expect(instanceWithMixIn._initFilter).toBeDefined();
        expect(typeof instanceWithMixIn._initFilter).toBe("function");

        var desc = O.getPropertyDescriptor(instanceWithMixIn, "dataFilter");

        expect(desc).toBeDefined();

        expect(desc.get).toBeDefined();
        expect(typeof desc.get).toBe("function");

        expect(desc.set).toBeDefined();
        expect(typeof desc.set).toBe("function");
      });

      describe("_initFilter -", function() {
        it("should throw if empty dataFilter parameter", function() {
          expect(function() {
            instanceWithMixIn._initFilter();
          }).toThrow(errorMatch.argRequired("dataFilter"));

          expect(function() {
            instanceWithMixIn._initFilter(null);
          }).toThrow(errorMatch.argRequired("dataFilter"));

          expect(function() {
            instanceWithMixIn._initFilter(undefined);
          }).toThrow(errorMatch.argRequired("dataFilter"));
        });
      });

      describe("_initFilter - immutable -", function() {
        var filter = {};

        beforeEach(function() {
          instanceWithMixIn._initFilter(filter, false);
        });

        it("dataFilter property should be the same than received in the constructor", function() {
          expect(instanceWithMixIn.dataFilter).toBe(filter);
        });

        it("dataFilter property should be immutable", function() {
          expect(function() {
            instanceWithMixIn.dataFilter = "other";
          }).toThrowError(TypeError);
        });
      });

      describe("_initFilter - mutable -", function() {
        var filter = {};

        beforeEach(function() {
          instanceWithMixIn._initFilter(filter, true);
        });

        it("dataFilter property should be the same than received in the constructor", function() {
          expect(instanceWithMixIn.dataFilter).toBe(filter);
        });

        it("dataFilter property should not be immutable", function() {
          var newFilter = "other";

          expect(function() {
            instanceWithMixIn.dataFilter = newFilter;
          }).not.toThrow();

          expect(instanceWithMixIn.dataFilter).toBe(newFilter);
        });
      });
    });

  }); // #pentaho.visual.base.mixins.mixinDataFilter
});

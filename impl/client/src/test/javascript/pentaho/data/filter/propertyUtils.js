/*!
 * Copyright 2017 Hitachi Vantara.  All rights reserved.
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
define(function() {

  return {
    behavesLikeProperty: behavesLikeProperty
  };

  function behavesLikeProperty(getConstructor, params) {
    var filterName = params.kind;
    var valueType = params.valueType;
    var rawValue = params.rawValue;
    var alias = params.alias;

    describe("Property like behaviour for " + filterName, function() {

      describe("new ({property, value})", function() {

        it("should be possible to create an instance " +
          "by specifying the properties by #name and value specification", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({property: "foo", value: {_: valueType, v: rawValue}});
          expect(filter instanceof Constructor).toBe(true);
        });

        it("should be possible to create an instance " +
          "by specifying the properties by #nameAlias and value specification", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({p: "foo", v: {_: valueType, v: rawValue}});
          expect(filter instanceof Constructor).toBe(true);
        });

        it("should be possible to create an instance by specifying the properties by #nameAlias and value", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({p: "foo", v: rawValue});
          expect(filter instanceof Constructor).toBe(true);
        });
      });

      describe("#kind", function() {

        it("should return '" + filterName + "'", function() {

          var Constructor = getConstructor();
          var filter = new Constructor();
          expect(filter.kind).toBe(filterName);
        });
      });

      describe("#property", function() {

        it("should return the property name specified at construction", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({property: "foo"});
          expect(filter.property).toBe("foo");
        });

        it("should return the property name specified at construction via #nameAlias", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({p: "foo"});
          expect(filter.property).toBe("foo");
        });
      }); // #property

      describe("#toSpec", function() {
        var filter;

        beforeEach(function() {
          var Constructor = getConstructor();
          filter = new Constructor({property: "foo", value: {_: valueType, v: rawValue}});
        });

        describe("when invoked without keyword arguments", function() {
          var filterSpec;

          beforeEach(function() {
            filterSpec = filter.toSpec();
          });

          it("should omit the type", function() {
            expect(filterSpec._).toBeUndefined();
          });

          it("should specify the properties by their #nameAlias instead of their #name", function() {

            expect(filterSpec.p).toBe("foo");
            expect(filterSpec.v).toBe(rawValue);
            expect(filterSpec.property).toBeUndefined();
            expect(filterSpec.value).toBeUndefined();
          });

        });

        describe("when invoked with the keyword argument `noAlias` set to `true`", function() {

          it("should specify the properties by their #name", function() {

            var filterSpec = filter.toSpec({
              noAlias: true
            });

            expect(filterSpec._).toBeUndefined();
            expect(filterSpec.p).toBeUndefined();
            expect(filterSpec.v).toBeUndefined();
            expect(filterSpec.property).toBe("foo");
            expect(filterSpec.value).toBe(rawValue);
          });
        });

        describe("when invoked with the keyword argument `forceType` set to `true`", function() {

          it("should specify the type by the #alias", function() {

            var filterSpec = filter.toSpec({
              forceType: true
            });

            expect(filterSpec._).toBe(alias);
          });

          it("should specify the type by the #id when the `noAlias` option is additionally specified", function() {

            var filterSpec = filter.toSpec({
              forceType: true,
              noAlias: true
            });

            expect(filterSpec._).toBe("pentaho/data/filter/" + filterName);
          });
        });
      }); // #toSpec

      describe("#value", function() {

        it("should return the value specified at construction", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({value: {_: valueType, v: rawValue}});
          expect(filter.value).toBe(rawValue);
        });

        it("should return the value specified at construction via #nameAlias", function() {

          var Constructor = getConstructor();
          var filter = new Constructor({v: {_: valueType, v: rawValue}});
          expect(filter.value).toBe(rawValue);
        });
      }); // #value
    });
  }
});

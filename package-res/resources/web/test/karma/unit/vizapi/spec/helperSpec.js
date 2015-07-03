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
define(["pentaho/visual/spec/helper"], function(singletonSpecHelper) {
  var standardSpec = {
      action: 1,
      type:   1,
      state:  1,
      data:   1,
      width:  1,
      height: 1,
      highlights: 1,
      direct: 1
    };

  describe("Visual Spec Helper -", function() {
    describe("#isStandardProperty(name) -", function() {
      it("should be a function", function() {
        expect(typeof singletonSpecHelper.isStandardProperty).toBe("function");
      });

      it("should return `true` for standard property names", function() {
        for(var p in standardSpec) {
          if(standardSpec.hasOwnProperty(p)) {
            expect(singletonSpecHelper.isStandardProperty(p)).toBe(true);
          }
        }
      });

      it("should return `false` for non-standard property names", function() {
        expect(singletonSpecHelper.isStandardProperty("foo")).toBe(false);
        expect(singletonSpecHelper.isStandardProperty("bar")).toBe(false);
        expect(singletonSpecHelper.isStandardProperty("How are you?")).toBe(false);
      });
    });

    describe("#create(type)", function() {
      it("should return a spec object having as `type` the id of the given visual type object", function() {
        var type = {
          id: "foo"
        };

        var spec = singletonSpecHelper.create(type);
        expect(spec instanceof Object).toBe(true);
        expect(spec.type).toBe(type.id);
      });

      it("should return a spec object in which every standard IVisualSpec property is present, albeit possibly `undefined`", function() {
        var type = {
          id: "foo"
        };

        var spec = singletonSpecHelper.create(type);
        for(var p in standardSpec) {
          if(p !== "action" && standardSpec.hasOwnProperty(p)) {
            expect(spec.hasOwnProperty(p)).toBe(true);
          }
        }
      });

      it("should return a spec object that contains every property of type.args, cloned", function() {
        var type = {
          id: "foo",
          args: {
            foo: 1,
            bar: {dudu: 2},
            gugu: ["dada"]
          }
        };

        var spec = singletonSpecHelper.create(type);
        expect(spec.foo).toBe(1);

        expect(spec.bar).not.toBe(type.args.bar);
        expect(spec.bar).toEqual(type.args.bar);

        expect(spec.gugu).not.toBe(type.args.gugu);
        expect(spec.gugu).toEqual(type.args.gugu);
      });

      it("should ignore standard properties in type.args", function() {
        var type = {
          id: "foo",
          args: {
            type:  "bar",
            state: {}
          }
        };

        var spec = singletonSpecHelper.create(type);
        expect(spec.type).toBe("foo");
        expect(spec.state).toBe(undefined);
      });
    });

    describe("#create(type, props)", function() {
      it("should return a spec object with the specified `props` copied over", function() {
        var type = {
          id: "foo"
        };

        var props = {
          foo:  1,
          bar:  {dudu: 2},
          gugu: ["dada"]
        };

        var spec = singletonSpecHelper.create(type, props);

        expect(spec.foo).toBe(props.foo);
        expect(spec.bar).toBe(props.bar);
        expect(spec.gugu).toBe(props.gugu);
      });

      it("should ignore standard properties in `props`", function() {
        var type = {
          id: "foo"
        };

        var props = {
          type:  "bar",
          state: {}
        };

        var spec = singletonSpecHelper.create(type, props);

        expect(spec.type).toBe("foo");
        expect(spec.state).toBe(undefined);
      });
    });

    describe("#setProperties(spec, props)", function() {
      it("should return undefined", function() {
        var spec = {
          type: "foo"
        };

        var props = {
          foo:  1,
          bar:  {dudu: 2},
          gugu: ["dada"]
        };

        var result = singletonSpecHelper.setProperties(spec, props);

        expect(result).toBe(undefined);
      });

      it("should return a spec object with the specified `props` copied over", function() {
        var spec = {
          type: "foo"
        };

        var props = {
          foo:  1,
          bar:  {dudu: 2},
          gugu: ["dada"]
        };

        singletonSpecHelper.setProperties(spec, props);

        expect(spec.foo).toBe(props.foo);
        expect(spec.bar).toBe(props.bar);
        expect(spec.gugu).toBe(props.gugu);
      });

      it("should ignore standard properties in `props`", function() {
        var spec = {
          type: "foo"
        };

        var props = {
          foo:  1,
          bar:  {dudu: 2},
          gugu: ["dada"]
        };

        singletonSpecHelper.setProperties(spec, props);

        expect(spec.type).toBe("foo");
        expect(spec.state).toBe(undefined);
      });

      it("should ignore undefined properties of `props`", function() {
        var spec = {
          type: "foo",
          foo:  1
        };

        var props = {
          foo:  undefined
        };

        singletonSpecHelper.setProperties(spec, props);

        expect(spec.foo).toBe(1);
      });

      it("should ignore non-own properties of `props`", function() {
        var spec = {
          type: "foo",
          foo:  1
        };

        var propsBase = {
          foo:  2
        };

        var props = Object.create(propsBase);
        props.bar = "bar";

        singletonSpecHelper.setProperties(spec, props);

        expect(spec.foo).toBe(1);
        expect(spec.bar).toBe("bar");
      });

      it("should overwrite existing spec properties with those of `props`", function() {
        var spec = {
          type: "foo",
          foo:  1
        };

        var props = {
          foo:  2
        };

        singletonSpecHelper.setProperties(spec, props);

        expect(spec.foo).toBe(2);
      });

      it("should tolerate a nully `props`", function() {
        var spec = {
          type: "foo",
          foo:  1
        };

        expect(function() {
          singletonSpecHelper.setProperties(spec, null);
          singletonSpecHelper.setProperties(spec, undefined);
          singletonSpecHelper.setProperties(spec);
        });
      });
    });

    describe("#setProperties(spec, props, defaultsOnly=false)", function() {
      it("should overwrite existing spec properties with those of `props`", function() {
        var spec = {
          type: "foo",
          foo:  1
        };

        var props = {
          foo:  2
        };

        singletonSpecHelper.setProperties(spec, props, false);

        expect(spec.foo).toBe(2);
      });
    });

    describe("#setProperties(spec, props, defaultsOnly=true)", function() {
      it("should not overwrite defined spec properties with those of `props`", function() {
        var spec = {
          type: "foo",
          foo:  1
        };

        var props = {
          foo:  2
        };

        singletonSpecHelper.setProperties(spec, props, true);

        expect(spec.foo).toBe(1);
      });

      it("should overwrite undefined spec properties with those of `props`", function() {
        var spec = {
          type: "foo",
          foo:  undefined
        };

        var props = {
          foo: 2,
          bar: 3
        };

        singletonSpecHelper.setProperties(spec, props, true);

        expect(spec.foo).toBe(2);
        expect(spec.bar).toBe(3);
      });
    });

    describe("#clone(spec)", function() {
      it("should return an object having all of the properties, even inherited, of the source spec", function() {
        var specBase = {
          type: "ccc_bar",
          foo:  1
        };

        var spec = Object.create(specBase);
        spec.bar = 2;

        var cloneSpec = singletonSpecHelper.clone(spec);

        expect(cloneSpec instanceof Object).toBe(true);

        for(var p in spec) {
          expect(cloneSpec.hasOwnProperty(p)).toBe(true);
        }
      });

      it("should shallow-copy plain object and array values", function() {
        var spec = {
          type: "ccc_bar",
          foo:  {bar: 1},
          bar:  ["gugu"]
        };

        var cloneSpec = singletonSpecHelper.clone(spec);

        expect(cloneSpec.type).toBe(spec.type);

        expect(cloneSpec.foo).not.toBe(spec.foo);
        expect(cloneSpec.foo).toEqual(spec.foo);

        expect(cloneSpec.bar).not.toBe(spec.bar);
        expect(cloneSpec.bar).toEqual(spec.bar);
      });
    });
  });
});

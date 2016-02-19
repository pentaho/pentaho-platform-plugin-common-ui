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
  "pentaho/util/object"
], function(O) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, Object:true*/

  describe("pentaho.util.object -", function() {
    it("is an object containing the advertised functions", function() {
      expect(typeof O).toBe("object");
      [
        "delete",
        "hasOwn", "getOwn",
        "setConst",
        "eachOwn",
        "assignOwn", "assignOwnDefined",
        "cloneShallow", "getPropertyDescriptor",
        "make", "setPrototypeOf", "applyClass"
      ].forEach(function(f) {
        expect(f in O).toBe(true);
      });
    });

    function getFoo() {
      var Foo = function() {
        this.bar = "bar";
      };
      Foo.prototype = new function() {
      };
      Foo.prototype.spam = "spam";
      Object.defineProperty(Foo.prototype, "eggs", {enumerable: false, value: "eggs"});

      var foo = new Foo();
      foo.parrot = "parrot";
      Object.defineProperty(foo, "gumby", {value: "gumby"});
      Object.defineProperty(foo, "cheese", {enumerable: false, value: "cheese"});
      Object.defineProperty(foo, "minister", {
        enumerable: false,
        value: "minister",
        configurable: true
      });
      Object.defineProperty(foo, "lumberjack", {
        enumerable: true,
        get: function() {
          return "lumberjack";
        }
      });
      Object.defineProperty(foo, "inspector", {
        enumerable: false,
        set: function() {
        }
      });
      return foo;
    }

    describe("`delete` -", function() {

      function canDelete(foo, prop) {
        expect(prop in foo).toBe(true);
        O["delete"](foo, prop);
        expect(prop in foo).toBe(false);
      }

      function cannotDelete(foo, prop) {
        expect(prop in foo).toBe(true);
        O["delete"](foo, prop);
        expect(prop in foo).toBe(true);
      }

      describe("removes properties", function() {
        var foo;
        beforeEach(function() {
          foo = getFoo();
        });

        it("should remove an enumerable own property", function() {
          canDelete(foo, "bar");

          canDelete({
            bar: "bar"
          }, "bar");

        });

        it("should remove non-enumerable own properties", function() {
          canDelete(foo, "minister");
        });

        it("should not remove inherited properties", function() {
          cannotDelete(foo, "spam");
          cannotDelete(foo, "eggs");
        });

        it("should throw when attempting to remove a constant property", function() {
          expect(function() {
            O["delete"](foo, "gumby");
          }).toThrowError(TypeError);
        });

      });

      describe("returns values", function() {
        it("should return the value of the deleted property", function() {
          expect(O["delete"]({bar: "spam"}, "bar", "foo")).toBe("spam");
        });

        it("should return the default value if the property does not exist", function() {
          expect(O["delete"]({spam: "eggs"}, "bar", "foo")).toBe("foo");
        });
      });

    }); // delete

    describe("`hasOwn` -", function() {
      var foo;

      beforeEach(function() {
        foo = getFoo();
      });

      it("returns `true` on own properties, regardless if they are enumerable", function() {
        expect(O.hasOwn(foo, "bar")).toBe(true);
        expect(O.hasOwn(foo, "parrot")).toBe(true);
        expect(O.hasOwn(foo, "gumby")).toBe(true);
        expect(O.hasOwn(foo, "cheese")).toBe(true);
        expect(O.hasOwn(foo, "minister")).toBe(true);
      });

      it("returns `false` on inherited properties", function() {
        expect(O.hasOwn(foo, "spam")).toBe(false);
        expect(O.hasOwn(foo, "eggs")).toBe(false);
      });

      it("returns `false` on non-existent properties", function() {
        expect(O.hasOwn(foo, "twit")).toBe(false);
      });

    }); // hasOwn

    describe("`getOwn` -", function() {
      var foo;

      beforeEach(function() {
        foo = getFoo();
      });

      it("returns an own property, regardless if it is enumerable", function() {
        expect(O.getOwn(foo, "bar", "ni!")).toBe("bar");
        expect(O.getOwn(foo, "parrot", "ni!")).toBe("parrot");
        expect(O.getOwn(foo, "gumby", "ni!")).toBe("gumby");
        expect(O.getOwn(foo, "cheese", "ni!")).toBe("cheese");
        expect(O.getOwn(foo, "minister", "ni!")).toBe("minister");
      });

      it("returns the default value on inherited properties", function() {
        expect(O.getOwn(foo, "spam", "ni!")).toBe("ni!");
        expect(O.getOwn(foo, "spam")).toBeUndefined();
        expect(O.getOwn(foo, "eggs", "ni!")).toBe("ni!");
        expect(O.getOwn(foo, "eggs")).toBeUndefined();
      });

      it("returns the default value  on non-existent properties", function() {
        expect(O.getOwn(foo, "twit", "ni!")).toBe("ni!");
        expect(O.getOwn(foo, "twit")).toBeUndefined();
      });

    }); // getOwn

    describe("`setConst` -", function() {
      var foo;
      beforeEach(function() {
        foo = {};
        O.setConst(foo, "bar", "bar");
      });

      it("a property created with `setConst` should be readable", function() {
        expect(foo.bar).toBe("bar");
      });
      it("attempting to write over a property created with `setConst` throws a TypeError", function() {
        expect(function() {
          foo.bar = "twit";
        }).toThrowError(TypeError);
      });
      it("attempting to delete a property created with `setConst` throws a TypeError", function() {
        expect(function() {
          delete foo.bar;
        }).toThrowError(TypeError);
      });
    }); //setConst

    describe("`eachOwn` -", function() {
      var foo;

      beforeEach(function() {
        foo = getFoo();
      });

      it("iterates over all direct enumerable properties of an object", function() {
        foo.xpto = "xpto";
        Object.defineProperty(foo, "goose", {enumerable: true})
        var ownProps = ["bar", "parrot", "lumberjack", "xpto", "goose"];
        var count = 0;
        O.eachOwn(foo, function(value, key) {
          expect(ownProps.indexOf(key) >= -1).toBe(true);
          count++;
        });
        expect(count).toBe(ownProps.length);
      });


      it("iterates over all direct enumerable properties of an object (POJO variant)", function() {
        foo = {
          "bar": 0,
          "parrot": 1,
          "xpto": 2
        };
        var ownProps = ["bar", "parrot", "xpto"];
        var count = 0;
        O.eachOwn(foo, function(value, key) {
          expect(ownProps.indexOf(key) >= -1).toBe(true);
          count++;
        });
        expect(count).toBe(ownProps.length);
      });

      it("returns `true` after iterating over all own properties of an object", function() {
        var result = O.eachOwn(foo, function(value, key) {
        });
        expect(result).toBe(true);
      });

      it("breaks out of the loop if the iteratee returns `false`", function() {
        var count = 0;
        O.eachOwn(foo, function(value, key) {
          count++;
          return false;
        });
        expect(count).toBe(1);
      });

      it("returns `false` if the iteratee returns `false`", function() {
        var result = O.eachOwn(foo, function(value, key) {
          return false;
        });
        expect(result).toBe(false);
      });

    }); // eachOwn

    describe("`assignOwn` -", function() {
      var foo;

      beforeEach(function() {
        foo = getFoo();
      });

      it("returns the target object", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"]
        };
        var target = {};
        var result = O.assignOwn(target, source);
        expect(result).toBe(target);
      });

      it("assigns a property from one object to another", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"]
        };
        var target = O.assignOwn({}, source);
        expect(target.ingredients[2]).toBe("cheese");
        source.ingredients[2] = "lard";
        expect(target.ingredients[2]).toBe("lard");
      });

      it("assigns all direct enumerable properties of an object to another", function() {
        foo.xpto = "xpto";
        Object.defineProperty(foo, "goose", {enumerable: true}); //value: undefined
        var ownProps = ["bar", "parrot", "lumberjack", "xpto", "goose"];
        var target = O.assignOwn({}, foo);
        expect(Object.keys(target).length).toBe(ownProps.length);
        expect(target.spam).toBeUndefined(); //inherited property
      });

      it("assigns all direct enumerable properties of an object to another (POJO variant)", function() {
        foo = {
          "bar": 0,
          "parrot": 1,
          "xpto": 2
        };
        var ownProps = ["bar", "parrot", "xpto"];
        var target = O.assignOwn({}, foo);
        expect(Object.keys(target).length).toBe(ownProps.length);
      });

    }); // assignOwn

    describe("`assignOwnDefined` -", function() {
      var foo;

      beforeEach(function() {
        foo = getFoo();
      });

      it("returns the target object", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"]
        };
        var target = {};
        var result = O.assignOwnDefined(target, source);
        expect(result).toBe(target);
      });

      it("assigns a defined property from one object to another", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"],
          recipe: undefined
        };
        var target = O.assignOwnDefined({}, source);
        expect(target.ingredients[2]).toBe("cheese");
        source.ingredients[2] = "lard";
        source.recipe = "mix vigorously";
        expect(target.ingredients[2]).toBe("lard");
        expect(target.recipe).toBeUndefined();
      });

      it("assigns all defined direct enumerable properties of an object to another", function() {
        foo.xpto = "xpto";
        Object.defineProperty(foo, "goose", {enumerable: true}); //value: undefined
        var ownProps = ["bar", "parrot", "lumberjack", "xpto"];
        var target = O.assignOwnDefined({}, foo);
        expect(Object.keys(target).length).toBe(ownProps.length);
        expect(target.spam).toBeUndefined(); //inherited property
      });

      it("assigns all defined direct enumerable properties of an object to another (POJO variant)", function() {
        foo = {
          "bar": 0,
          "parrot": 1,
          "xpto": undefined
        };
        var ownProps = ["bar", "parrot"];
        var target = O.assignOwnDefined({}, foo);
        expect(Object.keys(target).length).toBe(ownProps.length);
      });

    }); // assignOwnDefined

    describe("`cloneShallow` -", function() {

      it("should return a different object for plain objects or arrays", function() {
        [
          {}, {foo: "bar"},
          [], [1, 2, 3]
        ].forEach(function(src) {
          var clone = O.cloneShallow(src);
          expect(clone).not.toBe(src);
        });
      });

      it("should return an object containing the same properties", function() {
        [
          {}, {foo: "bar"},
          [], [1, 2, 3]
        ].forEach(function(src) {
          var clone = O.cloneShallow(src);
          for(var prop in src) {
            expect(clone[prop]).toBe(src[prop]);
          }
        });
      });

      it("should act as an identity function for simple data types or instances", function() {
        [
          1, true, null, undefined, "foo",
          new Date(),
          getFoo()
        ].forEach(function(value) {
          expect(O.cloneShallow(value)).toBe(value);
        });
      });

    }); //cloneShallow

    describe("`getPropertyDescriptor` -", function() {

      function expectDescriptor(obj, property) {
        var result = O.getPropertyDescriptor(obj, property);
        expect(typeof result).toBe("object");
        var attrs = ["configurable", "enumerable", "get", "set", "value", "writable"];
        Object.keys(result).forEach(function(prop) {
          expect(attrs).toContain(prop);
        });
      }

      it("should return an object", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"]
        };
        var result = O.getPropertyDescriptor(source, "ingredients");
        expect(typeof result).toBe("object");
      });

      it("should return `null` if the property does not exist", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"]
        };
        var result = O.getPropertyDescriptor(source, "recipe");
        expect(result).toBeNull();

        var foo = getFoo();
        expect(O.getPropertyDescriptor(foo, "recipe")).toBeNull();
      });

      it("should return the descriptor of an own property", function() {
        var source = {
          ingredients: ["spam", "eggs", "cheese"],
          recipe: undefined
        };
        var foo = getFoo();
        expectDescriptor(source, "ingredients");
        expectDescriptor(source, "recipe"); //property is defined, its value is not
        expectDescriptor(foo, "bar");
        expectDescriptor(foo, "parrot");
        expectDescriptor(foo, "cheese");
        expectDescriptor(foo, "minister");
        expectDescriptor(foo, "lumberjack");
      });

      it("should return the descriptor of an inherited property", function() {
        var foo = getFoo();
        expectDescriptor(foo, "spam");
        expectDescriptor(foo, "eggs");
      });

    }); // getPropertyDescriptor

    [
      {setPrototypeOf: O.setPrototypeOf, _label: "ES5"},
      {setPrototypeOf: O._forTestingPurposesOnly.setProtoCopy, _label: "setProtoCopy"},
      {setPrototypeOf: O._forTestingPurposesOnly.setProtoProp, _label: "setProtoProp"}
    ].forEach(function(O) {
      describe("`setPrototypeOf` - " + O._label + " variant -", function() {
        var Spam, protoEggs, parrot;
        beforeEach(function() {
          Spam = function() {
            this.bar = "bar";
          };
          Spam.prototype = new (function() {
            this.spam = "spam";
          })();
          parrot = new Spam();

          var myProto = function() {
            this.spam = "eggs";
          };
          protoEggs = new myProto();
        });

        it("should return the input object, if the desired prototype is an object", function() {
          expect(O.setPrototypeOf(parrot, protoEggs)).toBe(parrot);
        });

        it("should return the input object, if the desired prototype is `null` ", function() {
          expect(O.setPrototypeOf(parrot, null)).toBe(parrot);
        });

        it("should replace the `prototype` of an object, if the desired prototype is an object", function() {
          expect(parrot.spam).toBe("spam");
          O.setPrototypeOf(parrot, protoEggs);
          expect(parrot.spam).toBe("eggs");
        });

        it("should clear the object's prototype, if the desired prototype is `null`", function() {
          expect(parrot.spam).toBe("spam");
          var deadParrot = O.setPrototypeOf(parrot, null);
          expect(deadParrot.spam).toBeUndefined();
        });

        it("should throw an error if the object is not extensible", function() {
          [
            Object.seal(new Spam()),
            Object.freeze(new Spam()),
            Object.preventExtensions(new Spam())
          ].forEach(function(parrot) {
            expect(function() {
              O.setPrototypeOf(parrot, protoEggs);
            }).toThrowError(TypeError);
          });
        });

      }); // setPrototypeOf
    });

    describe("`make` -", function() {

      it("should return an instance of the same class of the constructor", function() {
        var Spam = function() {
          this.input = arguments;
        };
        var spam = O.make(Spam, []);
        expect(spam instanceof Spam).toBe(true);
      });

      it("should pass the array of arguments to the constructor", function() {
        var Spam = function() {
          this.input = arguments;
        };
        [
          [],
          [1], [1, 2], [1, 2, 3],
          [1, "2", 3, "4", 5, 6, 7, "8", 9, 10]
        ].forEach(function(args) {
          var spam = O.make(Spam, args);
          expect(spam.input.length).toBe(args.length);
          for(var arg in spam.input) {
            expect(args.indexOf(spam.input[arg])).toBeGreaterThan(-1);
          }
        });
      });

    }); // make

    describe("`applyClass` -", function() {
      var spam, Spam, Eggs;
      beforeEach(function() {
        Spam = function() {
          this.input = arguments;
          this.spam = "spam";
        };
        Spam.prototype = new (function() {
          this.spam = "ham";
        })();
        spam = new Spam();
        spam.spam = "bacon";

        Eggs = function() {
          this.eggs = "eggs";
        };
        Eggs.prototype = new (function() {
          this.cheese = "cheese";
        })();

      });

      it("should not invoke the constructor of the class if the instance already has the same prototype", function() {
        var mutatedSpam = O.applyClass(spam, Spam);
        expect(mutatedSpam.spam).toBe("bacon");
      });

      it("should invoke the constructor of the class if the instance does not have the same prototype", function() {
        var mutatedSpam = O.applyClass(spam, Eggs);
        expect(mutatedSpam.spam).toBe("bacon");
        expect(mutatedSpam.eggs).toBe("eggs");
      });

    }); //applyClass

  }); // pentaho.util.object
});

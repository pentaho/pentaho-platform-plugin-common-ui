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
    "pentaho/util/object",
  ],
  function(/** @type {Class.<pentaho.lang.Base>} */ Base, O) {
    "use strict";

    /* global jasmine:false, describe:false, it:false, expect:false, beforeEach:false, spyOn: false */

    describe("Base.Object", function() {
      describe("instances", function() {
        it("can be created with new", function() {
          var o = new Base();

          expect(o instanceof Base).toBe(true);
          expect(o instanceof Object).toBe(true);
        });

        describe("can be casted from", function() {
          it("null", function() {
            var o = Base.to(null);

            expect(o).not.toBeNull();

            expect(o instanceof Base).toBe(true);
            expect(o instanceof Object).toBe(true);
          });

          it("instance of literal object", function() {
            var value = {name: "Nolly"};
            var o = Base.to(value);

            expect(o.name).toBe("Nolly");

            expect(o instanceof Base).toBe(true);
            expect(o instanceof Object).toBe(true);

            expect(value).not.toBe(o);
          });

          it("instance of non-Base class", function() {
            var OtherClass = function(n) {
              this.name = n;
            };

            var value = new OtherClass("Nolly");
            var o = Base.to(value);

            expect(o.name).toBe("Nolly");

            expect(o instanceof Base).toBe(true);
            expect(o instanceof Object).toBe(true);

            expect(value).not.toBe(o);
            expect(o instanceof OtherClass).toBe(false);
          });

          it("instance of any subclass (should return the same instance)", function() {
            var OtherClass = Base.extend({name: "Nolly"});

            var value = new OtherClass();
            var o = Base.to(value);

            expect(o.name).toBe("Nolly");

            expect(o instanceof Base).toBe(true);
            expect(o instanceof Object).toBe(true);

            expect(value).toBe(o);
            expect(o instanceof OtherClass).toBe(true);
          });
        });

        it("have __root_proto__ property", function() {
          var o = new Base();
          expect(o.__root_proto__).toBe(Base.prototype);

          o = Base.to({});
          expect(o.__root_proto__).toBe(Base.prototype);
        });

        describe("when extended", function() {
          describe("at construction time", function() {
            it("default Base.Object constructor should call this.extend", function() {
              spyOn(Base.prototype, "extend");

              var o = new Base({a: 5});
              expect(o.extend).toHaveBeenCalledWith({a: 5});
            });

            it("properties should be accessible", function() {
              var o = new Base({a: 5});

              expect(o.a).toBe(5);
            });

            it("shouldn't be able to define this.base", function() {
              var o = new Base({base: "hello"});

              expect(o.base).not.toBe("hello");
            });
          });

          describe("after construction time", function() {
            it("instance extension supports properties", function() {
              var o = new Base();
              o.extend({b: 10, c: 5});

              expect(o.b).toBe(10);
              expect(o.c).toBe(5);
            });

            it("instance extension support single property syntax", function() {
              var o = new Base();
              o.extend("b", 10);

              expect(o.b).toBe(10);
            });

            it("instance extension supports functions", function() {
              var o = new Base();
              o.extend({
                d: function(param) {
                  this.param = param;
                }
              });

              expect(typeof o.d).toBe("function");
              o.d("hello world");
              expect(o.param).toBe("hello world");
            });

            it("instance extension supports getters and setters", function() {
              var o = new Base();
              o.extend(
                {
                  get e() {
                    return this.param;
                  },
                  set e(param) {
                    this.param = param;
                  }
                }
              );

              o.e = "hello world";
              expect(o.e).toBe("hello world");
            });

            it("shouldn't be able to define this.base", function() {
              var o = new Base();
              o.extend({base: "hello"});

              expect(o.base).not.toBe("hello");
            });
          });
        });
      });

      describe("when extended", function() {
        it("should return a subclass of Base.Object", function() {
          var Top = Base.extend();

          expect(Top).not.toBe(Base);
          expect(Top.ancestor).toBe(Base);
        });

        it("should be named, if name provided", function() {
          var Top = Base.extend("MyClassName");

          expect(Top.name || Top.displayName).toBe("MyClassName");
        });

        it("should not inherit name", function() {
          var Top = Base.extend("MyClassName");
          var Middle = Top.extend();

          expect(Middle.name).not.toBe("MyClassName");
          expect(Middle.displayName).not.toBe("MyClassName");
        });

        it("shouldn't be able to define this.base", function() {
          var Top = Base.extend({base: "hello"});

          expect(Top.prototype.base).not.toBe("hello");
        });

        describe("should be able to define instance level", function() {
          it("properties", function() {
            var Top = Base.extend({b: 10, c: 5});

            expect(Top.prototype.b).toBe(10);
            expect(Top.prototype.c).toBe(5);
          });

          it("functions", function() {
            var Top = Base.extend({
              d: function(param) {
                this.param = param;
              }
            });

            expect(typeof Top.prototype.d).toBe("function");
          });

          it("getters and setters", function() {
            var Top = Base.extend(
              {
                get e() {
                  return this.param;
                },
                set e(param) {
                  this.param = param;
                }
              }
            );

            var descriptor = O.getPropertyDescriptor(Top.prototype, "e");
            expect(typeof descriptor.get).toBe("function");
            expect(typeof descriptor.set).toBe("function");
          });
        });

        describe("should be able to define class level", function() {
          it("properties", function() {
            var Top = Base.extend(null, {b: 10, c: 5});

            expect(Top.b).toBe(10);
            expect(Top.c).toBe(5);
          });

          it("functions", function() {
            var Top = Base.extend(null, {
              d: function(param) {
                this.param = param;
              }
            });

            expect(typeof Top.d).toBe("function");
          });

          it("getters and setters", function() {
            var Top = Base.extend(null,
              {
                get e() {
                  return this.param;
                },
                set e(param) {
                  this.param = param;
                }
              }
            );

            var descriptor = O.getPropertyDescriptor(Top, "e");
            expect(typeof descriptor.get).toBe("function");
            expect(typeof descriptor.set).toBe("function");
          });
        });
      });

      describe("subclasses", function() {
        var level1_instance_spec;
        var level1_static_spec;

        var level2_instance_spec;
        var level2_class_spec;

        var level3_instance_spec;
        var level3_static_spec;

        var Animal;
        var Cat;

        beforeEach(function() {
          level1_instance_spec = {
            constructor: function(name) {
              this.name = name;

              this.ate = [];
              this.drank = [];
            },

            name: "",
            sleepPerDay: 8,

            _bathPerDay: 1,
            get bathsPerDay() {
              return this._bathPerDay;
            },

            set bathsPerWeek(b) {
              this._bathPerDay = b / 7;
            },

            ate: null,
            drank: null,

            _size: "big",
            _weight: "big",
            _height: 0,
            _color: null,

            eat: function(food) {
              this.ate.push(food);
            },
            drink: function(beverage) {
              this.drank.push(beverage);
            },
            smell: function() {
              return "bad";
            },

            set size(s) {
              this._size = s;
            },
            get size() {
              return this._size;
            },
            set weight(w) {
              this._weight = w;
            },
            get weight() {
              return this._weight;
            },
            set height(h) {
              this._height = h;
            },
            get height() {
              return this._height;
            },
            set color(c) {
              this._color = c;
            },
            get color() {
              return this._color;
            }
          };
          level1_static_spec = {
            kingdom: "Animalia",

            destroy: function() {
              return null;
            },
            get king() {
              return "lion";
            },
            set king(k) {
              k = "lion";
            },

            reproduce: function() {
              return 2 + 9;
            },
            get queen() {
              return "bee";
            },
            set queen(q) {
              q = "bee";
            },
            get prince() {
              return "symbol";
            },
            set prince(p) {
              p = "symbol";
            },
            get mememe() {
              return Animal;
            },
            set mememe(m) {
              m++;
            }
          };

          level2_instance_spec = {
            sleepPerDay: 15,

            get bathsPerDay() {
              return this.base() + 20;
            },

            set bathsPerWeek(b) {
              this.base(b - 20);
            },

            eat: function(food) {
              this.base("little " + food);
            },

            get size() {
              this.base();
              return "small";
            },
            set weight(w) {
              this._weight = w / 2;
            },
            get weight() {
              return this._weight * 2;
            },
            set height(h) {
              this._height = h - 20;
            }
          };
          level2_class_spec = {
            family: "Felidae",
            init: function() {
            },

            reproduce: function() {
              return 2 + 9;
            },
            get queen() {
              return "bee";
            },
            set queen(q) {
              q = "bee";
            },
            set prince(p) {
              p = "symbol";
            },
            get mememe() {
              return Animal;
            }
          };

          level3_instance_spec = {
            properName: "",

            sleepPerDay: 20,

            eat: function(mix_food) {
              this.base("bald " + mix_food);
            },
            drink: function(beverage) {
              this.base(beverage + " with sugar");
            },
            smell: function() {
              return "good";
            },

            run: function() {
              return this.base();
            },

            get size() {
              return "small " + this.base();
            },
            set weight(w) {
              this._weight = w / 2;
            },
            get weight() {
              return this._weight * 2;
            },
            set height(h) {
              this._height = h - 20;
            },

            get color() {
              return this.base() + "ish";
            },
            set color(c) {
              this.base("bald " + c);
            }
          };
          level3_static_spec = {
            human: "friend",

            destroy: function() {
              return "never!";
            },
            reproduce: function() {
              return this.base() + 9;
            },

            get queen() {
              return this.base() + "boo";
            },
            set queen(q) {
              q = "bee";
            },
            set prince(p) {
              p = "symbol";
            },
            get mememe() {
              return Animal;
            },

            walk: function() {
              return this.base();
            }
          };

          Animal = Base.extend(level1_instance_spec, level1_static_spec);

          Cat = Animal.extend("Cat", level2_instance_spec, level2_class_spec);
        });

        describe("instances", function() {
          it("can be created with new", function() {
            var cat = new Cat("Tom");

            expect(cat instanceof Cat).toBe(true);
            expect(cat instanceof Animal).toBe(true);
            expect(cat instanceof Base).toBe(true);
            expect(cat instanceof Object).toBe(true);
          });

          describe("can be casted from", function() {
            it("instance of any subclass (should return the same instance)", function() {
              var cat = new Cat("Tom");
              var animal = Animal.to(cat);

              expect(cat).toBe(animal);
              expect(animal instanceof Cat).toBe(true);
              expect(animal instanceof Animal).toBe(true);
              expect(animal instanceof Base).toBe(true);
              expect(animal instanceof Object).toBe(true);
            });
          });

          it("have __root_proto__ property", function() {
            var cat = new Cat("Tom");
            expect(cat.__root_proto__).toBe(Base.prototype);
          });
        });

        describe("when extended", function() {
          it("should call _subClassed, if present", function() {
            spyOn(Cat, "_extend").and.callThrough();
            Cat._subClassed = jasmine.createSpy("_subClassed");

            var keyArgs = {a: 'hello'};
            Cat.extend("CatWithArgs", {}, {}, keyArgs);

            expect(Cat._extend).toHaveBeenCalledWith("CatWithArgs", {}, {}, keyArgs);
            expect(Cat._subClassed).toHaveBeenCalled();
            expect(Cat._subClassed.calls.mostRecent().args[3]).toBe(keyArgs);
          });

          it("should delegate to _extended, if overridden", function() {
            Cat._extend = jasmine.createSpy("_extend");

            var keyArgs = {a: 'hello'};
            Cat.extend("CatWithArgs", {}, {}, keyArgs);

            expect(Cat._extend).toHaveBeenCalledWith("CatWithArgs", {}, {}, keyArgs);
          });

          it("should call class init method, if present", function() {
            spyOn(Cat, "init");

            var keyArgs = {a: 'hello'};
            Cat.extend("CatWithArgs", {}, {}, keyArgs);

            expect(Cat.init).toHaveBeenCalledWith(keyArgs);
          });

          describe("should not inherit", function() {
            describe("class level", function() {
              it("properties", function() {
                expect(Cat.kingdom).toBeUndefined();
              });
            });
          });

          describe("should inherit", function() {
            describe("class level", function() {
              it("class init method, if present", function() {
                var Persa = Cat.extend();

                expect(Persa.init).toBe(Cat.init);
              });

              it("functions", function() {
                expect(Cat.destroy).toBe(Animal.destroy);
              });

              it("getters and setters", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat, "king");
                var animal_descriptor = O.getPropertyDescriptor(Animal, "king");

                expect(cat_descriptor.get).toBe(animal_descriptor.get);
                expect(cat_descriptor.set).toBe(animal_descriptor.set);
              });
            });

            describe("instance level", function() {
              it("properties", function() {
                expect(Cat.prototype.name).toBe(Animal.prototype.name);
              });

              it("functions", function() {
                expect(Cat.prototype.drink).toBe(Animal.prototype.drink);
              });

              it("getters and setters", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "color");
                var animal_descriptor = O.getPropertyDescriptor(Animal.prototype, "color");

                expect(cat_descriptor.get).toBe(animal_descriptor.get);
                expect(cat_descriptor.set).toBe(animal_descriptor.set);
              });
            });
          });

          describe("should be able to override", function() {
            describe("class level", function() {
              it("constructor", function() {
                var Persa = Cat.extend(
                  {
                    constructor: function(name) {
                      this.base("Bald " + name);
                    }
                  }
                );

                var persa = new Persa("Felix");

                expect(persa.name).toBe("Bald Felix");
              });

              it("functions", function() {
                expect(Cat.reproduce).not.toBe(Animal.reproduce);
              });

              it("getters and setters", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat, "queen");
                var animal_descriptor = O.getPropertyDescriptor(Animal, "queen");

                expect(cat_descriptor.get).not.toBe(animal_descriptor.get);
                expect(cat_descriptor.set).not.toBe(animal_descriptor.set);
              });

              it("only getter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat, "mememe");
                var animal_descriptor = O.getPropertyDescriptor(Animal, "mememe");

                expect(cat_descriptor.get).not.toBe(animal_descriptor.get);
                expect(cat_descriptor.set).toBe(animal_descriptor.set);
              });

              it("only setter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat, "prince");
                var animal_descriptor = O.getPropertyDescriptor(Animal, "prince");

                expect(cat_descriptor.get).toBe(animal_descriptor.get);
                expect(cat_descriptor.set).not.toBe(animal_descriptor.set);
              });
            });

            describe("instance level", function() {
              it("properties", function() {
                expect(Cat.prototype.sleepPerDay).not.toBe(Animal.prototype.sleepPerDay);
              });

              it("functions", function() {
                expect(Cat.prototype.eat).not.toBe(Animal.prototype.eat);
              });

              it("getter/setter over getter/setter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "weight");
                var animal_descriptor = O.getPropertyDescriptor(Animal.prototype, "weight");

                expect(cat_descriptor.get).not.toBe(animal_descriptor.get);
                expect(cat_descriptor.set).not.toBe(animal_descriptor.set);
              });

              it("getter over getter/setter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "size");
                var animal_descriptor = O.getPropertyDescriptor(Animal.prototype, "size");

                expect(cat_descriptor.get).not.toBe(animal_descriptor.get);
                expect(cat_descriptor.set).toBe(animal_descriptor.set);
              });

              it("getter over getter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "bathsPerDay");
                var animal_descriptor = O.getPropertyDescriptor(Animal.prototype, "bathsPerDay");

                expect(cat_descriptor.get).not.toBe(animal_descriptor.get);
                expect(cat_descriptor.set).toBe(animal_descriptor.set);
              });

              it("setter over getter/setter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "height");
                var animal_descriptor = O.getPropertyDescriptor(Animal.prototype, "height");

                expect(cat_descriptor.get).toBe(animal_descriptor.get);
                expect(cat_descriptor.set).not.toBe(animal_descriptor.set);
              });

              it("setter over setter", function() {
                var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "bathsPerWeek");
                var animal_descriptor = O.getPropertyDescriptor(Animal.prototype, "bathsPerWeek");

                expect(cat_descriptor.get).toBe(animal_descriptor.get);
                expect(cat_descriptor.set).not.toBe(animal_descriptor.set);
              });
            });
          });

          describe("overridden methods", function() {
            var Persa;

            beforeEach(function() {
              Persa = Cat.extend(level3_instance_spec, level3_static_spec);
            });

            describe("instance level", function() {
              var persa_cat;

              beforeEach(function() {
                persa_cat = new Persa();
              });

              it("should be able to call its base method", function() {
                persa_cat.drink("orange juice");
                persa_cat.color = "black";

                expect(persa_cat.drank[0]).toBe("orange juice with sugar");
                expect(persa_cat.color).toBe("bald blackish");
              });

              it("should be able to call its base method even if there isn't one", function() {
                expect(persa_cat.run()).toBeUndefined();
              });

              it("method shouldn't be wrapped if not calling this.base()", function() {
                expect(persa_cat.smell).toBe(level3_instance_spec.smell);
                expect(persa_cat.smell.valueOf()).toBe(level3_instance_spec.smell);
              });

              it("method should be wrapped if calling this.base()", function() {
                expect(persa_cat.drink).not.toBe(level3_instance_spec.drink);
              });

              it("valueOf should return unwrapped method", function() {
                expect(persa_cat.drink.valueOf()).toBe(level3_instance_spec.drink);
              });

              it("valueOf('object') should return wrapped method", function() {
                expect(persa_cat.drink.valueOf("object")).toBe(persa_cat.drink);
              });

              it("toString should return string representation of unwrapped method", function() {
                expect(persa_cat.drink.toString()).toBe(level3_instance_spec.drink.toString());
              });
            });

            describe("class level", function() {
              it("should be able to call its base method", function() {
                expect(Persa.reproduce()).toBe(20);
                expect(Persa.queen).toBe("beeboo");
              });

              it("should be able to call its base method even if there isn't one", function() {
                expect(Persa.walk()).toBeUndefined();
              });

              it("method shouldn't be wrapped if not calling this.base()", function() {
                expect(Persa.destroy).toBe(level3_static_spec.destroy);
                expect(Persa.destroy.valueOf()).toBe(level3_static_spec.destroy);
              });

              it("method should be wrapped if calling this.base()", function() {
                expect(Persa.reproduce).not.toBe(level3_static_spec.reproduce);
              });

              it("valueOf should return unwrapped method", function() {
                expect(Persa.reproduce.valueOf()).toBe(level3_static_spec.reproduce);
              });

              it("toString should return string representation of unwrapped method", function() {
                expect(Persa.reproduce.toString()).toBe(level3_static_spec.reproduce.toString());
              });
            });
          });
        });

        describe("when implementing interfaces", function() {
          var Persa;

          beforeEach(function() {
            Persa = Cat.extend("Persa");
          });

          describe("using mixins", function() {
            describe("mixing class", function() {
              var DomesticMixIn;

              beforeEach(function() {
                DomesticMixIn = Base.extend(level3_instance_spec, level3_static_spec);

                Persa.mix(DomesticMixIn);
              });

              it("should mix instance level members", function() {
                expect(Persa.prototype.properName).toBeDefined();
                expect(Persa.prototype.eat).toBeDefined();
              });

              it("should mix class level members", function() {
                expect(Persa.human).toBe("friend");
              });

              describe("instances", function() {
                var persa_cat;

                beforeEach(function() {
                  persa_cat = new Persa();
                });

                it("should have mixed members", function() {
                  expect(persa_cat.properName).toBeDefined();
                  expect(persa_cat.eat).toBeDefined();
                });

                it("should be instances of base class but not of MixIn class", function() {
                  expect(persa_cat instanceof Persa).toBe(true);
                  expect(persa_cat instanceof Cat).toBe(true);
                  expect(persa_cat instanceof Animal).toBe(true);
                  expect(persa_cat instanceof Base).toBe(true);

                  expect(persa_cat instanceof DomesticMixIn).toBe(false);
                });
              });

              describe("should be able to override", function() {
                describe("class level", function() {
                  it("functions", function() {
                    expect(Persa.reproduce).not.toBe(Cat.reproduce);
                  });

                  it("getters and setters", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "queen");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "queen");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });

                  it("only getter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "mememe");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "mememe");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).toBe(cat_descriptor.set);
                  });

                  it("only setter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "prince");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "prince");

                    expect(persa_descriptor.get).toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });
                });

                describe("instance level", function() {
                  it("properties", function() {
                    expect(Persa.prototype.sleepPerDay).not.toBe(Cat.prototype.sleepPerDay);
                  });

                  it("functions", function() {
                    expect(Persa.prototype.eat).not.toBe(Cat.prototype.eat);
                  });

                  it("getters and setters", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "weight");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "weight");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });

                  it("only getter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "size");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "size");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).toBe(cat_descriptor.set);
                  });

                  it("only setter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "height");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "height");

                    expect(persa_descriptor.get).toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });
                });
              });

              describe("overridden methods", function() {
                describe("instance level", function() {
                  var persa_cat;

                  beforeEach(function() {
                    persa_cat = new Persa();
                  });

                  it("should be able to call its base method", function() {
                    persa_cat.drink("orange juice");

                    expect(persa_cat.drank.length).toBe(1);
                    expect(persa_cat.drank[0]).toBe("orange juice with sugar");
                  });

                  it("getters/setters should be able to call its base method", function() {
                    persa_cat.color = "black";

                    expect(persa_cat.color).toBe("bald blackish");
                  });

                  it("should be able to call its base method even if there isn't one", function() {
                    expect(persa_cat.run()).toBeUndefined();
                  });

                  it("method shouldn't be wrapped if not calling this.base()", function() {
                    expect(persa_cat.smell).toBe(level3_instance_spec.smell);
                    expect(persa_cat.smell.valueOf()).toBe(level3_instance_spec.smell);
                  });

                  it("method should be wrapped if calling this.base()", function() {
                    expect(persa_cat.drink).not.toBe(level3_instance_spec.drink);
                  });

                  it("valueOf should return unwrapped method", function() {
                    expect(persa_cat.drink.valueOf()).toBe(level3_instance_spec.drink);
                  });

                  it("toString should return string representation of unwrapped method", function() {
                    expect(persa_cat.drink.toString()).toBe(level3_instance_spec.drink.toString());
                  });
                });

                describe("class level", function() {
                  it("should be able to call its base method", function() {
                    expect(Persa.reproduce()).toBe(20);
                    expect(Persa.queen).toBe("beeboo");
                  });

                  it("should be able to call its base method even if there isn't one", function() {
                    expect(Persa.walk()).toBeUndefined();
                  });

                  it("method shouldn't be wrapped if not calling this.base()", function() {
                    expect(Persa.destroy).toBe(level3_static_spec.destroy);
                    expect(Persa.destroy.valueOf()).toBe(level3_static_spec.destroy);
                  });

                  it("method should be wrapped if calling this.base()", function() {
                    expect(Persa.reproduce).not.toBe(level3_static_spec.reproduce);
                  });

                  it("valueOf should return unwrapped method", function() {
                    expect(Persa.reproduce.valueOf()).toBe(level3_static_spec.reproduce);
                  });

                  it("toString should return string representation of unwrapped method", function() {
                    expect(Persa.reproduce.toString()).toBe(level3_static_spec.reproduce.toString());
                  });
                });
              });
            });

            describe("mixing class and literal object static spec", function() {
              var DomesticMixIn;

              beforeEach(function() {
                DomesticMixIn = Base.extend(level3_instance_spec);

                Persa.mix(DomesticMixIn, level3_static_spec);
              });

              it("should mix instance level members", function() {
                expect(Persa.prototype.properName).toBeDefined();
                expect(Persa.prototype.eat).toBeDefined();
              });

              it("should mix class level members", function() {
                expect(Persa.human).toBe("friend");
              });

              describe("instances", function() {
                var persa_cat;

                beforeEach(function() {
                  persa_cat = new Persa();
                });

                it("should have mixed members", function() {
                  expect(persa_cat.properName).toBeDefined();
                  expect(persa_cat.eat).toBeDefined();
                });

                it("should be instances of base class but not of MixIn class", function() {
                  expect(persa_cat instanceof Persa).toBe(true);
                  expect(persa_cat instanceof Cat).toBe(true);
                  expect(persa_cat instanceof Animal).toBe(true);
                  expect(persa_cat instanceof Base).toBe(true);

                  expect(persa_cat instanceof DomesticMixIn).toBe(false);
                });
              });

              describe("should be able to override", function() {
                describe("class level", function() {
                  it("functions", function() {
                    expect(Persa.reproduce).not.toBe(Cat.reproduce);
                  });

                  it("getters and setters", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "queen");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "queen");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });

                  it("only getter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "mememe");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "mememe");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).toBe(cat_descriptor.set);
                  });

                  it("only setter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "prince");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "prince");

                    expect(persa_descriptor.get).toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });
                });

                describe("instance level", function() {
                  it("properties", function() {
                    expect(Persa.prototype.sleepPerDay).not.toBe(Cat.prototype.sleepPerDay);
                  });

                  it("functions", function() {
                    expect(Persa.prototype.eat).not.toBe(Cat.prototype.eat);
                  });

                  it("getters and setters", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "weight");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "weight");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });

                  it("only getter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "size");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "size");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).toBe(cat_descriptor.set);
                  });

                  it("only setter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "height");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "height");

                    expect(persa_descriptor.get).toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });
                });
              });

              describe("overridden methods", function() {
                describe("instance level", function() {
                  var persa_cat;

                  beforeEach(function() {
                    persa_cat = new Persa();
                  });

                  it("should be able to call its base method", function() {
                    persa_cat.drink("orange juice");

                    expect(persa_cat.drank.length).toBe(1);
                    expect(persa_cat.drank[0]).toBe("orange juice with sugar");
                  });

                  it("getters/setters should be able to call its base method", function() {
                    persa_cat.color = "black";

                    expect(persa_cat.color).toBe("bald blackish");
                  });

                  it("should be able to call its base method even if there isn't one", function() {
                    expect(persa_cat.run()).toBeUndefined();
                  });

                  it("method shouldn't be wrapped if not calling this.base()", function() {
                    expect(persa_cat.smell).toBe(level3_instance_spec.smell);
                    expect(persa_cat.smell.valueOf()).toBe(level3_instance_spec.smell);
                  });

                  it("method should be wrapped if calling this.base()", function() {
                    expect(persa_cat.drink).not.toBe(level3_instance_spec.drink);
                  });

                  it("valueOf should return unwrapped method", function() {
                    expect(persa_cat.drink.valueOf()).toBe(level3_instance_spec.drink);
                  });

                  it("toString should return string representation of unwrapped method", function() {
                    expect(persa_cat.drink.toString()).toBe(level3_instance_spec.drink.toString());
                  });
                });

                describe("class level", function() {
                  it("should be able to call its base method", function() {
                    expect(Persa.reproduce()).toBe(20);
                    expect(Persa.queen).toBe("beeboo");
                  });

                  it("should be able to call its base method even if there isn't one", function() {
                    expect(Persa.walk()).toBeUndefined();
                  });

                  it("method shouldn't be wrapped if not calling this.base()", function() {
                    expect(Persa.destroy).toBe(level3_static_spec.destroy);
                    expect(Persa.destroy.valueOf()).toBe(level3_static_spec.destroy);
                  });

                  it("method should be wrapped if calling this.base()", function() {
                    expect(Persa.reproduce).not.toBe(level3_static_spec.reproduce);
                  });

                  it("valueOf should return unwrapped method", function() {
                    expect(Persa.reproduce.valueOf()).toBe(level3_static_spec.reproduce);
                  });

                  it("toString should return string representation of unwrapped method", function() {
                    expect(Persa.reproduce.toString()).toBe(level3_static_spec.reproduce.toString());
                  });
                });
              });
            });

            describe("mixing object literals specs", function() {
              beforeEach(function() {
                Persa.mix(level3_instance_spec, level3_static_spec);
              });

              it("should mix instance level members", function() {
                expect(Persa.prototype.properName).toBeDefined();
                expect(Persa.prototype.eat).toBeDefined();
              });

              it("should mix class level members", function() {
                expect(Persa.human).toBe("friend");
              });

              describe("instances", function() {
                var persa_cat;

                beforeEach(function() {
                  persa_cat = new Persa();
                });

                it("should have mixed members", function() {
                  expect(persa_cat.properName).toBeDefined();
                  expect(persa_cat.eat).toBeDefined();
                });
              });

              describe("should be able to override", function() {
                describe("class level", function() {
                  it("functions", function() {
                    expect(Persa.reproduce).not.toBe(Cat.reproduce);
                  });

                  it("getters and setters", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "queen");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "queen");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });

                  it("only getter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "mememe");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "mememe");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).toBe(cat_descriptor.set);
                  });

                  it("only setter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa, "prince");
                    var cat_descriptor = O.getPropertyDescriptor(Cat, "prince");

                    expect(persa_descriptor.get).toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });
                });

                describe("instance level", function() {
                  it("properties", function() {
                    expect(Persa.prototype.sleepPerDay).not.toBe(Cat.prototype.sleepPerDay);
                  });

                  it("functions", function() {
                    expect(Persa.prototype.eat).not.toBe(Cat.prototype.eat);
                  });

                  it("getters and setters", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "weight");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "weight");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });

                  it("only getter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "size");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "size");

                    expect(persa_descriptor.get).not.toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).toBe(cat_descriptor.set);
                  });

                  it("only setter", function() {
                    var persa_descriptor = O.getPropertyDescriptor(Persa.prototype, "height");
                    var cat_descriptor = O.getPropertyDescriptor(Cat.prototype, "height");

                    expect(persa_descriptor.get).toBe(cat_descriptor.get);
                    expect(persa_descriptor.set).not.toBe(cat_descriptor.set);
                  });
                });
              });

              describe("overridden methods", function() {
                describe("instance level", function() {
                  var persa_cat;

                  beforeEach(function() {
                    persa_cat = new Persa();
                  });

                  it("should be able to call its base method", function() {
                    persa_cat.drink("orange juice");

                    expect(persa_cat.drank.length).toBe(1);
                    expect(persa_cat.drank[0]).toBe("orange juice with sugar");
                  });

                  it("getters/setters should be able to call its base method", function() {
                    persa_cat.color = "black";

                    expect(persa_cat.color).toBe("bald blackish");
                  });

                  it("should be able to call its base method even if there isn't one", function() {
                    expect(persa_cat.run()).toBeUndefined();
                  });

                  it("method shouldn't be wrapped if not calling this.base()", function() {
                    expect(persa_cat.smell).toBe(level3_instance_spec.smell);
                    expect(persa_cat.smell.valueOf()).toBe(level3_instance_spec.smell);
                  });

                  it("method should be wrapped if calling this.base()", function() {
                    expect(persa_cat.drink).not.toBe(level3_instance_spec.drink);
                  });

                  it("valueOf should return unwrapped method", function() {
                    expect(persa_cat.drink.valueOf()).toBe(level3_instance_spec.drink);
                  });

                  it("toString should return string representation of unwrapped method", function() {
                    expect(persa_cat.drink.toString()).toBe(level3_instance_spec.drink.toString());
                  });
                });

                describe("class level", function() {
                  it("should be able to call its base method", function() {
                    expect(Persa.reproduce()).toBe(20);
                    expect(Persa.queen).toBe("beeboo");
                  });

                  it("should be able to call its base method even if there isn't one", function() {
                    expect(Persa.walk()).toBeUndefined();
                  });

                  it("method shouldn't be wrapped if not calling this.base()", function() {
                    expect(Persa.destroy).toBe(level3_static_spec.destroy);
                    expect(Persa.destroy.valueOf()).toBe(level3_static_spec.destroy);
                  });

                  it("method should be wrapped if calling this.base()", function() {
                    expect(Persa.reproduce).not.toBe(level3_static_spec.reproduce);
                  });

                  it("valueOf should return unwrapped method", function() {
                    expect(Persa.reproduce.valueOf()).toBe(level3_static_spec.reproduce);
                  });

                  it("toString should return string representation of unwrapped method", function() {
                    expect(Persa.reproduce.toString()).toBe(level3_static_spec.reproduce.toString());
                  });
                });
              });
            });
          });

          describe("using implement", function() {
            it("should accept multiple interfaces and ignore falsy arguments", function() {
              Persa.implement({a: 5}, null, {b: 7});

              expect(Persa.prototype.a).toBeDefined();
              expect(Persa.prototype.a).toBe(5);

              expect(Persa.prototype.b).toBeDefined();
              expect(Persa.prototype.b).toBe(7);
            });

            describe("with a class", function() {
              var DomesticInterface;

              beforeEach(function() {
                DomesticInterface = Base.extend(level3_instance_spec);

                Persa.implement(DomesticInterface);
              });

              it("should mix instance level members", function() {
                expect(Persa.prototype.properName).toBeDefined();
                expect(Persa.prototype.eat).toBeDefined();
              });

              it("instances should have mixed members", function() {
                var persa = new Persa();

                expect(persa.properName).toBeDefined();
                expect(persa.eat).toBeDefined();
              });

              it("should be instance of base class but not of the Interface class", function() {
                var persa_cat = new Persa();

                expect(persa_cat instanceof Persa).toBe(true);
                expect(persa_cat instanceof Cat).toBe(true);
                expect(persa_cat instanceof Animal).toBe(true);
                expect(persa_cat instanceof Base).toBe(true);

                expect(persa_cat instanceof DomesticInterface).toBe(false);
              });
            });

            describe("with an object literal spec", function() {
              beforeEach(function() {
                Persa.implement(level3_instance_spec);
              });

              it("should mix instance level members", function() {
                expect(Persa.prototype.properName).toBeDefined();
                expect(Persa.prototype.eat).toBeDefined();
              });

              it("instances should have mixed members", function() {
                var persa = new Persa();

                expect(persa.properName).toBeDefined();
                expect(persa.eat).toBeDefined();
              });
            });
          });

          describe("using implementStatic", function() {
            it("should accept multiple interfaces and ignore falsy arguments", function() {
              Persa.implementStatic({a: 5}, null, {b: 7});

              expect(Persa.a).toBeDefined();
              expect(Persa.a).toBe(5);

              expect(Persa.b).toBeDefined();
              expect(Persa.b).toBe(7);
            });

            describe("with an object literal spec", function() {
              beforeEach(function() {
                Persa.implementStatic(level3_static_spec);
              });

              it("should mix class level members", function() {
                expect(Persa.human).toBeDefined();
                expect(Persa.human).toBe("friend");
              });
            });
          });
        });
      });
    });

    describe("Base.Array", function() {
      describe("instances", function() {
        describe("can be casted from", function() {
          it("null", function() {
            var o = Base.Array.to(null);

            expect(o).not.toBeNull();

            expect(o.length).toBe(0);

            expect(o instanceof Base.Array).toBe(true);
            expect(o instanceof Array).toBe(true);
          });

          it("instance of literal array", function() {
            var value = [1, 2, 3];
            var o = Base.Array.to(value);

            expect(o[0]).toBe(1);
            expect(o[1]).toBe(2);
            expect(o[2]).toBe(3);

            expect(o.length).toBe(3);

            expect(o instanceof Base.Array).toBe(true);
            expect(o instanceof Array).toBe(true);
          });

          it("instance of non-Base class", function() {
            var OtherClass = function(n, f, j) {
              this.name = n;
              this.push(f);
              this.push(j);
            };
            OtherClass.prototype = [];

            var value = new OtherClass("Nolly", 1, 2);
            var o = Base.Array.to(value);

            expect(o.name).toBe("Nolly");
            expect(o[0]).toBe(1);
            expect(o[1]).toBe(2);

            expect(o.length).toBe(2);

            expect(o instanceof Base.Array).toBe(true);
            expect(o instanceof Array).toBe(true);

            expect(o instanceof OtherClass).toBe(false);
          });

          it("instance of any subclass (should return the same instance)", function() {
            var OtherClass = Base.Array.extend({name: "Nolly"});

            var value = new OtherClass();
            value.push(1);

            var o = Base.Array.to(value);

            expect(o.name).toBe("Nolly");
            expect(o[0]).toBe(1);

            expect(o.length).toBe(1);

            expect(o instanceof Base.Array).toBe(true);
            expect(o instanceof Array).toBe(true);

            expect(value).toBe(o);
            expect(o instanceof OtherClass).toBe(true);
          });

          it("should throw if can't cast", function() {
            expect(function() {
              Base.Array.to("hello");
            }).toThrowError(/Cannot convert/);
          });
        });

        it("have __root_proto__ property", function() {
          var o = Base.Array.to([]);
          expect(o.__root_proto__).toBe(Base.Array.prototype);
        });
      });

      describe("when extended", function() {
        it("should return a subclass of Base.Array", function() {
          var Top = Base.Array.extend();

          expect(Top).not.toBe(Base.Array);
          expect(Top.ancestor).toBe(Base.Array);
        });

        describe("should be able to define instance level", function() {
          it("properties", function() {
            var Top = Base.Array.extend({b: 10, c: 5});

            expect(Top.prototype.b).toBe(10);
            expect(Top.prototype.c).toBe(5);
          });

          it("functions", function() {
            var Top = Base.Array.extend({
              d: function(param) {
                this.param = param;
              }
            });

            expect(typeof Top.prototype.d).toBe("function");
          });

          it("getters and setters", function() {
            var Top = Base.Array.extend(
              {
                get e() {
                  return this.param;
                },
                set e(param) {
                  this.param = param;
                }
              }
            );

            var descriptor = O.getPropertyDescriptor(Top.prototype, "e");
            expect(typeof descriptor.get).toBe("function");
            expect(typeof descriptor.set).toBe("function");
          });
        });

        describe("should be able to define class level", function() {
          it("properties", function() {
            var Top = Base.Array.extend(null, {b: 10, c: 5});

            expect(Top.b).toBe(10);
            expect(Top.c).toBe(5);
          });

          it("functions", function() {
            var Top = Base.Array.extend(null, {
              d: function(param) {
                this.param = param;
              }
            });

            expect(typeof Top.d).toBe("function");
          });

          it("getters and setters", function() {
            var Top = Base.Array.extend(null,
              {
                get e() {
                  return this.param;
                },
                set e(param) {
                  this.param = param;
                }
              }
            );

            var descriptor = O.getPropertyDescriptor(Top, "e");
            expect(typeof descriptor.get).toBe("function");
            expect(typeof descriptor.set).toBe("function");
          });
        });
      });

      describe("subclasses", function() {
        var Set;
        var SetWithMax;

        beforeEach(function() {
          Set = Base.Array.extend(
            {
              constructor: function(name) {
                this.name = name;
              },

              name: "",

              push: function(e) {
                if (this.indexOf(e) !== -1) {
                  this.base(e);
                }
              }
            }, {
              duplicates: false
            }
          );

          SetWithMax = Set.extend(
            {
              push: function(e) {
                if (this.length < 5) {
                  this.base(e);
                }
              }
            }
          );
        });

        describe("instances", function() {
          it("can be created with new", function() {
            var set = new Set("MySet");

            expect(set instanceof Set).toBe(true);
            expect(set instanceof Base.Array).toBe(true);
            expect(set instanceof Array).toBe(true);
          });

          describe("can be casted from", function() {
            it("instance of any subclass (should return the same instance)", function() {
              var max_set = new SetWithMax("MySet");
              var set = Set.to(max_set);

              expect(max_set).toBe(set);
              expect(set instanceof SetWithMax).toBe(true);
              expect(set instanceof Set).toBe(true);
              expect(set instanceof Base.Array).toBe(true);
              expect(set instanceof Array).toBe(true);
            });
          });

          it("have __root_proto__ property", function() {
            var set = new Set("MySet");
            expect(set.__root_proto__).toBe(Base.Array.prototype);
          });
        });
      });
    });

    describe("instances of literal objects", function() {
      describe("when extended", function() {
        var alien;
        beforeEach(function() {
          alien = {
            planet: "Endor",
            race: "Ewoks",
            abduct: function(race) {
              this.captive = race;
            }
          };
        });

        it("should not extend from Base", function() {
          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien instanceof Base).toBe(false);
          expect(alien instanceof Object).toBe(true);
        });

        it("should have no __root_proto__ property", function() {
          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien.__root_proto__).toBeUndefined();
        });

        it("should call instance's own extend method, if present", function() {
          alien.extend = jasmine.createSpy('extend');

          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien.extend).toHaveBeenCalled();
        });

        it("should be able to access both pre-existing members and extended members", function() {
          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien.planet).toBe("Endor");
          expect(alien.race).toBe("Ewoks");
          expect(alien.language).toBe("Ewokese");
        });

        it("overridden methods should be able to call its base method", function() {
          var spy = spyOn(alien, "abduct");

          Base.prototype.extend.call(alien, {
            abduct: function(race) {
              this.base(race);
            }
          });

          alien.abduct("humans");

          expect(spy).toHaveBeenCalledWith("humans");
        });
      });
    });

    describe("instances of non-Base classes", function() {
      describe("when extended", function() {
        var Alien;
        var alien;

        beforeEach(function() {
          Alien = function(p, r) {
            this.planet = p;
            this.race = r;

            this.abduct = function(race) {
              this.captive = race;
            };
          };

          alien = new Alien("Endor", "Ewoks");
        });

        it("should not extend from Base and continue to be instances of Alien class", function() {
          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien instanceof Base).toBe(false);
          expect(alien instanceof Alien).toBe(true);
          expect(alien instanceof Object).toBe(true);
        });

        it("should have no __root_proto__ property", function() {
          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien.__root_proto__).toBeUndefined();
        });

        it("should call instance's own extend method, if present", function() {
          alien.extend = jasmine.createSpy('extend');

          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien.extend).toHaveBeenCalled();
        });

        it("should be able to access both pre-existing members and extended members", function() {
          Base.prototype.extend.call(alien, {language: "Ewokese"});

          expect(alien.planet).toBe("Endor");
          expect(alien.race).toBe("Ewoks");
          expect(alien.language).toBe("Ewokese");
        });

        it("overridden methods should be able to call its base method", function() {
          var spy = spyOn(alien, "abduct");

          Base.prototype.extend.call(alien, {
            abduct: function(race) {
              this.base(race);
            }
          });

          alien.abduct("humans");

          expect(spy).toHaveBeenCalledWith("humans");
        });

        describe("when implementing interfaces", function() {
          var level2_instance_spec = {
            battery: 0.76,
            abduct: function(race) {
              this.base("living " + race);
            }
          };

          var level2_class_spec = {
            human: "owner"
          };

          describe("using implement", function() {
            beforeEach(function() {
              Base.implement.call(Alien, level2_instance_spec);
            });

            it("should mix instance level members", function() {
              expect(Alien.prototype.battery).toBeDefined();
              expect(Alien.prototype.abduct).toBeDefined();
            });

            it("instances should have mixed members", function() {
              var robot = new Alien();

              expect(robot.battery).toBeDefined();
              expect(robot.abduct).toBeDefined();
            });
          });

          describe("using implementStatic", function() {
            beforeEach(function() {
              Base.implementStatic.call(Alien, level2_class_spec);
            });

            it("should mix class level members", function() {
              expect(Alien.human).toBe("owner");
            });
          });
        });
      });
    });
  })
;

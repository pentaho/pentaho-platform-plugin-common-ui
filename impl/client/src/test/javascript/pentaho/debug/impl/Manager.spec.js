/*!
 * Copyright 2016 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/debug/impl/Manager",
  "pentaho/debug/Levels"
], function(DebugManager, DebugLevels) {

  "use strict";

  /* globals describe, it, expect, beforeEach */

  describe("pentaho.debug.impl.Manager", function() {

    it("should be defined", function() {

      expect(typeof DebugManager).toBe("function");
    });

    it("should be constructable with no arguments", function() {

      var mgr = new DebugManager();

      expect(mgr).not.toBe(null); // dummy
    });

    describe("#getLevel([module]) and #setLevel(level, [module])", function() {

      it("should initially get a default debugging level of 'error'", function() {

        var mgr = new DebugManager();

        expect(mgr.getLevel()).toBe(DebugLevels.error);
      });

      it("should set and get the default debugging level", function() {

        var mgr = new DebugManager();
        var defaultLevel = DebugLevels.warn;
        mgr.setLevel(defaultLevel);

        expect(mgr.getLevel()).toBe(defaultLevel);
      });

      it("should set and get a module's debugging level", function() {

        var mgr = new DebugManager();
        var level = DebugLevels.info;
        var mid = "foo";
        mgr.setLevel(level, mid);

        expect(mgr.getLevel(mid)).toBe(level);
      });

      it("should set and get a module's debugging level, even when there are other configured modules", function() {

        var mgr = new DebugManager();
        var level = DebugLevels.info;
        var mid = "foo";
        mgr.setLevel(level, mid);
        mgr.setLevel(DebugLevels.warn, "bar");

        expect(mgr.getLevel(mid)).toBe(level);
      });

      it("should get the default debugging level for unconfigured modules", function() {

        var mgr = new DebugManager();
        var defaultLevel = DebugLevels.warn;
        mgr.setLevel(defaultLevel);

        expect(mgr.getLevel("foo")).toBe(defaultLevel);
      });

      it("should get a configured default debugging level, even when there are configured modules", function() {

        var mgr = new DebugManager();
        var defaultLevel = DebugLevels.warn;
        mgr.setLevel(defaultLevel);
        mgr.setLevel(DebugLevels.info, "foo");

        expect(mgr.getLevel()).toBe(defaultLevel);
      });

      it("should set and get a module's debugging level, given the module object", function() {

        var mgr = new DebugManager();
        var level = DebugLevels.info;
        var module = {id: "foo"};
        mgr.setLevel(level, module);
        mgr.setLevel(DebugLevels.warn, {id: "bar"});

        expect(mgr.getLevel(module)).toBe(level);
      });
    });

    describe("#configure(spec)", function() {

      it("should configure the default level, given an enum value", function() {

        var mgr = new DebugManager();
        var defaultLevel = DebugLevels.warn;
        mgr.configure({level: defaultLevel});

        expect(mgr.getLevel()).toBe(defaultLevel);
      });

      it("should configure the default level, given a string value", function() {
        var mgr = new DebugManager();
        var defaultLevel = DebugLevels.warn;
        mgr.configure({level: "warn"});

        expect(mgr.getLevel()).toBe(defaultLevel);
      });

      it("should configure a module's level, given an enum value", function() {

        var mgr = new DebugManager();
        var level = DebugLevels.warn;
        mgr.configure({modules: {"foo": level}});

        expect(mgr.getLevel("foo")).toBe(level);
      });

      it("should configure a module's level, given a string value", function() {

        var mgr = new DebugManager();
        var level = DebugLevels.warn;
        mgr.configure({modules: {"foo": "warn"}});

        expect(mgr.getLevel("foo")).toBe(level);
      });

      it("should configure the levels of several modules", function() {

        var mgr = new DebugManager();

        mgr.configure({modules: {
          "foo": DebugLevels.warn,
          "bar": DebugLevels.info
        }});

        expect(mgr.getLevel("foo")).toBe(DebugLevels.warn);
        expect(mgr.getLevel("bar")).toBe(DebugLevels.info);
      });
    });

    describe("#testLevel(level, [module])", function() {

      describe("when no module is specified", function() {

        it("should be true when level is an enum value = the default level", function() {

          var mgr = new DebugManager();
          var defaultLevel = mgr.getLevel();

          expect(mgr.testLevel(defaultLevel)).toBe(true);
        });

        it("should be true when level is a string value = the default level", function() {

          var mgr = new DebugManager();
          mgr.setLevel(DebugLevels.warn);

          expect(mgr.testLevel("warn")).toBe(true);
        });

        it("should be false when level is an enum value > the default level", function() {

          var mgr = new DebugManager();
          var defaultLevel = mgr.getLevel();

          expect(mgr.testLevel(defaultLevel + 1)).toBe(false);
        });

        it("should be false when level is a string value '>' the default level", function() {

          var mgr = new DebugManager();
          mgr.setLevel(DebugLevels.warn);

          expect(mgr.testLevel("info")).toBe(false);
        });

        it("should be true when level is an enum value < the default level", function() {

          var mgr = new DebugManager();
          var defaultLevel = mgr.getLevel();

          expect(mgr.testLevel(defaultLevel - 1)).toBe(true);
        });

        it("should be true when level is a string value '<' the default level", function() {

          var mgr = new DebugManager();
          mgr.setLevel(DebugLevels.warn);

          expect(mgr.testLevel("error")).toBe(true);
        });
      });

      describe("when a configured module is specified", function() {

        it("should be true when level is an enum value = to the configured level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level, mid);

          expect(mgr.testLevel(level, mid)).toBe(true);
        });

        it("should be true when level is a string value = the configured level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level, mid);

          expect(mgr.testLevel("warn", mid)).toBe(true);
        });

        it("should be false when level is an enum value > the configured level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level, mid);

          expect(mgr.testLevel(level + 1, mid)).toBe(false);
        });

        it("should be false when level is a string value '>' the configured level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level, mid);

          expect(mgr.testLevel("info")).toBe(false);
        });

        it("should be true when level is an enum value < the configured level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level, mid);

          expect(mgr.testLevel(level - 1)).toBe(true);
        });

        it("should be true when level is a string value '<' the configured level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level, mid);

          expect(mgr.testLevel("error", mid)).toBe(true);
        });
      });

      describe("when an unconfigured module is specified", function() {

        it("should be true when level is an enum value = to the default level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level);

          expect(mgr.testLevel(level, mid)).toBe(true);
        });

        it("should be true when level is a string value = the default level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level);

          expect(mgr.testLevel("warn", mid)).toBe(true);
        });

        it("should be false when level is an enum value > the default level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level);

          expect(mgr.testLevel(level + 1, mid)).toBe(false);
        });

        it("should be false when level is a string value '>' the default level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level);

          expect(mgr.testLevel("info")).toBe(false);
        });

        it("should be true when level is an enum value < the default level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level);

          expect(mgr.testLevel(level - 1)).toBe(true);
        });

        it("should be true when level is a string value '<' the default level", function() {

          var mgr = new DebugManager();
          var level = DebugLevels.warn;
          var mid   = "foo";
          mgr.setLevel(level);

          expect(mgr.testLevel("error", mid)).toBe(true);
        });
      });
    });
  });
});

/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


define(function() {

  "use strict";

  /* globals describe, it, expect, beforeEach, jasmine */

  describe("pentaho.debug.manager", function() {

    function configureDebugMgrMock(localRequire) {

      function DebugMgrMock() {
        this.configure = jasmine.createSpy("configure");
      }

      localRequire.define("pentaho/debug/impl/Manager", function() { return DebugMgrMock; });
    }

    function configureDomWinMock(localRequire, href, topHRef) {

      var domWin = {
        location: {
          href: href || ""
        }
      };

      if(topHRef) {
        domWin.top = {
          location: {
            href: topHRef
          }
        }
      } else {
        domWin.top = domWin;
      }

      localRequire.define("pentaho/util/domWindow", domWin);
    }

    it("should be an instance of debug.impl.Manager class", function() {

      return require.using([
        "pentaho/debug/manager",
        "pentaho/debug/impl/Manager"
      ], function(localRequire) {

        configureDomWinMock(localRequire);

      }, function(debugMgr, DebugMgrClass) {

        expect(debugMgr instanceof DebugMgrClass).toBe(true);
      });
    });

    it("should configure the instance with the AMD configuration of pentaho/debug", function() {

      return require.using([
        "pentaho/debug/manager"
      ], function(localRequire) {

        configureDebugMgrMock(localRequire);
        configureDomWinMock(localRequire);

        localRequire.config({
          "config": {
            "pentaho/debug": {
              level: 4,
              modules: {
                "foo": 1,
                "bar": 2
              }
            }
          }
        });

      }, function(debugMgr) {

        expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
          level: 4,
          modules: {
            "foo": 1,
            "bar": 2
          }
        }]);
      });
    });

    describe("reading the default debugging level from the url", function() {

      it("should configure the instance with the AMD configuration overriding level with the url level", function() {

        return require.using([
          "pentaho/debug/manager"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=true&debugLevel=5");

          localRequire.config({
            "config": {
              "pentaho/debug": {level: 4}
            }
          });

        }, function(debugMgr) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
            level: 5
          }]);
        });
      });

      it("should use a default debugging level of 'debug' when only debug=true is specified", function() {

        return require.using([
          "pentaho/debug/manager",
          "pentaho/debug/Levels"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=true");
        }, function(debugMgr, DebugLevels) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
            level: DebugLevels.debug
          }]);
        });
      });

      it("should use a default debugging level of 'debug' when debugLevel=invalid is specified", function() {

        return require.using([
          "pentaho/debug/manager",
          "pentaho/debug/Levels"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=true&debugLevel=invalid");
        }, function(debugMgr, DebugLevels) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
            level: DebugLevels.debug
          }]);
        });
      });

      it("should ignore debugLevel when debug=true is not specified", function() {

        return require.using([
          "pentaho/debug/manager",
          "pentaho/debug/Levels"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=false&debugLevel=warn");
        }, function(debugMgr, DebugLevels) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{}]);
        });
      });

      it("should accept debugLevel as a named level", function() {

        return require.using([
          "pentaho/debug/manager",
          "pentaho/debug/Levels"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=true&debugLevel=warn");
        }, function(debugMgr, DebugLevels) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
            level: DebugLevels.warn
          }]);
        });
      });

      // ---

      it("should fallback to the top window when there is one and there is no local debug=true", function() {

        return require.using([
          "pentaho/debug/manager",
          "pentaho/debug/Levels"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=false&debugLevel=warn", "?debug=true&debugLevel=info");
        }, function(debugMgr, DebugLevels) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
            level: DebugLevels.info
          }]);
        });
      });

      it("should use a default debugging level of 'debug' when falling back to the top window and " +
          "it has no debugLevel", function() {

        return require.using([
          "pentaho/debug/manager",
          "pentaho/debug/Levels"
        ], function(localRequire) {

          configureDebugMgrMock(localRequire);
          configureDomWinMock(localRequire, "?debug=false&debugLevel=warn", "?debug=true");
        }, function(debugMgr, DebugLevels) {

          expect(debugMgr.configure.calls.argsFor(0)).toEqual([{
            level: DebugLevels.debug
          }]);
        });
      });
    });
  });
});

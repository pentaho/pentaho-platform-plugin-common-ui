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
define([
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho/type/Context -", function() {

    it("is a function", function() {
      expect(typeof Context).toBe("function");
    });

    describe("new Context()", function() {
      it("should return a context instance", function() {
        var context = new Context();
        expect(context instanceof Context).toBe(true);
      });
    });

    describe("#get(type)", function() {
      it("should return a type metadata given any of the yet unloaded standard primitive types", function() {
        var context  = new Context();

        expect(context.get("pentaho/type/value"   ).meta.id).toBe("pentaho/type/value"   );
        expect(context.get("pentaho/type/simple"  ).meta.id).toBe("pentaho/type/simple"  );
        expect(context.get("pentaho/type/complex" ).meta.id).toBe("pentaho/type/complex" );
        expect(context.get("pentaho/type/string"  ).meta.id).toBe("pentaho/type/string"  );
        expect(context.get("pentaho/type/boolean" ).meta.id).toBe("pentaho/type/boolean" );
        expect(context.get("pentaho/type/number"  ).meta.id).toBe("pentaho/type/number"  );
        expect(context.get("pentaho/type/date"    ).meta.id).toBe("pentaho/type/date"    );
        expect(context.get("pentaho/type/object"  ).meta.id).toBe("pentaho/type/object"  );
        expect(context.get("pentaho/type/function").meta.id).toBe("pentaho/type/function");
      });
    }); // #get

    describe("#getAllAsync(baseTypeId, ka)", function() {
      //var

      beforeEach(function() {
        require.undef("pentaho/service");

        require.undef("exp/foo");
        require.undef("pentaho/service!exp/foo");

        // Reset current service configuration
        require.config({
          config: {"pentaho/service": null}
        });

        // ---

        define("exp/foo", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/foo"}});
          };
        });

        // ---

        require.undef("exp/bar");
        require.undef("pentaho/service!exp/bar");

        define("exp/bar", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/bar"}});
          };
        });

        // ---

        require.undef("exp/dude");
        require.undef("pentaho/service!exp/dude");

        define("exp/dude", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/dude"}});
          };
        });

        // ---

        require.config({
          config: {
            "pentaho/service": {
              "exp/foo": "exp/thing",
              "exp/bar": "exp/thing",
              "exp/dude": "pentaho/type/value"
            }
          }
        });
      });

      it("should return a promise", function() {
        var context  = new Context();
        var p = context.getAllAsync();
        expect(p instanceof Promise).toBe(true);
      });

      it("should return all registered Types under 'pentaho/type/value' by default", function(done) {
        var context  = new Context();

        context
            .getAllAsync()
            .then(function(Mesas) {
              expect(Mesas instanceof Array).toBe(true);
              expect(Mesas.length).toBe(1);
              expect(Mesas[0].meta.id).toBe("exp/dude");
              done();
            }, done.fail);
      });

      it("should return an empty array when the specified baseType has no registrations", function(done) {
        var context  = new Context();

        context
            .getAllAsync("abcdefgh")
            .then(function(Mesas) {
              expect(Mesas instanceof Array).toBe(true);
              expect(Mesas.length).toBe(0);
              done();
            }, done.fail);
      });

      it("should return all registered Types under a given base type id", function(done) {
        var context  = new Context();

        context
          .getAllAsync("exp/thing")
          .then(function(Mesas) {
            expect(Mesas instanceof Array).toBe(true);
            expect(Mesas.length).toBe(2);

            var metaIds = Mesas.map(function(Meta) { return Meta.meta.id; });
            var iFoo = metaIds.indexOf("exp/foo");
            var iBar = metaIds.indexOf("exp/bar");
            expect(iFoo).not.toBeLessThan(0);
            expect(iBar).not.toBeLessThan(0);
            expect(iFoo).not.toBe(iBar);

            done();
          }, done.fail);
      });
    }); // #getAll

  }); // pentaho/type/Context
});
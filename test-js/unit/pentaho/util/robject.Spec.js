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
define(function() {
  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, beforeAll:false, Object:false*/

  describe("squire pentaho.util.object - ", function() {
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

    it("should return the input object, if the desired prototype is an object", function(done){
      var localRequire = require.new();

      localRequire(["pentaho/util/object"], function(O) {
        expect(O.setPrototypeOf(parrot, protoEggs)).toBe(parrot);

        localRequire.dispose();
        done();
      });
    });
  });

  describe("squire-mocking pentaho.util.object", function() {

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


    [{
      label: "setProtoProp",
      has: {
        "Object.setPrototypeOf": false,
        "Object.prototype.__proto__": true
      }
    }, {
      label: "ES5",
      has: {
        "Object.setPrototypeOf": true,
        "Object.prototype.__proto__": true
      }
    }, {
      label: "setProtoCopy",
      has: {
        "Object.setPrototypeOf": false,
        "Object.prototype.__proto__": false
      }
    }].forEach(function(conf) {

      it("should return the input object, if the desired prototype is an object - " + conf.label, function(done) {

        var localRequire = require.new()
              .define("pentaho/util/has", conf.has);

        localRequire(["pentaho/util/object"], function(O) {
          try {
            var result = O.setPrototypeOf(parrot, protoEggs);
            expect(result).toBe(parrot);

            // Dispose context
            localRequire.dispose();

            done();
          } catch(ex) {
            done.fail(ex);
          }
        }, done.fail);
      });

    });
  });


}); // pentaho.util.object

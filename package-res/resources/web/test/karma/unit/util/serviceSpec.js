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
define(["service"], function(singletonService) {
  
  describe("'service' singleton -", function() {
    it("is defined", function() {
      expect(singletonService).toBeTruthy();
      expect(typeof singletonService).toBe("object");
    });
    
    it("has a 'load' method", function() {
      expect(typeof singletonService.load).toBe("function");
    });
    
    describe("foo", function() {
      // Foo1, Foo2 and Bar test modules.
      // IFoo and IBar are test services.
      var foo1 = {}, foo2 = {}, bar = {};
      
      beforeEach(function() {
        require.undef("Foo1"); define("Foo1", foo1);
        require.undef("Foo2"); define("Foo2", foo2);
        require.undef("Bar" ); define("Bar",  bar );
        
        require.undef("service");
        require.undef("service!IFoo");
        require.undef("service!IBar");
        
        // Reset current service configuration
        require.config({
          config: {"service": null}
        });
      });
      
      it("should resolve a service with no registered providers as an empty array", function(done) {
        require.config({
          config: {
            "service": {
              "Foo1": "IFoo"
            }
          }
        });
        
        require(["service!IGugu"], function(gugus) {
          expect(gugus instanceof Array).toBe(true);
          expect(gugus.length).toBe(0);
          done();
        });
      });
      
      it("should resolve a service with one registered provider as an array with that registered module", function(done) {
        require.config({
          config: {
            "service": {
              "Foo1": "IFoo"
            }
          }
        });
        
        require(["service!IFoo"], function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(1);
          expect(foos[0]).toBe(foo1);
          done();
        });
      });
      
      it("should resolve a service with two registered providers as an array with those two registered modules", function(done) {
        require.config({
          config: {
            "service": {
              "Foo1": "IFoo",
              "Foo2": "IFoo"
            }
          }
        });
        
        require(["service!IFoo"], function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(2);
          expect(foos.indexOf(foo1) >= 0).toBe(true);
          expect(foos.indexOf(foo2) >= 0).toBe(true);
          done();
        });
      });
      
      it("should resolve a service to the correct modules even when there are other registered services", function(done) {
        require.config({
          config: {
            "service": {
              "Bar": "IBar"
            }
          }
        });
        
        require.config({
          config: {
            "service": {
              "Foo1": "IFoo",
              "Foo2": "IFoo"
            }
          }
        });
        
        require(["service!IFoo", "service!IBar"], function(foos, bars) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(2);
          expect(foos.indexOf(foo1) >= 0).toBe(true);
          expect(foos.indexOf(foo2) >= 0).toBe(true);
          
          expect(bars instanceof Array).toBe(true);
          expect(bars.length).toBe(1);
          expect(bars[0]).toBe(bar);
          
          done();
        });
      });
      
      it("should ignore config entries with an empty module id and resolve the logical module as an empty array", function(done) {
        require.config({
          config: {
            "service": {
              "": "IFoo"
            }
          }
        });
        
        require(["service!IFoo"], function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(0);
          done();
        });
      });
      
      it("should ignore config entries with an empty logical module and resolve it as an empty array", function(done) {
        require.config({
          config: {
            "service": {
              "Foo": ""
            }
          }
        });
        
        require(["service!"], function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(0);
          done();
        });
      });
    });
  });
});

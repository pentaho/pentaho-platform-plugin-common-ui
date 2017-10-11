/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/util/BitSet"
], function(BitSet) {
  "use strict";

  describe("pentaho.util.BitSet", function() {

    describe("on instantiation", function() {

      it("clears all bits by default", function() {
        var bits = new BitSet();
        expect(bits.is(0)).toBe(true);
      });

      it("sets the bits to the supplied argument", function() {
        var bits = new BitSet(42);
        expect(bits.is(42)).toBe(true);
      });
    }); // constructor


    describe("#isEmpty", function() {

      it("should return `true` if all bits are clear", function() {
        var bits = new BitSet(0);
        expect(bits.isEmpty).toBe(true);
      });

      it("should return `true` if some bits are set", function() {
        var bits = new BitSet(42);
        expect(bits.isEmpty).toBe(false);
      });
    });// #isEmpty


    describe("#get", function() {
      it("should return the bits that are set", function() {
        [0, ~0, 1, 234].forEach(function(v) {
          var bits = new BitSet(v);
          expect(bits.get()).toBe(v);
        });
      });
    }); //#get


    describe("#is", function() {

      it("should indicates if the current state is equal to a given mask", function() {

        [0, ~0, 1, 234, 715827882].forEach(function(v) {

          var bits = new BitSet(v);

          expect(bits.is(v)).toBe(true);
          expect(bits.is(~v)).toBe(false)
        });
      });

    }); //#is


    describe("#set", function() {

      it("should set all set bits when no argument is passed", function() {
        [0, ~0, 1, 234, 715827882].forEach(function(v) {
          var bits = new BitSet(v);
          bits.set();
          expect(bits.is(~0)).toBe(true);
        });
      });

      it("should set the bits to the specified value, when all bits are previously clear ", function() {

        [0, ~0, 1, 234, 715827882].forEach(function(v) {

          var bits = new BitSet(0);
          bits.set(v);

          expect(bits.is(v)).toBe(true);
        });
      });

      it("should set the bits to the specified value, in addition to the bits previously set", function() {

        [0, ~0, 1, 234].forEach(function(v) {

          var bits = new BitSet(715827882);

          bits.set(v);
          expect(bits.get()).toBe(v | 715827882);

          // Setting twice should have no effect
          bits.set(v);
          expect(bits.get()).toBe(v | 715827882);

        });
      });
    }); //#set


    describe("#clear", function() {

      it("should clear all set bits when no argument is passed", function() {
        [0, ~0, 1, 234, 715827882].forEach(function(v) {
          var bits = new BitSet(v);
          bits.clear();
          expect(bits.is(0)).toBe(true);
        });
      });

      it("should clear the bits associated with the specified mask, when all bits are previously set ", function() {

        [0, ~0, 1, 234, 715827882].forEach(function(v) {

          var bits = new BitSet(~0);
          bits.clear(v);

          expect(bits.get()).toBe(~v);
        });
      });

      it("should clear the bits associated with the specified mask", function() {

        [0, ~0, 1, 234].forEach(function(v) {

          var bits = new BitSet(715827882);

          bits.clear(v);
          expect(bits.get()).toBe(715827882 & ~v);

          // Clearing twice should have no effect
          bits.clear(v);
          expect(bits.get()).toBe(715827882 & ~v);

        });
      });
    }); //#clear


    describe("#isSubsetOf", function() {

      it("should return `false` when the current state has no overlap with the mask", function() {
        [0, ~0, 1, 234, 715827882].forEach(function(mask) {
          var bits = new BitSet(~mask);
          expect(bits.isSubsetOf(mask)).toBe(false);
        });
      });

      it("should return `true` when the current state is equal to a non-empty mask", function() {
        [~0, 1, 234, 715827882].forEach(function(mask) {
          var bits = new BitSet(mask);
          expect(bits.isSubsetOf(mask)).toBe(true);
        });
      });

      it("should return `false` when the current state has bits set outside the mask", function() {
        [1, 234, 1232345].forEach(function(mask) {
          var bits = new BitSet(mask | 715827882);
          // current state has more bits set than the mask (both inside and outside the mask)
          expect(bits.isSubsetOf(mask)).toBe(false);
        });
      });

      it("should return `true` when the current state has bits set inside the mask", function() {
        [1, 234, 1232345].forEach(function(mask) {
          var bits = new BitSet(mask);
          // current state has fewer bits set than the mask (both inside and outside the mask)
          expect(bits.isSubsetOf(mask | 715827882)).toBe(true);
        });
      });

    }); //#isSubsetOf


  });
});
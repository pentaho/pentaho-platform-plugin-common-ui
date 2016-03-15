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
  "pentaho/data/filter",
  "pentaho/visual/base/types/selectionModes"
], function(filter, selectionModes) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, xit:false */

  describe("pentaho.visual.base.types.selectionModes -", function() {
    var sales12k;
    var inStock;
    var myFilter;
    beforeEach(function() {
      sales12k = new filter.IsIn("sales", [12000]);
      inStock = new filter.IsEqual("inStock", true);
      myFilter = new filter.And([sales12k, inStock]);
    });

    describe("REPLACE -", function() {
      it("should discard current selection and return input selection", function() {
        var result = selectionModes.REPLACE(sales12k, inStock);

        expect(result).toBe(inStock);
      });
    });

    describe("TOGGLE -", function() {
      xit("should select elements from input selection and unselect elements from current selection", function() {
        // TODO 
      });
    });

    describe("ADD -", function() {
      it("should add the input selection to the current selection", function() {
        var result = selectionModes.ADD(sales12k, inStock);

        expect(result.type).toBe("or");
      });
    });

    describe("REMOVE -", function() {
      it("should remove the input selection from the current selection", function() {
        var result = selectionModes.REMOVE(sales12k, inStock);

        expect(result.type).toBe("and");
      });
    });

  }); // #pentaho.visual.base.types.selectionModes
});

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
  "pentaho/data/Filter",
  "pentaho/data/Table",
  "./filter/_dataSpecProductSalesInStock"
], function(Filter, Table, dataSpec) {
  "use strict";

  describe("pentaho.data.Filter", function() {

    var data;
    beforeEach(function() {
      data = new Table(dataSpec);
    });

    describe(".create ", function() {
      it("takes in a spec", function() {
        var spec = {
          "$and": [
            {"sales": {"$eq": 12000}},
            {"$not": {"product": {"$in": ["A", "B"]}}}
          ]
        };

        var filter = Filter.create(spec);
        expect(filter.type).toBe("$or");
        expect(filter.operands.length).toBe(1);
        expect(filter.operands[0].type).toBe("$and");
        expect(filter.operands[0].operands.length).toBe(2);
        expect(filter.operands[0].operands[0].type).toBe("$eq");
        expect(filter.operands[0].operands[0].value).toBe(12000);
        expect(filter.operands[0].operands[1].type).toBe("$not");
        expect(filter.operands[0].operands[1].operand.type).toBe("$in");
        expect(filter.operands[0].operands[1].operand.value).toEqual(["A", "B"]);
      });

      it("also accepts no arguments", function() {
        var filter = Filter.create();
        expect(filter.type).toBe("$or");
        expect(filter.operands.length).toBe(0);
      });

      it("does not simplify the filter tree when taking in a spec", function() {
        var spec = {
          "$not": {
            "$and": [
              {"sales": 12000},
              {"$not": {"product": {"$in": ["A", "B"]}}}
            ]
          }
        };

        var filter = Filter.create(spec);
        expect(filter.type).toBe("$or");
        expect(filter.operands.length).toBe(1);
        expect(filter.operands[0].type).toBe("$not");
        expect(filter.operands[0].operand.type).toBe("$and");
        expect(filter.operands[0].operand.operands.length).toBe(2);
        expect(filter.operands[0].operand.operands[0].type).toBe("$eq");
        expect(filter.operands[0].operand.operands[1].type).toBe("$not");
        expect(filter.operands[0].operand.operands[1].operand.type).toBe("$in");
      });

    }); // #create

  });
});
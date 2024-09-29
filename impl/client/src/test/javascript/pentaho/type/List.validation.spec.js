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

define([
  "pentaho/type/List",
  "pentaho/type/Number"
], function(List, PentahoNumber) {

  "use strict";

  describe("pentaho.type.List", function() {

    var NumberList;

    beforeAll(function() {
      NumberList = List.extend({
        $type: {of: PentahoNumber}
      });
    });

    describe("#validate() -", function() {

      it("should call #validate() on each of its elements", function() {

        var list = new NumberList([1, 2, 3]);

        spyOn(list.at(0), "validate").and.returnValue(true);
        spyOn(list.at(1), "validate").and.returnValue(true);
        spyOn(list.at(2), "validate").and.returnValue(true);

        list.validate();

        expect(list.at(0).validate).toHaveBeenCalledTimes(1);
        expect(list.at(1).validate).toHaveBeenCalledTimes(1);
        expect(list.at(2).validate).toHaveBeenCalledTimes(1);
      });
    });
  });
});

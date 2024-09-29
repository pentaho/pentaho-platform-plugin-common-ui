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


define([ 'common-ui/prompting/parameters/ParameterGroup'  ], function(ParameterGroup) {

  describe("ParameterGroup", function() {
    var parameterGroup;
    it("should init a ParameterGroup", function() {
      parameterGroup = ParameterGroup();
      expect(parameterGroup).toEqual(parameterGroup);
    })
  });
});

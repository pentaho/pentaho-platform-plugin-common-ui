/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



define([ 'common-ui/prompting/parameters/ParameterValue'  ], function(ParameterValue) {

  describe("ParameterValue", function() {
    var parameterValue;
    it("should init a ParameterValue", function() {
      parameterValue = ParameterValue();
      expect(parameterValue).toEqual(parameterValue);
    })
  });
});

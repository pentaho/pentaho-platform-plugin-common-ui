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

  describe("pentaho.visual.models", function() {

    it("should be possible to load all models", function() {

      require.using(["pentaho/module/subtypesOf!pentaho/visual/Model"], function() {
        // NOOP
      });
    });

    it("should be possible to load the sample calc model", function() {

      require.using(["pentaho/visual/samples/calc/Model"], function() {
        // NOOP
      });
    });
  });
});

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



define(['./CompositeComponent', 'common-ui/jquery-clean'], function(CompositeComponent, $) {

  return CompositeComponent.extend({
    getClassFor: function (component) {
      if (!component.param) {
        return;
      }
      return 'parameter';
    }
  });

});

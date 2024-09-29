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

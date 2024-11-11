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
  "./impl/Service"
], function(ThemeService) {

  /**
   * The `pentaho/theme/service` module is the singleton theme service of the Theming API.
   *
   * @name service
   * @memberOf pentaho.theme
   * @type {pentaho.theme.IService}
   * @amd pentaho/theme/service
   */
  return new ThemeService();
});
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
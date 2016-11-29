/*!
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright (c) 2002-2013 Pentaho Corporation..  All rights reserved.
 */

package org.pentaho.common.ui.services;

import org.pentaho.common.ui.IntegrationTestConstants;
import org.pentaho.platform.api.usersettings.IUserSettingService;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.core.system.StandaloneSession;
import org.pentaho.test.platform.engine.core.BaseTest;

@SuppressWarnings( { "all" } )
public class UserSettingServiceIT extends BaseTest {

  public String getSolutionPath() {
    return IntegrationTestConstants.SOLUTION_PATH;
  }

  public void setUp() {
    super.setUp();
  }

  public void testUserSetting() throws Exception {

    StandaloneSession session = new StandaloneSession();
    PentahoSessionHolder.setSession( session );

    IUserSettingService settingsService =
        PentahoSystem.get( IUserSettingService.class, PentahoSessionHolder.getSession() );
    settingsService.setUserSetting( "setting1", "fred" );

    UserSettingService svc = new UserSettingService();
    // this should return an error
    String json = svc.getUserSettingsJson( null );
    assertTrue( json.indexOf( "\"class\":\"org.pentaho.common.ui.services.StatusMessage\"" ) != -1 );

    // this should return an error
    Setting[] settings = svc.getUserSettings( "bogus" );
    assertTrue( settings != null );
    assertEquals( 0, settings.length );
    json = svc.getUserSettingsJson( "bogus" );
    System.out.println( json );
    assertEquals( "[]", json );

    json = svc.setUserSettingJson( "setting1", "value1" );
    System.out.println( json );
    assertTrue( json.indexOf( "\"class\":\"org.pentaho.common.ui.services.StatusMessage\"" ) != -1 );
    assertTrue( json.indexOf( "SUCCESS" ) != -1 );

    settings = svc.getUserSettings( "setting1" );
    assertTrue( settings != null );
    assertEquals( 1, settings.length );
    assertEquals( "setting1", settings[0].getName() );
    assertEquals( "value1", settings[0].getValue() );

    json = svc.getUserSettingsJson( "setting1" );
    System.out.println( json );
    assertTrue( json.indexOf( "\"class\":\"org.pentaho.common.ui.services.StatusMessage\"" ) == -1 );

    json = svc.setUserSettingJson( "setting2", "value2" );

    json = svc.getUserSettingsJson( "setting1,setting2" );
    settings = svc.getUserSettings( "setting1,setting2" );
    assertTrue( settings != null );
    assertEquals( 2, settings.length );
    assertEquals( "setting1", settings[0].getName() );
    assertEquals( "value1", settings[0].getValue() );
    assertEquals( "setting2", settings[1].getName() );
    assertEquals( "value2", settings[1].getValue() );

    // generate an error during a set
    json = svc.setUserSettingJson( "setting2", "error" );
    System.out.println( json );
    assertTrue( json.indexOf( "ERROR_0003_SETTINGS_WRITE" ) != -1 );

  }
}

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

package org.pentaho.common.ui;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.pentaho.platform.api.engine.IPentahoSession;
import org.pentaho.platform.api.usersettings.IUserSettingService;
import org.pentaho.platform.api.usersettings.pojo.IUserSetting;
import org.pentaho.platform.repository.usersettings.pojo.UserSetting;

public class TestUserSettingService implements IUserSettingService {

  private Map<String, IUserSetting> settings = new HashMap<String, IUserSetting>();

  @Override
  public void deleteUserSettings() {
    // TODO Auto-generated method stub
    settings.clear();
  }

  @Override
  public IUserSetting getGlobalUserSetting( String arg0, String arg1 ) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<IUserSetting> getGlobalUserSettings() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IUserSetting getUserSetting( String arg0, String arg1 ) {

    return settings.get( arg0 );
  }

  @Override
  public List<IUserSetting> getUserSettings() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void setGlobalUserSetting( String arg0, String arg1 ) {
    // TODO Auto-generated method stub

  }

  @Override
  public void setUserSetting( String settingName, String settingValue ) {

    if ( settingValue.equals( "error" ) ) { //$NON-NLS-1$
      // generate an error
      throw new IllegalArgumentException();
    }

    UserSetting setting = new UserSetting( 0, 0, "", settingName, settingValue ); //$NON-NLS-1$
    settings.put( settingName, setting );
  }

  @Override
  public void init( IPentahoSession arg0 ) {
    // TODO Auto-generated method stub

  }

}

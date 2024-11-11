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

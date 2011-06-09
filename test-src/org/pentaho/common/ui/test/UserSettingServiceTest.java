package org.pentaho.common.ui.test;

import org.pentaho.common.ui.services.Setting;
import org.pentaho.common.ui.services.UserSettingService;
import org.pentaho.platform.api.engine.ISystemSettings;
import org.pentaho.platform.api.usersettings.IUserSettingService;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.core.system.StandaloneSession;
import org.pentaho.test.platform.engine.core.BaseTest;

@SuppressWarnings({"all"})
public class UserSettingServiceTest extends BaseTest {

  private static final String SOLUTION_PATH = "test-res/pentaho-solutions";
  public String getSolutionPath() {
       return SOLUTION_PATH;  
  }

  public void setUp()
  {
    super.setUp();
  }

  public void testUserSetting() throws Exception {
 
    StandaloneSession session = new StandaloneSession();
    PentahoSessionHolder.setSession(session);
    
    IUserSettingService settingsService = PentahoSystem.get(IUserSettingService.class, PentahoSessionHolder.getSession());
    settingsService.setUserSetting("setting1", "fred");
    
    UserSettingService svc = new UserSettingService();
    // this should return an error
    String json = svc.getUserSettingsJson(null);
    assertTrue( json.indexOf("\"class\":\"org.pentaho.common.ui.services.StatusMessage\"") != -1 );
    
    // this should return an error
    Setting settings[] = svc.getUserSettings("bogus");
    assertTrue(settings != null);
    assertEquals(0,settings.length);
    json = svc.getUserSettingsJson("bogus");
    System.out.println(json);
    assertEquals( "[]", json);

    json = svc.setUserSettingJson("setting1", "value1");
    System.out.println(json);
    assertTrue( json.indexOf("\"class\":\"org.pentaho.common.ui.services.StatusMessage\"") != -1 );
    assertTrue( json.indexOf("SUCCESS") != -1 );
    
    settings = svc.getUserSettings("setting1");
    assertTrue(settings != null);
    assertEquals(1,settings.length);
    assertEquals("setting1",settings[0].getName());
    assertEquals("value1",settings[0].getValue());
    
    json = svc.getUserSettingsJson("setting1");
    System.out.println(json);
    assertTrue( json.indexOf("\"class\":\"org.pentaho.common.ui.services.StatusMessage\"") == -1 );

    json = svc.setUserSettingJson("setting2", "value2");

    json = svc.getUserSettingsJson("setting1,setting2");
    settings = svc.getUserSettings("setting1,setting2");
    assertTrue(settings != null);
    assertEquals(2,settings.length);
    assertEquals("setting1",settings[0].getName());
    assertEquals("value1",settings[0].getValue());
    assertEquals("setting2",settings[1].getName());
    assertEquals("value2",settings[1].getValue());

    // generate an error during a set
    json = svc.setUserSettingJson("setting2", "error");
    System.out.println(json);
    assertTrue( json.indexOf("ERROR_0003_SETTINGS_WRITE") != -1 );
    

  }
}

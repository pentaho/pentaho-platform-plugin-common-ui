package org.pentaho.common.ui.test;

import java.io.File;

import org.pentaho.common.ui.services.LocalizationService;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.plugin.services.pluginmgr.PluginResourceLoader;
import org.pentaho.test.platform.engine.core.MicroPlatform;

import junit.framework.TestCase;

@SuppressWarnings("nls")
public class LocalizationServiceTest extends TestCase {

  MicroPlatform mp;

  public LocalizationServiceTest() throws ClassNotFoundException, ObjectFactoryException {
    mp = new MicroPlatform("");
    mp.define(IPluginResourceLoader.class, TstPluginResourceLoader.class);
  }

  public static class TstPluginResourceLoader extends PluginResourceLoader {
    @Override
    protected PluginClassLoader getOverrideClassloader() {
      return new PluginClassLoader(new File("test-res/pentaho-solutions/system/common-ui"), getClass().getClassLoader());
    }
  };

  public void testLocalizationService() {
    
    LocalizationService svc = new LocalizationService();
    
    String json = svc.getJSONBundle();
    
    assertNotNull(json);
    System.out.println(json);
    assertEquals( "{\"", json.substring(0,2) );
    
  }
  
}

package org.pentaho.common.ui.services;


import java.util.ResourceBundle;

import org.json.JSONException;
import org.json.JSONObject;
import org.pentaho.common.ui.Const;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.engine.core.system.PentahoSystem;

/**
 * This class makes a message bundle available as a JSON string.
 * This is designed to be used as a web service to allow thin-clients
 * to retrieve message bundles from the server
 * @author jamesdixon
 *
 */
public class LocalizationService
{

  public static final String SETTINGS_FILE = Const.PLUGIN_ID + "/settings.xml"; //$NON-NLS-1$  
  
  public LocalizationService()
    {
    }

  /*
   * TODO: JD. add the ability to get an arbitraty bundle from any plugin or any core package
   */
  
    private ResourceBundle getBundle(String name) {
        IPluginResourceLoader resLoader = PentahoSystem.get(IPluginResourceLoader.class, null);
        ResourceBundle bundle = resLoader.getResourceBundle(LocalizationService.class, name);
        String cache = PentahoSystem.getSystemSetting(SETTINGS_FILE, "cache-messages", "false"); //$NON-NLS-1$ //$NON-NLS-2$
        // Check whether we want to clear the bundle cache which is useful to test resource file changes
        if (cache != null && cache.equals("false")) { //$NON-NLS-1$
            ResourceBundle.clearCache();
        }
        return bundle;
    }

    /**
     * Returns the message bundle
     * @return
     */
    public ResourceBundle getBundle() 
    {
        return getBundle("resources/messages/messages"); //$NON-NLS-1$
    }

    public ResourceBundle getHelpBundle() {
        return getBundle("resources/help/messages"); //$NON-NLS-1$
    }
    
    /**
     * @return the default message bundle as a JSON string
     */
    public String getJSONBundle()
    {
        try {
            return getJsonForBundle(getBundle());
        } catch (Exception e)
        {
            throw new RuntimeException(e.toString(), e);
        }
    }

    private String getJsonForBundle(ResourceBundle bundle) throws JSONException {
        JSONObject cat = new JSONObject();
        for (String key : bundle.keySet()) {
            cat.put(key, bundle.getString(key));
        }
        return cat.toString();
    }

    /**
     * @return the help message bundle as a JSON string
     */
    public String getHelpJSONBundle() {
        try {
            return getJsonForBundle(getHelpBundle());
        } catch (Exception e) {
            throw new RuntimeException(e.toString(), e);
        }
    }
}

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


package org.pentaho.config.impl;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;

import java.util.Dictionary;
import java.util.Hashtable;

public class ConfigEnabler implements BundleActivator {
  private Configuration configuration;

  public void start( BundleContext bundleContext ) throws Exception {
    ServiceReference configurationAdminReference =
        bundleContext.getServiceReference( ConfigurationAdmin.class.getName() );

    if ( configurationAdminReference != null ) {
      ConfigurationAdmin confAdmin = (ConfigurationAdmin) bundleContext.getService( configurationAdminReference );

      // check if an existing fileinstall configuration already watches the ${karaf.base}/config folder
      // if so, there's no need to create a new configuration
      Configuration[] existingConfigs = confAdmin.listConfigurations( "(service.factoryPid=org.apache.felix.fileinstall)" );
      if ( existingConfigs != null ) {
        for ( Configuration existingConfig : existingConfigs ) {
          final Dictionary<String, Object> existingConfigProperties = existingConfig.getProperties();
          final Object fileInstallDir = existingConfigProperties.get( "felix.fileinstall.dir" );
          if ( fileInstallDir != null && fileInstallDir.equals( "${karaf.base}/config" ) ) {
            this.configuration = existingConfig;

            // nothing to do, we can leave
            return;
          }
        }
      }

      this.configuration = confAdmin.createFactoryConfiguration( "org.apache.felix.fileinstall", null );

      Dictionary<String, String> properties = new Hashtable<>();

      properties.put( "felix.fileinstall.dir", "${karaf.base}/config" );
      properties.put( "felix.fileinstall.tmpdir", "${karaf.data}/generated-bundles" );
      properties.put( "felix.fileinstall.poll", "3000" );
      properties.put( "felix.fileinstall.active.level", "80" );
      properties.put( "felix.fileinstall.log.level", "3" );

      // limit bundles to be refreshed
      // this folder is intended only for deployment of client side configuration files
      // no need to check for optional imports and fragments
      // https://issues.apache.org/jira/browse/FELIX-4328
      properties.put( "felix.fileinstall.optionalImportRefreshScope", "none" );
      properties.put( "felix.fileinstall.fragmentRefreshScope", "none" );

      this.configuration.update( properties );
    }
  }

  public void stop( BundleContext bundleContext ) throws Exception {
    if ( this.configuration != null ) {
      this.configuration.delete();
      this.configuration = null;
    }
  }
}

/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU General Public License, version 2 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/gpl-2.0.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 *
 * Copyright 2006 - 2013 Pentaho Corporation.  All rights reserved.
 */

package org.pentaho.common.ui.services;

import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

/**
 * ChartSeriesColorContentGenerator is used to get color mappings for members in a chart series. This allows admins to
 * assign colors to specific category members or measures. For example, Territory:NA is always Red or Measure:Sales is
 * always Blue.
 * 
 * Mappings are defined in a JSON file. Since we support two models today in Pentaho, then there is a relational.json
 * and mdx.json to store color mappings for the respective model type.
 * 
 * The MDX type JSON structure is Catalog->Level->Member->Color
 * 
 * This information is provided to a visualization and it is up to to the visualization to implement the rules on how
 * the color information is used. For example, a single chart series may contain multiple members such as NA~2003~Sales.
 * The visualization will determine which member's color to apply to this series.
 * 
 * This service was not designed to provide color information for multiple members in a series or for specific cells.
 * 
 * @author benny
 * 
 */
public class ChartSeriesColorContentGenerator extends SimpleContentGenerator {

  private static final long serialVersionUID = -2308151094352245100L;

  public static final String TYPE_RELATIONAL = "relational";

  public static final String TYPE_MDX = "mdx";

  private Log logger = LogFactory.getLog( ChartSeriesColorContentGenerator.class );

  @Override
  public void createContent( OutputStream output ) throws Exception {

    IParameterProvider params = parameterProviders.get( IParameterProvider.SCOPE_REQUEST );
    String type = params.getStringParameter( "type", "mdx" ); //$NON-NLS-1$
    type = type.toLowerCase();

    if ( !type.equals( TYPE_RELATIONAL ) && !type.equals( TYPE_MDX ) ) {
      throw new IllegalStateException( "Unknown chart series color model type: " + type );
    }

    IPluginResourceLoader resLoader = PentahoSystem.get( IPluginResourceLoader.class, null );
    String json = null;
    try {
      json =
          resLoader.getResourceAsString( ChartSeriesColorContentGenerator.class, "resources/chartseriescolor/" + type
              + ".json" );
      if ( json == null ) {
        json = "{}"; // Empty
      }
    } catch ( UnsupportedEncodingException e ) {
      throw new RuntimeException( e.toString(), e );
    }
    output.write( json.getBytes() );
  }

  @Override
  public String getMimeType() {
    return "application/json"; //$NON-NLS-1$
  }

  @Override
  public Log getLogger() {
    return logger;
  }
}

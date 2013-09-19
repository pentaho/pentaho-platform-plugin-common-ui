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

import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.InvalidParameterException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.platform.api.engine.IContentGenerator;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.ISolutionFile;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.api.repository2.unified.IUnifiedRepository;
import org.pentaho.platform.api.repository2.unified.RepositoryFile;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.BaseContentGenerator;
import org.pentaho.platform.repository2.unified.fileio.RepositoryFileInputStream;
import org.pentaho.platform.util.web.MimeHelper;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;

/**
 * SolutionUrlContentGenerator. Provides a way of URL addressing content within
 * the solution repository, and allowing content to address other content
 * using relative URLs.
 * 
 * Executable content (PRPTs, action sequences etc) is supported via  
 * content generators, so other executable content can be plugged-in. 
 * Parameters on the URL will be passed to the content generator.
 * 
 * Static content can be accessed provided that it is located in a directory
 * structure within the solution called 'web', e.g. mysolution/web/*. 
 * Sub-directories of 'web' are supported.
 *
 * Assuming that this content generator is mapped with an id of 'repo' 
 * Old URL: http://localhost:8080/pentaho/ViewAction?solution=steel-wheels&path=dashboards&action=sales_overtime_all.xaction&dept=Sales
 * New URL: http://localhost:8080/pentaho/content/repo/steel-wheels/dashboards/sales_overtime_all.xaction?dept=Sales
 * If the 'steel-wheels' solution has a 'web' directory, e.g. containing images you can access them like this:
 * http://localhost:8080/pentaho/content/repo/steel-wheels/web/logo.png
 * Content can access static files using relative URLs. So sales_overtime_all.xaction can access the logo using:
 * ../web/logo.png
 * 
 * @author jamesdixon
 *
 */
public class SolutionUrlContentGenerator extends BaseContentGenerator {

  private static final long serialVersionUID = 8445693289282403228L;

  public static final int TYPE_UNKNOWN = 0;
  
  public static final int TYPE_STATIC = 1;
  
  public static final int TYPE_PLUGIN = 2;
  
  @Override
  public void createContent() throws Exception {
    OutputStream out = null;
    if( outputHandler == null ) {
      error( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0004_NO_OUTPUT_HANDLER") ); //$NON-NLS-1$
      throw new InvalidParameterException( Messages.getString("SolutionUrlContentGenerator.ERROR_0004_NO_OUTPUT_HANDLER") );  //$NON-NLS-1$
    }

    IParameterProvider params = parameterProviders.get( "path" ); //$NON-NLS-1$
    
    String urlPath = params.getStringParameter("path", null); //$NON-NLS-1$

    ActionInfo pathInfo = ActionInfo.parseActionString(urlPath);
    
    if( pathInfo == null ) {
      // there is no path so we don't know what to return
      error( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0001_NO_FILEPATH") ); //$NON-NLS-1$
      return;
    }
    
    if( urlPath.startsWith("system/") ) { //$NON-NLS-1$
      // don't allow access into the system solution
      error( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0005_BAD_FILEPATH") ); //$NON-NLS-1$
      return;
    }
    
    if( PentahoSystem.debug ) debug( "SolutionResourceContentGenerator urlPath="+urlPath); //$NON-NLS-1$
    int type = TYPE_UNKNOWN;

    // work out what this thing is
    String filename = pathInfo.getActionName();
    String extension = ""; //$NON-NLS-1$
    int index = filename.lastIndexOf('.');
    if (index != -1) {
      extension = filename.substring(index+1);
    }
    
    // is this a plugin file type?
    if( type == TYPE_UNKNOWN ) {
      IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, userSession );
      if( pluginManager != null ) {
        IContentGenerator contentGenerator = null;
        try {
          contentGenerator = pluginManager.getContentGenerator(extension, null);
        } catch (NoSuchBeanDefinitionException e) {
          // could not find a content generator to use for this extension, leave contentGenerator null
          contentGenerator = null;
        }
        if( contentGenerator != null ) {
          // set up the path parameters
          IParameterProvider requestParams = parameterProviders.get( IParameterProvider.SCOPE_REQUEST );
          if( requestParams instanceof SimpleParameterProvider ) {
            ((SimpleParameterProvider) requestParams).setParameter("solution", pathInfo.getSolutionName()); //$NON-NLS-1$
            ((SimpleParameterProvider) requestParams).setParameter("path", pathInfo.getPath()); //$NON-NLS-1$
            ((SimpleParameterProvider) requestParams).setParameter("name", pathInfo.getActionName()); //$NON-NLS-1$
            ((SimpleParameterProvider) requestParams).setParameter("action", pathInfo.getActionName()); //$NON-NLS-1$
          }
          // delegate over to the content generator for this file type
          contentGenerator.setCallbacks( callbacks );
          contentGenerator.setInstanceId( instanceId );
          contentGenerator.setItemName( itemName );
          contentGenerator.setLoggingLevel( loggingLevel );
          contentGenerator.setMessagesList( messages );
          contentGenerator.setOutputHandler( outputHandler );
          contentGenerator.setParameterProviders( parameterProviders );
          contentGenerator.setSession( userSession );
          contentGenerator.setUrlFactory( urlFactory );
          contentGenerator.createContent();
          return;
        }
      }
    }

    // get the mime-type
    String mimeType = MimeHelper.getMimeTypeFromFileName(filename);
    if( mimeType != null && mimeType.equals( MimeHelper.MIMETYPE_XACTION ) ) {
      mimeType = null;
    }
    
    // is this a static file type?
    if( ( pathInfo.getPath().startsWith( "resources/web/" ) || pathInfo.getPath().equals("resources/web") ) && mimeType != null ) { //$NON-NLS-1$ //$NON-NLS-2$
      // this is a static file type
      type = TYPE_STATIC;
    }

    if( type == TYPE_UNKNOWN ) {
      // should not handle this file type
      warn( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0002_CANNOT_HANDLE_TYPE", urlPath ) ); //$NON-NLS-1$
      return;
    }

    IContentItem contentItem = outputHandler.getOutputContentItem( "response", "content", instanceId, mimeType ); //$NON-NLS-1$ //$NON-NLS-2$
    if( contentItem == null ) {
      error( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0006_NO_OUTPUT_ITEM") ); //$NON-NLS-1$
      throw new InvalidParameterException( Messages.getString("SolutionUrlContentGenerator.ERROR_0006_NO_OUTPUT_ITEM") );  //$NON-NLS-1$
    }
    
    contentItem.setMimeType( mimeType );
    
    out = contentItem.getOutputStream( itemName );
    if( out == null ) {
      error( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0007_NO_OUTPUT_STREAM") ); //$NON-NLS-1$
      throw new InvalidParameterException( Messages.getString("SolutionUrlContentGenerator.ERROR_0007_NO_OUTPUT_STREAM") );  //$NON-NLS-1$
    }
    
    // TODO support cache control settings
    
    IUnifiedRepository repo = PentahoSystem.get(IUnifiedRepository.class, null);
    RepositoryFile file = repo.getFile(urlPath, false);
    InputStream in = new RepositoryFileInputStream(file);

    if( in == null ) {
      error( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0003_RESOURCE_NOT_FOUND", urlPath ) ); //$NON-NLS-1$
      return;
    }
    
    try {
      byte buffer[] = new byte[4096];
      int n = in.read(buffer);
      while( n != -1 ) {
        out.write(buffer, 0, n);
        n = in.read(buffer);
      }
    } finally {
      out.close();
    }
    
  }

  @Override
  public Log getLogger() {
    return LogFactory.getLog(SolutionUrlContentGenerator.class);
  }


}

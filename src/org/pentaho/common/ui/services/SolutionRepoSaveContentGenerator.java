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
 * Copyright 2008 Pentaho Corporation.  All rights reserved. 
 * 
 */
package org.pentaho.common.ui.services;

import java.io.IOException;
import java.io.OutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.platform.api.engine.IContentInfo;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

/**
 * Saves state to the solution repository.
 * This content generator requires the following parameters:
 *     filepath - the path within the solution repository to save to
 *     state - the state (text)
 *     type - the content type being saved
 *     replace - (true/false) whether to replace an existing file. Defaults to false.
 *     title - optional title
 *     description - optional description
 * @author jamesdixon
 *
 */
public class SolutionRepoSaveContentGenerator extends SimpleContentGenerator {

  private static final long serialVersionUID = 8445693289282403228L;

  /**
   * Saves state into the solution repository
   */
  @Override
  public void createContent(OutputStream out) throws Exception {

    IParameterProvider request = parameterProviders.get( "request" ); //$NON-NLS-1$
    // make sure we have a path to save to
    String fullPath = request.getStringParameter("filepath", null); //$NON-NLS-1$
    if( fullPath == null ) {
      errorMessage( Messages.getErrorString("SolutionRepo.ERROR_0001_NO_FILEPATH"), out ); //$NON-NLS-1$
      return;
    }
    // make sure we have state to save
    String state = request.getStringParameter("state", null); //$NON-NLS-1$
    if( state == null ) {
      errorMessage( Messages.getErrorString("SolutionRepo.ERROR_0002_NO_STATE"), out ); //$NON-NLS-1$
      return;
    }
    // make sure we know the type of the file we are saving
    String type = request.getStringParameter("type", null); //$NON-NLS-1$
    if( type == null ) {
      errorMessage( Messages.getErrorString("SolutionRepo.ERROR_0007_NO_TYPE"), out ); //$NON-NLS-1$
      return;
    }
    boolean replace = request.getStringParameter("replace", "false").toLowerCase().equals("true"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

    // make sure the path is good
    ActionInfo info = ActionInfo.parseActionString( fullPath );
    if( info == null ) {
      errorMessage( Messages.getErrorString("SolutionRepo.ERROR_0003_BAD_PATH", fullPath), out ); //$NON-NLS-1$
      return;
    }

    ISolutionRepository repo = PentahoSystem.get(ISolutionRepository.class, userSession);
    
    // create the state file to save
    Document doc = DocumentHelper.createDocument();
    Element root = doc.addElement("state-file"); //$NON-NLS-1$
    Element documentation = root.addElement("documentation"); //$NON-NLS-1$
    documentation.addElement("author").addCDATA( userSession.getName() ); //$NON-NLS-1$

    root.addElement("state").addCDATA( state ); //$NON-NLS-1$
    
    String title = request.getStringParameter("title", ""); //$NON-NLS-1$ //$NON-NLS-2$
    documentation.addElement("title").addCDATA( title ); //$NON-NLS-1$
    String description = request.getStringParameter("description", ""); //$NON-NLS-1$ //$NON-NLS-2$
    documentation.addElement("description").addCDATA( description ); //$NON-NLS-1$

    String fileName = info.getActionName();
    if( !fileName.endsWith( '.'+type )) {
      fileName = fileName+'.'+type;
    }
    
    // see if we can find a content generator to get the file icon
    IPluginManager pluginManager = PentahoSystem.get( IPluginManager.class, userSession );
    if( pluginManager != null ) {
      IContentInfo contentInfo = pluginManager.getContentInfoFromExtension(type, userSession);
      if( contentInfo != null ) {
        String icon = contentInfo.getIconUrl();
        documentation.addElement("icon").addCDATA( icon ); //$NON-NLS-1$
      }
    }
    
    String basePath = PentahoSystem.getApplicationContext().getSolutionRootPath();
    if( !basePath.endsWith(""+ISolutionRepository.SEPARATOR) ) { //$NON-NLS-1$
      basePath = basePath+ISolutionRepository.SEPARATOR;
    }
    // save the file
    int ret = repo.addSolutionFile( basePath, 
        info.getSolutionName()+'/'+info.getPath(), fileName, doc.asXML().getBytes(), replace);
    
    if( ret == ISolutionRepository.FILE_EXISTS ) {
      errorMessage( Messages.getErrorString( "SolutionRepo.ERROR_0004_CANNOT_REPLACE" ), out ); //$NON-NLS-1$
      return;
    }
    else if( ret == ISolutionRepository.FILE_ADD_INVALID_USER_CREDENTIALS ) {
      errorMessage(Messages.getErrorString("SolutionRepo.ERROR_0005_CREDENTIALS"), out); //$NON-NLS-1$
      return;
    }
    else if( ret != ISolutionRepository.FILE_ADD_SUCCESSFUL ) {
      errorMessage(Messages.getErrorString("SolutionRepo.ERROR_0006_SAVE_FAILED"), out); //$NON-NLS-1$
      return;
    }
        
    out.write( Messages.getString("SolutionRepo.USER_FILE_SAVE").getBytes() ); //$NON-NLS-1$
    
  }

  /**
   * Writes an error message to the log and also to the provided output stream
   * @param message
   * @param out
   * @throws IOException
   */
  protected void errorMessage( String message, OutputStream out ) throws IOException {
    out.write( message.getBytes() );
    error(message);
  }
  
  @Override
  public Log getLogger() {
    return LogFactory.getLog(SolutionRepoSaveContentGenerator.class);
  }

  /**
   * Returns the MIME type of the output stream contents - text/text
   */
  @Override
  public String getMimeType() {
    return "text/text"; //$NON-NLS-1$
  }

}

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
import org.dom4j.Element;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

/**
 * Loads saved state from the solution repository. 
 * SolutionRepoSaveContentGenerator is used to create these files.
 * 
 * This content generator requires the following parameters:
 *     filepath - the path within the solution repository to laod from
 *     
 * If the file can be found is a valid state file the contents of the
 * state node are written to the output stream
 * @author jamesdixon
 *
 */
public class SolutionRepoLoadContentGenerator extends SimpleContentGenerator {

  private static final long serialVersionUID = 8445693289282403228L;

  /**
   * Loads state from the solution repository
   */
  @Override
  public void createContent(OutputStream out) throws Exception {

    // make sure we have the path to load from
    IParameterProvider request = parameterProviders.get( "request" ); //$NON-NLS-1$
    String fullPath = request.getStringParameter("filepath", null); //$NON-NLS-1$
    if( fullPath == null ) {
      errorMessage( Messages.getErrorString("SolutionRepo.ERROR_0001_NO_FILEPATH"), out ); //$NON-NLS-1$
      return;
    }

    ActionInfo info = ActionInfo.parseActionString( fullPath );
    if( info == null ) {
      errorMessage( Messages.getErrorString("SolutionRepo.ERROR_0003_BAD_PATH", fullPath), out ); //$NON-NLS-1$
      return;
    }
        
    ISolutionRepository repo = PentahoSystem.get(ISolutionRepository.class, userSession);

    // try to get the file from the repository
//    Document doc = repo.getResourceAsDocument(fullPath, ISolutionRepository.ACTION_EXECUTE);
    Document doc = repo.getNavigationUIDocument(null, fullPath, ISolutionRepository.ACTION_EXECUTE);

    if( doc != null ) {
      Element stateNode = (Element) doc.selectSingleNode( "state-file/state" ); //$NON-NLS-1$
      if( stateNode != null ) {
        // write the loaded state to the output stream
        out.write( stateNode.getText().getBytes( ) );
        return;
      }
    }
        
    out.write( Messages.getErrorString("SolutionRepo.ERROR_0001_LOAD_FAILED", fullPath).getBytes() ); //$NON-NLS-1$
    
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
    return LogFactory.getLog(SolutionRepoLoadContentGenerator.class);
  }

  /**
   * Returns the MIME type of the output stream contents - text/text
   */
  @Override
  public String getMimeType() {
    return "text/text"; //$NON-NLS-1$
  }

}

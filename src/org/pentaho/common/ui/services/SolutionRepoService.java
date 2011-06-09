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

import java.net.URLDecoder;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.platform.api.engine.IContentInfo;
import org.pentaho.platform.api.engine.IPentahoSession;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoBase;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;

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
public class SolutionRepoService extends PentahoBase {

  private static final long serialVersionUID = 8445693289282403228L;

  /**
   * Saves text state (e.g. JSON) into the solution repository
   */
  public StateMessage saveStateString(String filepath, String state, String type, Boolean replace, String title, String description) throws Exception {

    return this.saveState(filepath, state, false, type, replace, title, description);
    
  }

  /**
   * Saves XML state into the solution repository
   */
  public StateMessage saveStateXml(String filepath, String state, String type, Boolean replace, String title, String description) throws Exception {

    return this.saveState(filepath, state, true, type, replace, title, description);
    
  }

  /**
   * Saves state into the solution repository
   */
  protected StateMessage saveState(String filepath, String state, boolean stateIsXml, String type, Boolean replace, String title, String description) throws Exception {

    StateMessage result = new StateMessage();
    
    result.setStatus( StateMessage.STATUS_FAILED );
    if( StringUtils.isEmpty(filepath) ) {
      result.setMessage( Messages.getErrorString("SolutionRepo.ERROR_0001_NO_FILEPATH") ); //$NON-NLS-1$
      return result;
    }
    if( StringUtils.isEmpty(state) ) {
      result.setMessage( Messages.getErrorString("SolutionRepo.ERROR_0002_NO_STATE") ); //$NON-NLS-1$
      return result;
    }
    if( StringUtils.isEmpty(type) ) {
      result.setMessage( Messages.getErrorString("SolutionRepo.ERROR_0007_NO_TYPE") ); //$NON-NLS-1$
      return result;
    }
    if( replace == null ) {
      replace = Boolean.FALSE;
//      return result;
    }

    // make sure the path is good
    ActionInfo info = ActionInfo.parseActionString( filepath );
    if( info == null ) {
      result.setMessage( Messages.getErrorString("SolutionUrlContentGenerator.ERROR_0005_BAD_FILEPATH", filepath ) ); //$NON-NLS-1$
      return result;
    }

    IPentahoSession userSession = PentahoSessionHolder.getSession();
    ISolutionRepository repo = PentahoSystem.get(ISolutionRepository.class, userSession);
    
    // create the state file to save
    Document doc = DocumentHelper.createDocument();
    Element root = doc.addElement("state-file"); //$NON-NLS-1$
    Element documentation = root.addElement("documentation"); //$NON-NLS-1$
    documentation.addElement("author").addCDATA( userSession.getName() ); //$NON-NLS-1$
    
    if( stateIsXml ) {
      Element stateElement = root.addElement("state-xml"); //$NON-NLS-1$
      Document stateDoc = null;
      try {
        stateDoc = DocumentHelper.parseText(state);
      } catch (Exception e) {
        result.setMessage( Messages.getErrorString("SolutionRepo.ERROR_0009_BAD_STATE", state ) ); //$NON-NLS-1$
        return result;
      }
      Node stateRoot = stateDoc.getRootElement();
      stateRoot = stateRoot.detach();
      stateElement.add(stateRoot);
    } else {
      Element stateElement = root.addElement("state-text"); //$NON-NLS-1$
      stateElement.addCDATA( state );
    }
    
    documentation.addElement("title").addCDATA( title ); //$NON-NLS-1$
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
      result.setMessage( Messages.getErrorString( "SolutionRepo.ERROR_0004_CANNOT_REPLACE" ) ); //$NON-NLS-1$
      return result;
    }
    else if( ret == ISolutionRepository.FILE_ADD_INVALID_USER_CREDENTIALS ) {
      result.setMessage(Messages.getErrorString("SolutionRepo.ERROR_0005_CREDENTIALS") ); //$NON-NLS-1$
      return result;
    }
    else if( ret != ISolutionRepository.FILE_ADD_SUCCESSFUL ) {
      result.setMessage(Messages.getErrorString("SolutionRepo.ERROR_0006_SAVE_FAILED") ); //$NON-NLS-1$
      return result;
    }
        
    result.setStatus(StateMessage.STATUS_SUCCESS);
    result.setMessage(Messages.getString("SolutionRepo.USER_FILE_SAVE") ); //$NON-NLS-1$
    return result;
  }

  public StateMessage loadState(String filepath) throws Exception {
    // make sure we have the path to load from
    StateMessage result = new StateMessage();
    
    // URL decode the filepath
    filepath = URLDecoder.decode(filepath);
    
    result.setStatus( StateMessage.STATUS_FAILED );
    if( StringUtils.isEmpty(filepath) ) {
      result.setMessage( Messages.getErrorString( "SolutionRepo.ERROR_0001_NO_FILEPATH" ) ); //$NON-NLS-1$
      return result;
    }

    ActionInfo info = ActionInfo.parseActionString( filepath );
    if( info == null ) {
      result.setMessage( Messages.getErrorString( "SolutionRepo.ERROR_0003_BAD_PATH", filepath ) ); //$NON-NLS-1$
      return result;
    }

    IPentahoSession userSession = PentahoSessionHolder.getSession();    
    ISolutionRepository repo = PentahoSystem.get(ISolutionRepository.class, userSession);

    // try to get the file from the repository
    Document doc = repo.getResourceAsDocument(filepath, ISolutionRepository.ACTION_EXECUTE);
    
    if( doc != null ) {
      Element stateNode = (Element) doc.selectSingleNode( "state-file/state-xml" ); //$NON-NLS-1$
      if( stateNode != null ) {
        // write the loaded state to the output stream
        result.setStatus(StateMessage.STATUS_SUCCESS);
        result.setState(stateNode.asXML());
        return result;
      }
      stateNode = (Element) doc.selectSingleNode( "state-file/state-text" ); //$NON-NLS-1$
      if( stateNode != null ) {
        // write the loaded state to the output stream
        result.setStatus(StateMessage.STATUS_SUCCESS);
        result.setState(stateNode.getText());
        return result;
      }
      
    }
    result.setMessage(Messages.getErrorString("SolutionRepo.ERROR_0001_LOAD_FAILED", filepath) ); //$NON-NLS-1$
    return result;
  }
  
  @Override
  public Log getLogger() {
    return LogFactory.getLog(SolutionRepoService.class);
  }

}

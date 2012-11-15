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
 * Copyright 2005 - 2010 Pentaho Corporation.  All rights reserved. 
 * 
 * @created Aug, 2010
 * @author James Dixon
 */
package org.pentaho.common.ui.test;

import java.io.OutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

@SuppressWarnings({"all"})
public class MockContentGenerator extends SimpleContentGenerator {
  private static final Log log = LogFactory.getLog(MockContentGenerator.class);

  @Override
  public void createContent(OutputStream out) throws Exception {

    out.write( "MockContentGenerator content".getBytes() );
  
  }

  @Override
  public String getMimeType() {
    return "text/test";
  }

  @Override
  public Log getLogger() {
    return log;
  }

}

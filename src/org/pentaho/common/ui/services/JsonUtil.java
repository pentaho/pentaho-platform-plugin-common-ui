/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright (c) 2011 Pentaho Corporation.  All rights reserved.
 * 
 * Created Jan, 2011
 * @author jdixon
*/
package org.pentaho.common.ui.services;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.engine.core.system.PentahoBase;

import flexjson.JSONSerializer;

/**
 * This class provides utility functions used by the common services
 * @author jamesdixon
 *
 */

public class JsonUtil extends PentahoBase {
  
  private static final long serialVersionUID = -6164509181262122639L;
  private Log logger = LogFactory.getLog(JsonUtil.class);

  public StatusMessage createMessage( String message, String code ) {
    StatusMessage msg = new StatusMessage();
    msg.setCode(code);
    msg.setMessage(message);
    return msg;
  }
  
  public String createJsonMessage( String message, String code ) {
    StatusMessage msg = createMessage(message, code);
    JSONSerializer serializer = new JSONSerializer(); 
    String json = serializer.deepSerialize( msg );
    return json;
  }

  @Override
  public Log getLogger() {
    return logger;
  }
  
}

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


package org.pentaho.common.ui.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.engine.core.system.PentahoBase;

import flexjson.JSONSerializer;

/**
 * This class provides utility functions used by the common services
 * 
 * @author jamesdixon
 * 
 */

public class JsonUtil extends PentahoBase {

  private static final long serialVersionUID = -6164509181262122639L;
  private Log logger = LogFactory.getLog( JsonUtil.class );

  public StatusMessage createMessage( String message, String code ) {
    StatusMessage msg = new StatusMessage();
    msg.setCode( code );
    msg.setMessage( message );
    return msg;
  }

  public String createJsonMessage( String message, String code ) {
    StatusMessage msg = createMessage( message, code );
    JSONSerializer serializer = new JSONSerializer();
    String json = serializer.deepSerialize( msg );
    return json;
  }

  @Override
  public Log getLogger() {
    return logger;
  }

}

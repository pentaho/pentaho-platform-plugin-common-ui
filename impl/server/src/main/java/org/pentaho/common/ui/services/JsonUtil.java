/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



package org.pentaho.common.ui.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.engine.core.system.PentahoBase;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * This class provides utility functions used by the common services
 * 
 * @author jamesdixon
 * 
 */

public class JsonUtil extends PentahoBase {

  private static final long serialVersionUID = -6164509181262122639L;
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private Log logger = LogFactory.getLog( JsonUtil.class );

  public StatusMessage createMessage( String message, String code ) {
    StatusMessage msg = new StatusMessage();
    msg.setCode( code );
    msg.setMessage( message );
    return msg;
  }

  public String createJsonMessage( String message, String code ) throws Exception {
    StatusMessage msg = createMessage( message, code );
    return OBJECT_MAPPER.writeValueAsString( msg );
  }

  @Override
  public Log getLogger() {
    return logger;
  }

}

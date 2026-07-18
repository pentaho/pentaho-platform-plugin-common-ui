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



package org.pentaho.common.ui;

import java.io.OutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

@SuppressWarnings( { "all" } )
public class MockContentGenerator extends SimpleContentGenerator {
  private static final Log log = LogFactory.getLog( MockContentGenerator.class );

  @Override
  public void createContent( OutputStream out ) throws Exception {

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

/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/


package org.pentaho.common.ui.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.OutputStream;
import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;

import org.junit.BeforeClass;
import org.junit.Test;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.platform.api.engine.IOutputHandler;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPentahoDefinableObjectFactory;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.IPluginProvider;
import org.pentaho.platform.api.engine.ISolutionEngine;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.api.repository2.unified.IUnifiedRepository;
import org.pentaho.platform.engine.core.output.SimpleOutputHandler;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.engine.core.system.boot.PlatformInitializationException;
import org.pentaho.platform.engine.services.solution.SolutionEngine;
import org.pentaho.platform.plugin.services.pluginmgr.DefaultPluginManager;
import org.pentaho.platform.plugin.services.pluginmgr.FileSystemXmlPluginProvider;
import org.pentaho.platform.plugin.services.pluginmgr.PluginAdapter;
import org.pentaho.platform.repository2.unified.fs.FileSystemBackedUnifiedRepository;
import org.pentaho.test.platform.engine.core.MicroPlatform;
import static org.pentaho.common.ui.IntegrationTestConstants.SOLUTION_PATH;

@SuppressWarnings( { "all" } )
public class SolutionUrlContentGeneratorIT {

  private static MicroPlatform microPlatform = null;

  private static IUnifiedRepository repository;

  @BeforeClass
  public static void init() {

    if ( microPlatform == null || !microPlatform.isInitialized() ) {
      microPlatform = new MicroPlatform(SOLUTION_PATH);
      microPlatform.define( ISolutionEngine.class, SolutionEngine.class, IPentahoDefinableObjectFactory.Scope.GLOBAL );

      repository = new FileSystemBackedUnifiedRepository();
      ( (FileSystemBackedUnifiedRepository) repository ).setRootDir( new File(SOLUTION_PATH) );

      microPlatform.defineInstance( IUnifiedRepository.class, repository );

      microPlatform.define( IPluginManager.class, DefaultPluginManager.class,
          IPentahoDefinableObjectFactory.Scope.GLOBAL );
      microPlatform.define( IPluginProvider.class, FileSystemXmlPluginProvider.class,
          IPentahoDefinableObjectFactory.Scope.GLOBAL );

      microPlatform.addLifecycleListener( new PluginAdapter() );
      try {
        microPlatform.start();
      } catch ( PlatformInitializationException e ) {
        e.printStackTrace();
      }
    }
  }

  @Test
  public void testLogger() {
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    assertNotNull( "Logger is null", cg.getLogger() );
  }

  @Test
  public void testMessages() {
    assertFalse( Messages.getString( "SolutionURLContentGenerator.ERROR_0001_NO_FILEPATH" ).startsWith( "!" ) );
    assertFalse( Messages.getString( "SolutionURLContentGenerator.ERROR_0002_CANNOT_HANDLE_TYPE" ).startsWith( "!" ) );
    assertFalse( Messages.getString( "SolutionURLContentGenerator.ERROR_0003_RESOURCE_NOT_FOUND", "" ).startsWith( "!" ) );
  }

  @Test
  public void testNoOutput() throws Exception {
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$
    pathParams.setParameter( "path", "solution/web/test.txt" );
    cg.setOutputHandler( null );
    cg.setParameterProviders( parameterProviders );
    try {
      cg.createContent();
      assertFalse( "Expected exception did not happen", true );
    } catch ( InvalidParameterException e ) {
      assertTrue( true );
    }

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testNoStream() throws Exception {
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$
    pathParams.setParameter( "path", "solution1/resources/web/test.txt" );
    IOutputHandler handler = new SimpleOutputHandler( (OutputStream) null, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    try {
      cg.createContent();
      assertFalse( "Expected exception did not happen", true );
    } catch ( InvalidParameterException e ) {
      assertTrue( true );
    }

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testNoContentItem() throws Exception {
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$
    pathParams.setParameter( "path", "solution1/resources/web/test.txt" );
    IOutputHandler handler = new SimpleOutputHandler( (IContentItem) null, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    try {
      cg.createContent();
      assertFalse( "Expected exception did not happen", true );
    } catch ( InvalidParameterException e ) {
      assertTrue( true );
    }

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testNoPath() throws Exception {
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testMissingFile() throws Exception {

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$

    pathParams.setParameter( "path", "/web/badpath/img.png" );

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );

    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testBadStaticType() throws Exception {

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$

    pathParams.setParameter( "path", "/web/badpath/file" );

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );

    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testGoodStaticType() throws Exception {

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$

    pathParams.setParameter( "path", "solution1/resources/web/test.txt" );

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );

    assertEquals( "Content is wrong", "test content", content );

  }

  @Test
  public void testNonWebStaticType() throws Exception {

    String testContents = "test file contents";
    String filepath = "solution/notweb/test.txt";
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$

    pathParams.setParameter( "path", filepath );

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );

    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testXactionType() throws Exception {

    String testContents = "test file contents";
    String filepath = "solution/web/test.xaction";
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$

    pathParams.setParameter( "path", filepath );

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );

    assertEquals( "Content is wrong", content, "" );

  }

  @Test
  public void testContentGenerator() throws Exception {

    String testContents = "test file contents";
    String filepath = "solution/test.testgen";
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    SimpleParameterProvider requestParams = new SimpleParameterProvider();
    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();
    parameterProviders.put( "path", pathParams ); //$NON-NLS-1$
    parameterProviders.put( "request", requestParams ); //$NON-NLS-1$
    pathParams.setParameter( "path", filepath );

    IOutputHandler handler = new SimpleOutputHandler( out, false );
    cg.setOutputHandler( handler );
    cg.setParameterProviders( parameterProviders );
    cg.createContent();

    String content = new String( out.toByteArray() );

    assertEquals( "Content is wrong", "MockContentGenerator content", content );

  }
}

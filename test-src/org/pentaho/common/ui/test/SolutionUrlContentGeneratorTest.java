package org.pentaho.common.ui.test;


import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import junit.framework.TestCase;

import org.pentaho.common.ui.messages.Messages;
import org.pentaho.common.ui.services.SolutionUrlContentGenerator;
import org.pentaho.platform.api.engine.IApplicationContext;
import org.pentaho.platform.api.engine.IOutputHandler;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPentahoPublisher;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.IPluginProvider;
import org.pentaho.platform.api.engine.IServiceManager;
import org.pentaho.platform.api.engine.ISolutionEngine;
import org.pentaho.platform.api.engine.IPentahoDefinableObjectFactory.Scope;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.output.SimpleOutputHandler;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.core.system.StandaloneApplicationContext;
import org.pentaho.platform.engine.core.system.StandaloneSession;
import org.pentaho.platform.engine.core.system.boot.PlatformInitializationException;
import org.pentaho.platform.engine.services.solution.SolutionEngine;
import org.pentaho.platform.plugin.services.pluginmgr.DefaultPluginManager;
import org.pentaho.platform.plugin.services.pluginmgr.PluginAdapter;
import org.pentaho.platform.plugin.services.pluginmgr.SystemPathXmlPluginProvider;
import org.pentaho.platform.plugin.services.pluginmgr.servicemgr.DefaultServiceManager;
import org.pentaho.platform.repository.solution.filebased.FileBasedSolutionRepository;
import org.pentaho.test.platform.engine.core.MicroPlatform;

@SuppressWarnings({"all"})
public class SolutionUrlContentGeneratorTest extends TestCase {

  private static MicroPlatform microPlatform = null;
  
  public void init()  {
    if( microPlatform == null || !microPlatform.isInitialized() ) {
      microPlatform = new MicroPlatform("test-res/pentaho-solutions");
      microPlatform.define(ISolutionEngine.class, SolutionEngine.class);
      microPlatform.define(IPluginManager.class, DefaultPluginManager.class, Scope.GLOBAL);
      microPlatform.define(ISolutionRepository.class, FileBasedSolutionRepository.class);
      microPlatform.define("systemStartupSession", StandaloneSession.class);
      microPlatform.define(IPluginProvider.class, SystemPathXmlPluginProvider.class);
      microPlatform.define(IServiceManager.class, DefaultServiceManager.class);
      
      PentahoSystem.setObjectFactory(microPlatform.getFactory());
      List<IPentahoPublisher> administrationPlugins = new ArrayList<IPentahoPublisher>();
      microPlatform.addLifecycleListener(new PluginAdapter());
      try {
        microPlatform.start();
      } catch (PlatformInitializationException e) {
        e.printStackTrace();
      }
    }
  }
  
  public void testLogger() {
    init();
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    assertNotNull( "Logger is null", cg.getLogger() );
  }
  
  public void testMessages() {
    init();

    assertFalse( Messages.getString("SolutionURLContentGenerator.ERROR_0001_NO_FILEPATH").startsWith("!") );
    assertFalse( Messages.getString("SolutionURLContentGenerator.ERROR_0002_CANNOT_HANDLE_TYPE").startsWith("!") );
    assertFalse( Messages.getString("SolutionURLContentGenerator.ERROR_0003_RESOURCE_NOT_FOUND","").startsWith("!") );
    
  }

  public void testNoOutput() throws Exception {
    init();

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    pathParams.setParameter( "path" , "solution/web/test.txt");
    cg.setOutputHandler(null);
    cg.setParameterProviders(parameterProviders);
    try {
      cg.createContent();
      assertFalse("Expected exception did not happen",true);
    } catch (InvalidParameterException e) {
      assertTrue(true);
    }

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );
    
  }

  public void testNoStream() throws Exception {
    init();

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    pathParams.setParameter( "path" , "solution1/resources/web/test.txt");
    IOutputHandler handler = new SimpleOutputHandler((OutputStream) null, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    try {
      cg.createContent();
      assertFalse("Expected exception did not happen",true);
    } catch (InvalidParameterException e) {
      assertTrue(true);
    }

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );
    
  }

  public void testNoContentItem() throws Exception {
    init();
    
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    pathParams.setParameter( "path" , "solution1/resources/web/test.txt");
    IOutputHandler handler = new SimpleOutputHandler((IContentItem) null, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    try {
      cg.createContent();
      assertFalse("Expected exception did not happen",true);
    } catch (InvalidParameterException e) {
      assertTrue(true);
    }

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );
    
  }

  public void testNoPath() throws Exception {
    init();

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();

    String content = new String( out.toByteArray() );
    assertEquals( "Content is wrong", content, "" );
    
  }
  
  public void testMissingFile() throws Exception {
    init();

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    
    pathParams.setParameter( "path" , "/web/badpath/img.png");
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();
    
    String content = new String( out.toByteArray() );
  
    assertEquals( "Content is wrong", content, "" );
    
  }

  public void testBadStaticType() throws Exception {
    init();

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    
    pathParams.setParameter( "path" , "/web/badpath/file");
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();
    
    String content = new String( out.toByteArray() );
  
    assertEquals( "Content is wrong", content, "" );
    
  }
  
  public void testGoodStaticType() throws Exception {
    init();

    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    
    pathParams.setParameter( "path" , "solution1/resources/web/test.txt");
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();
    
    String content = new String( out.toByteArray() );
  
    assertEquals( "Content is wrong", "test content", content );
    
  }  
  public void testNonWebStaticType() throws Exception {
    init();

    String testContents = "test file contents";
    String filepath = "solution/notweb/test.txt";
    MockSolutionRepository.files.put( filepath, testContents);
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    
    pathParams.setParameter( "path" , filepath);
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();
    
    String content = new String( out.toByteArray() );
  
    assertEquals( "Content is wrong", content, "" );
    
  }

  public void testXactionType() throws Exception {
    init();
    
    MockSolutionRepository.files.clear();
    String testContents = "test file contents";
    String filepath = "solution/web/test.xaction";
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    
    pathParams.setParameter( "path" , filepath);
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();
    
    String content = new String( out.toByteArray() );
  
    assertEquals( "Content is wrong", content, "" );
    
  }
  

  public void testContentGenerator() throws Exception {
    init();

    String testContents = "test file contents";
    String filepath = "solution/test.testgen";
    SolutionUrlContentGenerator cg = new SolutionUrlContentGenerator();
    
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    SimpleParameterProvider pathParams = new SimpleParameterProvider();
    SimpleParameterProvider requestParams = new SimpleParameterProvider();
    Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
    parameterProviders.put( "path" , pathParams ); //$NON-NLS-1$
    parameterProviders.put( "request" , requestParams ); //$NON-NLS-1$
    pathParams.setParameter( "path" , filepath);
    
    IOutputHandler handler = new SimpleOutputHandler(out, false);
    cg.setOutputHandler(handler);
    cg.setParameterProviders(parameterProviders);
    cg.createContent();
    
    String content = new String( out.toByteArray() );
  
    assertEquals( "Content is wrong", "MockContentGenerator content", content );
    
  }
}

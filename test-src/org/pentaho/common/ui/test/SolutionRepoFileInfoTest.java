package org.pentaho.common.ui.test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.pentaho.common.ui.services.SolutionRepoFileInfo;
import org.pentaho.common.ui.services.SolutionRepoService;
import org.pentaho.platform.api.engine.IFileInfo;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPentahoSession;
import org.pentaho.platform.api.engine.ISolutionFile;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.StandaloneSession;
import org.pentaho.platform.engine.services.messages.Messages;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;
import org.pentaho.test.platform.engine.core.BaseTest;

import junit.framework.TestCase;

@SuppressWarnings({"all"})
public class SolutionRepoFileInfoTest extends TestCase {
  private static final String SOLUTION_PATH = "test-res/pentaho-solutions";
  public String getSolutionPath() {
       return SOLUTION_PATH;  
  }

  public void testState() {
    
    String doc = "<state-file><documentation></documentation></state-file>";
    
    ByteArrayInputStream in = new ByteArrayInputStream( doc.getBytes() );

    SolutionRepoFileInfo solutionRepoFileInfo = new SolutionRepoFileInfo();
    
    IFileInfo fileInfo = solutionRepoFileInfo.getFileInfo(null, in);
    
    assertEquals( "bad author", "", fileInfo.getAuthor() );
    
  }

  public void testState2() {
    
    String doc = "<state-file><documentation><author><![CDATA[test author]]></author><title><![CDATA[test title]]></title><description><![CDATA[test description]]></description><icon><![CDATA[test icon]]></icon></documentation></state-file>";
    
    ByteArrayInputStream in = new ByteArrayInputStream( doc.getBytes() );

    SolutionRepoFileInfo solutionRepoFileInfo = new SolutionRepoFileInfo();
    
    IFileInfo fileInfo = solutionRepoFileInfo.getFileInfo(null, in);
    
    assertEquals( "bad author", "test author", fileInfo.getAuthor() );
    assertEquals( "bad title", "test title", fileInfo.getTitle() );
    assertEquals( "bad description", "test description", fileInfo.getDescription() );
    assertEquals( "bad icon", "test icon", fileInfo.getIcon() );
    
  }

  public void testBadDoc() {
    
    String doc = "afdadfadf";
    
    ByteArrayInputStream in = new ByteArrayInputStream( doc.getBytes() );

    SolutionRepoFileInfo solutionRepoFileInfo = new SolutionRepoFileInfo();
//    solutionRepoFileInfo.setLogger( new SolutionRepoService() );
    
    IFileInfo fileInfo = solutionRepoFileInfo.getFileInfo(null, in);

    assertNull( fileInfo );
    
  }
  public void testNullStream() {
    
    SolutionRepoFileInfo solutionRepoFileInfo = new SolutionRepoFileInfo();
    
    IFileInfo fileInfo = solutionRepoFileInfo.getFileInfo(null, null);
    
    assertNull( fileInfo );
    
  }

  public void testLogger() {

    SolutionRepoFileInfo solutionRepoFileInfo = new SolutionRepoFileInfo();

    solutionRepoFileInfo.setLogger( new SolutionRepoService() );
    
  }

}

package org.pentaho.common.ui.test;

import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.common.ui.models.TreeBrowserMapper;
import org.pentaho.common.ui.models.TreeBrowserModel;
import org.pentaho.common.ui.models.TreeBrowserModelUtils;
import org.pentaho.platform.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.repository2.unified.webservices.RepositoryFileTreeDto;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.io.StringReader;
import java.util.Locale;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

/**
 * @author Rowell Belen
 */
public class TreeBrowserModelUtilsTest {

  private TreeBrowserMapper treeBrowserMapper;
  private File testFile;

  @Before
  public void setUp() throws Exception {
    treeBrowserMapper = new TreeBrowserMapper( Locale.getDefault() );
    testFile = new File( "test-res/data/repositoryFileTree.xml" );
  }

  @Test
  public void testTraverse() throws Exception {

    new TreeBrowserModelUtils(); // constructor check

    String repositoryFileTreeXml = FileUtils.readFileToString( testFile );

    RepositoryFileTreeDto repositoryFileTreeDto = unmarshal( repositoryFileTreeXml );
    assertNotNull( repositoryFileTreeDto );

    // check each node
    TreeBrowserModelUtils.traverse( repositoryFileTreeDto, new TreeBrowserModelUtils.RepositoryFileDtoVisitor() {
      @Override public void visit( RepositoryFileDto repositoryFileDto ) {
        assertNotNull( repositoryFileDto );
      }
    } );

    // null checks
    TreeBrowserModelUtils.traverse( null, (TreeBrowserModelUtils.RepositoryFileDtoVisitor) null );
    TreeBrowserModelUtils.traverse( repositoryFileTreeDto, null );
    TreeBrowserModelUtils.traverse( null, new TreeBrowserModelUtils.RepositoryFileDtoVisitor() {
      @Override public void visit( RepositoryFileDto repositoryFileDto ) {
        assertNotNull( repositoryFileDto );
      }
    } );

    // check null children
    RepositoryFileTreeDto mockRepositoryFileTreeDto = new RepositoryFileTreeDto();
    mockRepositoryFileTreeDto.setChildren( null );
    TreeBrowserModelUtils.traverse( new RepositoryFileTreeDto(), new TreeBrowserModelUtils.RepositoryFileDtoVisitor() {
      @Override public void visit( RepositoryFileDto repositoryFileDto ) {
        assertNull( repositoryFileDto );
      }
    } );


    TreeBrowserModel treeBrowserModel = treeBrowserMapper.convert( repositoryFileTreeDto );
    assertNotNull( treeBrowserModel );

    // check each node
    TreeBrowserModelUtils.traverse( treeBrowserModel, new TreeBrowserModelUtils.TreeBrowserModelVisitor() {
      @Override public void visit( TreeBrowserModel treeBrowserModel ) {
        assertNotNull( treeBrowserModel );
      }
    } );

    // null checks
    TreeBrowserModelUtils.traverse( null, (TreeBrowserModelUtils.TreeBrowserModelVisitor) null );
    TreeBrowserModelUtils.traverse( treeBrowserModel, null );
    TreeBrowserModelUtils.traverse( null, new TreeBrowserModelUtils.TreeBrowserModelVisitor() {
      @Override public void visit( TreeBrowserModel treeBrowserModel ) {
        assertNotNull( treeBrowserModel );
      }
    } );

    // check null children
    TreeBrowserModel mockTreeBrowserModel = new TreeBrowserModel();
    mockTreeBrowserModel.setChildren( null );
    TreeBrowserModelUtils.traverse( mockTreeBrowserModel, new TreeBrowserModelUtils.TreeBrowserModelVisitor() {
      @Override public void visit( TreeBrowserModel treeBrowserModel ) {
        assertNotNull( treeBrowserModel );
      }
    } );
  }

  private RepositoryFileTreeDto unmarshal( final String xml ) throws Exception {

    JAXBContext jaxbContext = JAXBContext.newInstance( RepositoryFileTreeDto.class );
    Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();

    StringReader reader = new StringReader( xml );
    RepositoryFileTreeDto repositoryFileTreeDto = (RepositoryFileTreeDto) unmarshaller.unmarshal( reader );

    return repositoryFileTreeDto;
  }
}

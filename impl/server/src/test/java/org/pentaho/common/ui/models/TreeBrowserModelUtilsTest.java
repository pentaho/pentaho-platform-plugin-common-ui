/*!
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
 * Copyright (c) 2002-2018 Hitachi Vantara.  All rights reserved.
 */

package org.pentaho.common.ui.models;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.File;
import java.io.StringReader;
import java.util.Locale;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;

import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileTreeDto;

import static org.pentaho.common.ui.TestConstants.RESOURCES_PATH;

/**
 * @author Rowell Belen
 */
public class TreeBrowserModelUtilsTest {

  private TreeBrowserMapper treeBrowserMapper;
  private File testFile;

  @Before
  public void setUp() throws Exception {
    treeBrowserMapper = new TreeBrowserMapper( Locale.getDefault() );
    testFile = new File( RESOURCES_PATH + "/data/repositoryFileTree.xml" );
  }

  @Test
  public void testTraverse() throws Exception {

    new TreeBrowserModelUtils(); // constructor check

    String repositoryFileTreeXml = FileUtils.readFileToString( testFile );

    RepositoryFileTreeDto repositoryFileTreeDto = unmarshal( repositoryFileTreeXml );
    assertNotNull( repositoryFileTreeDto );

    // check each node
    TreeBrowserModelUtils.traverse( repositoryFileTreeDto, new TreeBrowserModelUtils.RepositoryFileDtoVisitor() {
      @Override
      public void visit( RepositoryFileDto repositoryFileDto ) {
        assertNotNull( repositoryFileDto );
      }
    } );

    // null checks
    TreeBrowserModelUtils.traverse( null, (TreeBrowserModelUtils.RepositoryFileDtoVisitor) null );
    TreeBrowserModelUtils.traverse( repositoryFileTreeDto, null );
    TreeBrowserModelUtils.traverse( null, new TreeBrowserModelUtils.RepositoryFileDtoVisitor() {
      @Override
      public void visit( RepositoryFileDto repositoryFileDto ) {
        assertNotNull( repositoryFileDto );
      }
    } );

    // check null children
    RepositoryFileTreeDto mockRepositoryFileTreeDto = new RepositoryFileTreeDto();
    mockRepositoryFileTreeDto.setChildren( null );
    TreeBrowserModelUtils.traverse( new RepositoryFileTreeDto(), new TreeBrowserModelUtils.RepositoryFileDtoVisitor() {
      @Override
      public void visit( RepositoryFileDto repositoryFileDto ) {
        assertNull( repositoryFileDto );
      }
    } );

    TreeBrowserModel treeBrowserModel = treeBrowserMapper.convert( repositoryFileTreeDto );
    assertNotNull( treeBrowserModel );

    // check each node
    TreeBrowserModelUtils.traverse( treeBrowserModel, new TreeBrowserModelUtils.TreeBrowserModelVisitor() {
      @Override
      public void visit( TreeBrowserModel treeBrowserModel ) {
        assertNotNull( treeBrowserModel );
      }
    } );

    // null checks
    TreeBrowserModelUtils.traverse( null, (TreeBrowserModelUtils.TreeBrowserModelVisitor) null );
    TreeBrowserModelUtils.traverse( treeBrowserModel, null );
    TreeBrowserModelUtils.traverse( null, new TreeBrowserModelUtils.TreeBrowserModelVisitor() {
      @Override
      public void visit( TreeBrowserModel treeBrowserModel ) {
        assertNotNull( treeBrowserModel );
      }
    } );

    // check null children
    TreeBrowserModel mockTreeBrowserModel = new TreeBrowserModel();
    mockTreeBrowserModel.setChildren( null );
    TreeBrowserModelUtils.traverse( mockTreeBrowserModel, new TreeBrowserModelUtils.TreeBrowserModelVisitor() {
      @Override
      public void visit( TreeBrowserModel treeBrowserModel ) {
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

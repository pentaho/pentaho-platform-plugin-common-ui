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
 * Copyright (c) 2002-2013 Pentaho Corporation..  All rights reserved.
 */

package org.pentaho.common.ui.test;

import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.common.ui.models.PermissionsModel;
import org.pentaho.common.ui.models.TreeBrowserMapper;
import org.pentaho.common.ui.models.TreeBrowserModel;
import org.pentaho.platform.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.repository2.unified.webservices.RepositoryFileTreeDto;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.io.StringReader;
import java.util.List;
import java.util.Locale;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * @author Rowell Belen
 */
public class TreeBrowserMapperTest {

  private TreeBrowserMapper treeBrowserMapper;

  @Before
  public void setUp() throws Exception {
    treeBrowserMapper = new TreeBrowserMapper( Locale.getDefault() );
  }

  @Test
  public void testConvert() throws Exception {

    File testFile = new File("test-res/data/repositoryFileTree.xml");
    String repositoryFileTreeXml = FileUtils.readFileToString( testFile );

    RepositoryFileTreeDto repositoryFileTreeDto = unmarshal( repositoryFileTreeXml );
    assertNotNull( repositoryFileTreeDto );

    TreeBrowserModel treeBrowserModel = treeBrowserMapper.convert( repositoryFileTreeDto );
    assertNotNull( treeBrowserModel );

    validate( repositoryFileTreeDto.getFile(), treeBrowserModel );

    validate( repositoryFileTreeDto, treeBrowserModel );
  }

  private void validate( RepositoryFileTreeDto repositoryFileTreeDto, TreeBrowserModel treeBrowserModel ) {

    assertEquals( repositoryFileTreeDto.getChildren().size(), treeBrowserModel.getChildren().size() );

    List<RepositoryFileTreeDto> repositoryFileTreeDtos = repositoryFileTreeDto.getChildren();
    List<TreeBrowserModel> treeBrowserModels = treeBrowserModel.getChildren();

    if ( repositoryFileTreeDtos != null ) {
      for ( int i = 0; i < repositoryFileTreeDtos.size(); i++ ) {

        RepositoryFileDto file = repositoryFileTreeDtos.get( i ).getFile();
        TreeBrowserModel model = treeBrowserModels.get( i );
        validate( file, model );

        validate( repositoryFileTreeDtos.get( i ), model );
      }
    }
  }

  private void validate( RepositoryFileDto repositoryFileDto, TreeBrowserModel treeBrowserModel ) {

    assertEquals( repositoryFileDto.getId(), treeBrowserModel.getId() );
    assertEquals( repositoryFileDto.getName(), treeBrowserModel.getName() );
    assertEquals( repositoryFileDto.getDescription(), treeBrowserModel.getDescription() );
    assertEquals( repositoryFileDto.isFolder(), treeBrowserModel.isFolder() );
    assertEquals( repositoryFileDto.getPath(), treeBrowserModel.getPath() );

    // Verify localized name
    String localizedName =
      treeBrowserMapper
        .getLocalizedName( Locale.getDefault(), repositoryFileDto, "file.title", repositoryFileDto.getName() );
    assertEquals( localizedName, treeBrowserModel.getLocalizedName() );

    // May need a better way to validate this
    PermissionsModel permissionsModel = treeBrowserModel.getPermissions();
    assertNotNull( permissionsModel );
    assertNotNull( permissionsModel.isRead() );
    assertNotNull( permissionsModel.isWrite() );
    assertNotNull( permissionsModel.isExecute() );
  }


  private RepositoryFileTreeDto unmarshal( final String xml ) throws Exception {

    JAXBContext jaxbContext = JAXBContext.newInstance( RepositoryFileTreeDto.class );
    Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();

    StringReader reader = new StringReader( xml );
    RepositoryFileTreeDto repositoryFileTreeDto = (RepositoryFileTreeDto) unmarshaller.unmarshal( reader );

    return repositoryFileTreeDto;
  }

}

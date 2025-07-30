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


package org.pentaho.common.ui.models;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.StringReader;
import java.util.List;
import java.util.Locale;

import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Unmarshaller;

import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileTreeDto;

import static org.pentaho.common.ui.TestConstants.RESOURCES_PATH;
/**
 * @author Rowell Belen
 */
public class TreeBrowserMapperTest {

  private TreeBrowserMapper treeBrowserMapper;

  @Before
  public void setUp() throws Exception {
    treeBrowserMapper = new TreeBrowserMapper( Locale.getDefault() );
  }

  @Test( expected = Exception.class )
  public void testConvertError() {
    treeBrowserMapper.convert( (RepositoryFileDto) null );
  }

  @Test
  public void testConvert() throws Exception {

    File testFile = new File( RESOURCES_PATH + "/data/repositoryFileTree.xml" );
    String repositoryFileTreeXml = FileUtils.readFileToString( testFile );

    RepositoryFileTreeDto repositoryFileTreeDto = unmarshal( repositoryFileTreeXml );
    assertNotNull( repositoryFileTreeDto );

    TreeBrowserModel treeBrowserModel = treeBrowserMapper.convert( repositoryFileTreeDto );
    assertNotNull( treeBrowserModel );

    validate( repositoryFileTreeDto.getFile(), treeBrowserModel );

    validate( repositoryFileTreeDto, treeBrowserModel );

    // test with permissions mapper
    treeBrowserMapper.setPermissionsModelMapper( new PermissionsModelMapper() {
      @Override
      public PermissionsModel map( TreeBrowserModel treeBrowserModel ) {
        return null;
      }
    } );
    treeBrowserModel = treeBrowserMapper.convert( repositoryFileTreeDto );
    assertNotNull( treeBrowserModel );
    assertNull( treeBrowserModel.getPermissions() );

    // test with permissions mapper
    treeBrowserMapper.setPermissionsModelMapper( new PermissionsModelMapper() {
      @Override
      public PermissionsModel map( TreeBrowserModel treeBrowserModel ) {
        PermissionsModel permissionsModel = new PermissionsModel();
        if ( treeBrowserModel.getOwner() != null ) { // some random logic
          permissionsModel.setRead( true );
          permissionsModel.setWrite( true );
          permissionsModel.setExecute( false );
        }
        return permissionsModel;
      }
    } );
    treeBrowserModel = treeBrowserMapper.convert( repositoryFileTreeDto );
    assertNotNull( treeBrowserModel );
    assertNotNull( treeBrowserModel.getPermissions() );
    assertTrue( treeBrowserModel.getPermissions().isRead() );
    assertTrue( treeBrowserModel.getPermissions().isWrite() );
    assertFalse( treeBrowserModel.getPermissions().isExecute() );
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
        treeBrowserMapper.getLocalizedName( Locale.getDefault(), repositoryFileDto, "file.title", repositoryFileDto
            .getName() );
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

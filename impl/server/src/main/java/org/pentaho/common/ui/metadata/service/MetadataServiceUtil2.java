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
 * Copyright (c) 2002-2017 Hitachi Vantara..  All rights reserved.
 */

package org.pentaho.common.ui.metadata.service;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.commons.connection.IPentahoResultSet;
import org.pentaho.metadata.model.Domain;
import org.pentaho.metadata.model.IPhysicalColumn;
import org.pentaho.metadata.model.LogicalColumn;
import org.pentaho.metadata.model.LogicalModel;
import org.pentaho.metadata.model.concept.Concept;
import org.pentaho.metadata.model.concept.types.AggregationType;
import org.pentaho.metadata.model.concept.types.Alignment;
import org.pentaho.metadata.model.concept.types.DataType;
import org.pentaho.metadata.model.concept.types.FieldType;
import org.pentaho.metadata.model.concept.types.LocalizedString;
import org.pentaho.metadata.model.thin.Condition;
import org.pentaho.metadata.model.thin.Element;
import org.pentaho.metadata.model.thin.Model;
import org.pentaho.metadata.model.thin.ModelInfo;
import org.pentaho.metadata.model.thin.Order;
import org.pentaho.metadata.model.thin.Parameter;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.metadata.query.model.CombinationType;
import org.pentaho.metadata.query.model.Constraint;
import org.pentaho.metadata.query.model.Order.Type;
import org.pentaho.metadata.query.model.Selection;
import org.pentaho.metadata.query.model.util.QueryXmlHelper;
import org.pentaho.metadata.repository.IMetadataDomainRepository;
import org.pentaho.platform.engine.core.system.PentahoBase;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.util.messages.LocaleHelper;
import org.pentaho.pms.core.exception.PentahoMetadataException;

import flexjson.JSONDeserializer;

/**
 * This class provides utility functions used by the MetadataService
 * 
 * @author jamesdixon
 * 
 */

public class MetadataServiceUtil2 extends PentahoBase {

  private static final long serialVersionUID = -123835493828427853L;

  private Log logger = LogFactory.getLog( MetadataServiceUtil2.class );

  private org.pentaho.metadata.model.Domain domain;

  /**
   * Returns the full domain object used by this class
   * 
   * @return
   */
  public org.pentaho.metadata.model.Domain getDomain() {
    return domain;
  }

  /**
   * Sets the full domain object used by this class
   * 
   * @param domain
   */
  public void setDomain( org.pentaho.metadata.model.Domain domain ) {
    this.domain = domain;
  }

  public MetadataServiceUtil2() {
  }

  /**
   * Works out what is the most appropriate locale to use given a domain and the user's current locale
   * 
   * @return
   */
  protected String getLocale() {
    String locale = LocaleHelper.getClosestLocale( LocaleHelper.getLocale().toString(), domain.getLocaleCodes() );
    return locale;
  }

  /**
   * Creates a lightweight, serializable model object from a logical model
   * 
   * @param m
   * @param domainId
   * @return
   */
  public Model createThinModel( LogicalModel m, String domainId ) {
    // create the model object
    Model model = new Model();
    model.setName( m.getName( getLocale() ) );
    model.setModelId( m.getId() );
    model.setGroupId( domainId );
    model.setDescription( m.getDescription( getLocale() ) );
    // add the categories to the model
    List<Element> elements = new ArrayList<Element>();
    for ( org.pentaho.metadata.model.Category cat : m.getCategories() ) {
      createCategory( m, cat, elements );
    }
    model.setElements( elements.toArray( new Element[elements.size()] ) );

    return model;

  }

  /**
   * Creates a lightweight, serializable category objects from a logical model category
   * 
   * @param m
   * @param c
   * @return
   */
  private void createCategory( LogicalModel m, org.pentaho.metadata.model.Category c, List<Element> elements ) {
    // create a thin category object
    Element cat = new Element();
    cat.setName( c.getName( getLocale() ) );
    cat.setId( c.getId() );
    cat.setDescription( c.getDescription( getLocale() ) );
    if ( cat.getId().equals( cat.getDescription() ) ) {
      cat.setDescription( null );
    }
    cat.setIsQueryElement( false );
    elements.add( cat );
    for ( LogicalColumn col : c.getLogicalColumns() ) {
      elements.add( createColumn( m, col, c, cat ) );
    }
  }

  /**
   * Creates a lightweight, serializable Column object from a logical model column
   * 
   * @param m
   * @param c
   * @return
   */
  private Element createColumn( LogicalModel m, LogicalColumn c, org.pentaho.metadata.model.Category category,
      Element cat ) {
    Element col = new Element();
    col.setName( c.getName( getLocale() ) );
    col.setId( c.getId() );
    col.setDescription( c.getDescription( getLocale() ) );
    col.setParentId( cat.getId() );
    if ( col.getId().equals( col.getDescription() ) ) {
      col.setDescription( null );
    }
    if ( c.getFieldType() != null ) {
      col.setElementType( c.getFieldType().name() );
    } else {
      col.setElementType( "UNKNOWN" ); //$NON-NLS-1$
    }

    col.setDataType( c.getDataType().getName().toUpperCase() );
    col.setParentId( category.getId() );
    // set the aggregation fields for the column
    List<AggregationType> possibleAggs = c.getAggregationList();
    List<String> aggTypes = new ArrayList<String>();
    if ( possibleAggs != null ) {
      for ( AggregationType agg : possibleAggs ) {
        aggTypes.add( agg.name() );
      }
    }

    // There might be a default agg, but no agg list. If so, add it to the list.

    AggregationType defaultAggType = AggregationType.NONE;
    if ( c.getAggregationType() != null ) {
      defaultAggType = c.getAggregationType();
    }
    if ( !aggTypes.contains( defaultAggType.name() ) ) {
      aggTypes.add( defaultAggType.name() );
    }
    col.setAvailableAggregations( aggTypes.toArray( new String[aggTypes.size()] ) );
    col.setDefaultAggregation( defaultAggType.name() );
    col.setSelectedAggregation( defaultAggType.name() );

    // set the alignment
    DataType dataType = c.getDataType();
    FieldType fieldType = c.getFieldType();
    Object obj = c.getProperty( "alignment" ); //$NON-NLS-1$
    if ( obj instanceof Alignment ) {
      if ( obj == Alignment.LEFT ) {
        col.setHorizontalAlignment( Alignment.LEFT.toString() );
      } else if ( obj == Alignment.RIGHT ) {
        col.setHorizontalAlignment( Alignment.RIGHT.toString() );
      } else if ( obj == Alignment.CENTERED ) {
        col.setHorizontalAlignment( Alignment.CENTERED.toString() );
      }
    } else if ( fieldType == FieldType.FACT ) {
      col.setHorizontalAlignment( Alignment.RIGHT.toString() );
    } else if ( fieldType == FieldType.OTHER && dataType == DataType.NUMERIC ) {
      col.setHorizontalAlignment( Alignment.RIGHT.toString() );
    } else {
      col.setHorizontalAlignment( Alignment.LEFT.toString() );
    }
    // set the format mask
    obj = c.getProperty( "mask" ); //$NON-NLS-1$
    if ( obj != null ) {
      col.setFormatMask( (String) obj );
    }

    Boolean hidden = (Boolean) c.getProperty( "hidden" );
    if ( hidden != null ) {
      col.setHiddenForUser( hidden.booleanValue() );
    }

    return col;
  }

  /**
   * Returns a CDA JSON representation of a query result set
   * 
   * @param resultSet
   * @return
   * @throws JSONException
   */
  public String createCdaJson( final IPentahoResultSet resultSet, String locale ) throws JSONException {
    if ( resultSet == null ) {
      return null;
    }
    JSONObject json = new JSONObject();

    // Generate the metadata
    final JSONArray metadataArray = new JSONArray();

    final int columnCount = resultSet.getColumnCount();
    final int rowCount = resultSet.getRowCount();

    for ( int i = 0; i < columnCount; i++ ) {
      JSONObject info = new JSONObject();
      info.put( "colIndex", i ); //$NON-NLS-1$
      info.put( "colName", resultSet.getMetaData().getColumnHeaders()[0][i] ); //$NON-NLS-1$
      DataType type = (DataType) resultSet.getMetaData().getAttribute( 0, i, IPhysicalColumn.DATATYPE_PROPERTY );
      info.put( "colType", type.getName().toUpperCase() ); //$NON-NLS-1$
      LocalizedString name = (LocalizedString) resultSet.getMetaData().getAttribute( 0, i, Concept.NAME_PROPERTY );
      if ( name != null && locale != null ) {
        info.put( "colLabel", name.getString( locale ) ); //$NON-NLS-1$
      }
      metadataArray.put( info );
    }
    json.put( "metadata", metadataArray ); //$NON-NLS-1$

    // add the rows of data
    final JSONArray valuesArray = new JSONArray();
    for ( int rowIdx = 0; rowIdx < rowCount; rowIdx++ ) {

      final JSONArray rowArray = new JSONArray();
      valuesArray.put( rowArray );
      for ( int colIdx = 0; colIdx < columnCount; colIdx++ ) {
        rowArray.put( resultSet.getValueAt( rowIdx, colIdx ) );
      }
    }
    json.put( "resultset", valuesArray ); //$NON-NLS-1$
    return json.toString();
  }

  /**
   * Returns the full domain object for a XML MQL query
   * 
   * @param query
   * @return
   * @throws PentahoMetadataException
   */
  public org.pentaho.metadata.model.Domain getDomainObject( String query ) throws PentahoMetadataException {
    QueryXmlHelper helper = new QueryXmlHelper();
    IMetadataDomainRepository domainRepository = getDomainRepository();
    org.pentaho.metadata.query.model.Query fatQuery = helper.fromXML( domainRepository, query );
    return fatQuery.getDomain();
  }

  /**
   * Converts a thin query model into a full query
   * 
   * @param src
   * @return
   */
  public org.pentaho.metadata.query.model.Query convertQuery( Query src, ModelInfo info ) {

    IMetadataDomainRepository domainRepository = getDomainRepository();

    Domain fullDomain = domainRepository.getDomain( info.getGroupId() );
    LogicalModel logicalModel = fullDomain.findLogicalModel( info.getModelId() );

    // create a new full query object
    org.pentaho.metadata.query.model.Query dest = new org.pentaho.metadata.query.model.Query( fullDomain, logicalModel );

    // now add the selections
    List<Selection> selections = dest.getSelections();
    for ( Element column : src.getElements() ) {
      // get the objects needed for the selection
      LogicalColumn logicalColumn = logicalModel.findLogicalColumn( column.getId() );
      org.pentaho.metadata.model.Category category = getCategory( column.getId(), logicalModel );
      AggregationType aggregationType = AggregationType.valueOf( column.getSelectedAggregation() );
      // create a selection and add it to the list
      Selection selection = new Selection( category, logicalColumn, aggregationType );
      selections.add( selection );
    }

    // now add the filters
    List<Constraint> constraints = dest.getConstraints();
    for ( Condition condition : src.getConditions() ) {
      org.pentaho.metadata.query.model.CombinationType combinationType =
          CombinationType.valueOf( condition.getCombinationType() );
      LogicalColumn logicalColumn = logicalModel.findLogicalColumn( condition.getElementId() );
      String paramName = condition.isParameterized() ? condition.getValue()[0] : null;
      String formula = condition.getCondition( logicalColumn.getDataType().name(), paramName );
      Constraint constraint = new Constraint( combinationType, formula );
      constraints.add( constraint );
    }

    // now set the disable distinct option
    if ( src.getDisableDistinct() != null ) {
      dest.setDisableDistinct( src.getDisableDistinct() );
    }

    // now add the sorting information
    List<org.pentaho.metadata.query.model.Order> orders = dest.getOrders();
    for ( Order order : src.getOrders() ) {
      // find the selection
      for ( Selection selection : selections ) {
        if ( selection.getLogicalColumn().getId().equals( order.getElementId() ) ) {
          Type type = Type.valueOf( order.getOrderType() );
          org.pentaho.metadata.query.model.Order fullOrder =
              new org.pentaho.metadata.query.model.Order( selection, type );
          orders.add( fullOrder );
        }
      }
    }

    // now add the parameter information
    List<org.pentaho.metadata.query.model.Parameter> parameters = dest.getParameters();
    for ( Parameter parameter : src.getParameters() ) {
      // find the column for this parameter
      LogicalColumn logicalColumn = logicalModel.findLogicalColumn( parameter.getElementId() );
      DataType type = logicalColumn.getDataType();
      String[] value = parameter.getValue();
      final String name = parameter.getName() != null ? parameter.getName() : parameter.getElementId();
      org.pentaho.metadata.query.model.Parameter fullParam =
          new org.pentaho.metadata.query.model.Parameter( name, type, value[0] );
      parameters.add( fullParam );
    }
    return dest;
  }

  /**
   * Returns the full category object for a given column within the logical model
   * 
   * @param columnId
   * @param logicalModel
   * @return
   */
  protected org.pentaho.metadata.model.Category getCategory( String columnId, LogicalModel logicalModel ) {
    for ( org.pentaho.metadata.model.Category category : logicalModel.getCategories() ) {
      if ( category.findLogicalColumn( columnId ) != null ) {
        return category;
      }
    }
    return null;
  }

  /**
   * Deserializes a JSON query into a thin Query object
   * 
   * @param json
   * @return
   */
  public Query deserializeJsonQuery( String json ) {
    try {
      // convert the json query into a thin query model
      ClassLoader oldLoader = Thread.currentThread().getContextClassLoader();
      try {
        Thread.currentThread().setContextClassLoader( getClass().getClassLoader() );
        return new JSONDeserializer<Query>().deserialize( json );
      } finally {
        Thread.currentThread().setContextClassLoader( oldLoader );
      }
    } catch ( Exception e ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0007_BAD_JSON", json ), e ); //$NON-NLS-1$
      return null;
    }
  }

  @Override
  public Log getLogger() {
    return logger;
  }

  /**
   * package-local visibility for testing purposes
   */
  IMetadataDomainRepository getDomainRepository() {
    return PentahoSystem.get( IMetadataDomainRepository.class, PentahoSessionHolder.getSession() );
  }
}

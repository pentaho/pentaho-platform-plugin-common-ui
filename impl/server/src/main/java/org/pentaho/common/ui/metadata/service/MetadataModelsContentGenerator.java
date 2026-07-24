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



package org.pentaho.common.ui.metadata.service;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.metadata.datatable.DataTable;
import org.pentaho.metadata.model.thin.Condition;
import org.pentaho.metadata.model.thin.Element;
import org.pentaho.metadata.model.thin.MetadataModelsService;
import org.pentaho.metadata.model.thin.Model;
import org.pentaho.metadata.model.thin.ModelInfo;
import org.pentaho.metadata.model.thin.Order;
import org.pentaho.metadata.model.thin.Parameter;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.OptBoolean;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;


public class MetadataModelsContentGenerator extends SimpleContentGenerator {

  private static final long serialVersionUID = -3934988366302705814L;
  private static final String QUERY_TYPE = "org.pentaho.metadata.model.thin.Query";
  private static final String ELEMENT_TYPE = "org.pentaho.metadata.model.thin.Element";
  private static final String CONDITION_TYPE = "org.pentaho.metadata.model.thin.Condition";
  private static final String LEGACY_CONDITION_TYPE = "org.pentaho.common.ui.metadata.model.impl.Condition";
  private static final String ORDER_TYPE = "org.pentaho.metadata.model.thin.Order";
  private static final String PARAMETER_TYPE = "org.pentaho.metadata.model.thin.Parameter";
  private static final String LEGACY_PARAMETER_TYPE = "org.pentaho.common.ui.metadata.model.impl.Parameter";

  @JsonTypeInfo( use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "class",
      requireTypeIdForSubtypes = OptBoolean.FALSE )
  @JsonSubTypes( @JsonSubTypes.Type( value = Query.class, name = QUERY_TYPE ) )
  private abstract static class QueryMixin {
  }

  @JsonTypeInfo( use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "class",
      requireTypeIdForSubtypes = OptBoolean.FALSE )
  @JsonSubTypes( @JsonSubTypes.Type( value = Element.class, name = ELEMENT_TYPE ) )
  private abstract static class ElementMixin {
    @JsonAlias( "defaultAggType" )
    abstract void setDefaultAggregation( String defaultAggregation );
  }

  @JsonTypeInfo( use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "class",
      requireTypeIdForSubtypes = OptBoolean.FALSE )
  @JsonSubTypes( {
    @JsonSubTypes.Type( value = Condition.class, name = CONDITION_TYPE ),
    @JsonSubTypes.Type( value = Condition.class, name = LEGACY_CONDITION_TYPE )
  } )
  private abstract static class ConditionMixin {
    @JsonAlias( "selectedAggType" )
    abstract void setSelectedAggregation( String selectedAggregation );
  }

  @JsonTypeInfo( use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "class",
      requireTypeIdForSubtypes = OptBoolean.FALSE )
  @JsonSubTypes( @JsonSubTypes.Type( value = Order.class, name = ORDER_TYPE ) )
  private abstract static class OrderMixin {
  }

  @JsonTypeInfo( use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "class",
      requireTypeIdForSubtypes = OptBoolean.FALSE )
  @JsonSubTypes( {
    @JsonSubTypes.Type( value = Parameter.class, name = PARAMETER_TYPE ),
    @JsonSubTypes.Type( value = Parameter.class, name = LEGACY_PARAMETER_TYPE )
  } )
  private abstract static class ParameterMixin {
  }

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private static final ObjectMapper QUERY_OBJECT_MAPPER = createQueryObjectMapper();

  private Log logger = LogFactory.getLog( MetadataModelsContentGenerator.class );

  public static final String LIST_MODELS_ACTION = "listmodels"; //$NON-NLS-1$
  public static final String GET_MODEL_ACTION = "getmodel"; //$NON-NLS-1$
  public static final String QUERY_ACTION = "query"; //$NON-NLS-1$

  static ObjectMapper createQueryObjectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.enable( JsonParser.Feature.STRICT_DUPLICATE_DETECTION );
    // Legacy Flexjson FQCNs are protocol identifiers, not classes that Jackson may load dynamically.
    mapper.addMixIn( Query.class, QueryMixin.class );
    mapper.addMixIn( Element.class, ElementMixin.class );
    mapper.addMixIn( Condition.class, ConditionMixin.class );
    mapper.addMixIn( Order.class, OrderMixin.class );
    mapper.addMixIn( Parameter.class, ParameterMixin.class );
    return mapper;
  }

  @Override
  public void createContent( OutputStream output ) throws Exception {

    IParameterProvider params = parameterProviders.get( IParameterProvider.SCOPE_REQUEST );
    String action = params.getStringParameter( "action", null ); //$NON-NLS-1$

    if ( LIST_MODELS_ACTION.equals( action ) ) {
      String providerId = params.getStringParameter( "providerid", null ); //$NON-NLS-1$
      String groupId = params.getStringParameter( "groupid", null ); //$NON-NLS-1$
      String match = params.getStringParameter( "match", null ); //$NON-NLS-1$
      MetadataModelsService svc = new MetadataModelsService();
      ModelInfo[] infos = svc.getModelList( providerId, groupId, match );
      writeJson( infos, output );
    } else if ( GET_MODEL_ACTION.equals( action ) ) {
      String id = params.getStringParameter( "id", null ); //$NON-NLS-1$
      MetadataModelsService svc = new MetadataModelsService();
      Model model = svc.getModel( id );
      writeJson( model, output );
    } else if ( QUERY_ACTION.equals( action ) ) {
      String queryStr = params.getStringParameter( "query", null ); //$NON-NLS-1$
      int rowLimit = (int) params.getLongParameter( "rowlimit", -1 ); //$NON-NLS-1$
      Query query = QUERY_OBJECT_MAPPER.readValue( queryStr, Query.class );
      MetadataModelsService svc = new MetadataModelsService();
      DataTable table = svc.executeQuery( query, rowLimit );
      writeJson( table, output );
    }

  }

  protected void writeJson( Object object, OutputStream output ) {
    try {
      String jsonStr = OBJECT_MAPPER.writeValueAsString( object );
      output.write( jsonStr.getBytes( StandardCharsets.UTF_8 ) );
    } catch ( Exception e ) {
      logger.error( "Could not write JSON to output stream", e );
    }

  }

  @Override
  public String getMimeType() {
    return "application/json"; //$NON-NLS-1$
  }

  @Override
  public Log getLogger() {
    return logger;
  }

}

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

package org.pentaho.common.ui.metadata.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.pentaho.metadata.model.thin.Query;

/**
 * Compatibility and security coverage for the legacy browser query contract migrated in PPP-6483.
 */
public class MetadataModelsContentGeneratorThinQueryTest {

  private static final ObjectMapper OBJECT_MAPPER = MetadataModelsContentGenerator.createQueryObjectMapper();

  @Test
  public void deserializesBrowserQueryPayload() throws Exception {
    String json = "{"
      + "\"class\":\"org.pentaho.metadata.model.thin.Query\","
      + "\"sourceId\":\"model1\","
      + "\"elements\":[{"
      + "\"class\":\"org.pentaho.metadata.model.thin.Element\","
      + "\"id\":\"el1\",\"parentId\":\"cat1\",\"defaultAggType\":\"SUM\"}],"
      + "\"conditions\":[{"
      + "\"class\":\"org.pentaho.common.ui.metadata.model.impl.Condition\","
      + "\"elementId\":\"el1\",\"parentId\":\"cat1\",\"operator\":\"EQUAL\","
      + "\"value\":[\"x\"],\"combinationType\":\"AND\",\"selectedAggType\":\"SUM\"}],"
      + "\"orders\":[{"
      + "\"class\":\"org.pentaho.metadata.model.thin.Order\","
      + "\"elementId\":\"el1\",\"parentId\":\"cat1\",\"orderType\":\"ASC\"}],"
      + "\"parameters\":[{"
      + "\"class\":\"org.pentaho.common.ui.metadata.model.impl.Parameter\","
      + "\"elementId\":\"el1\",\"name\":\"p1\",\"type\":\"STRING\",\"value\":[\"x\"]}]"
      + "}";

    Query result = OBJECT_MAPPER.readValue( json, Query.class );

    assertEquals( "model1", result.getSourceId() );
    assertEquals( 1, result.getElements().length );
    assertEquals( "el1", result.getElements()[ 0 ].getId() );
    assertEquals( "SUM", result.getElements()[ 0 ].getDefaultAggregation() );
    assertEquals( 1, result.getConditions().length );
    assertEquals( "SUM", result.getConditions()[ 0 ].getSelectedAggregation() );
    assertEquals( 1, result.getOrders().length );
    assertEquals( "ASC", result.getOrders()[ 0 ].getOrderType() );
    assertEquals( 1, result.getParameters().length );
    assertEquals( "p1", result.getParameters()[ 0 ].getName() );
  }

  @Test
  public void deserializesClasslessQueryPayload() throws Exception {
    Query result = OBJECT_MAPPER.readValue(
      "{\"sourceId\":\"model1\",\"elements\":[{\"id\":\"el1\"}]}", Query.class );

    assertEquals( "model1", result.getSourceId() );
    assertEquals( "el1", result.getElements()[ 0 ].getId() );
  }

  @Test
  public void deserializesFlexjsonThinTypeIds() throws Exception {
    String json = "{\"class\":\"org.pentaho.metadata.model.thin.Query\","
      + "\"conditions\":[{\"class\":\"org.pentaho.metadata.model.thin.Condition\","
      + "\"elementId\":\"el1\"}],"
      + "\"parameters\":[{\"class\":\"org.pentaho.metadata.model.thin.Parameter\","
      + "\"elementId\":\"el1\",\"name\":\"p1\"}]}";

    Query result = OBJECT_MAPPER.readValue( json, Query.class );

    assertEquals( "el1", result.getConditions()[ 0 ].getElementId() );
    assertEquals( "p1", result.getParameters()[ 0 ].getName() );
  }

  @Test
  public void rejectsUnknownLegacyTypeId() {
    String json = "{\"class\":\"java.lang.Runtime\",\"sourceId\":\"model1\"}";

    assertThrows( InvalidTypeIdException.class, () -> OBJECT_MAPPER.readValue( json, Query.class ) );
  }

  @Test
  public void rejectsCrossFamilyTypeId() {
    String json = "{\"class\":\"org.pentaho.metadata.model.thin.Element\",\"sourceId\":\"model1\"}";

    assertThrows( InvalidTypeIdException.class, () -> OBJECT_MAPPER.readValue( json, Query.class ) );
  }

  @Test
  public void rejectsUnknownNestedTypeId() {
    String json = "{\"class\":\"org.pentaho.metadata.model.thin.Query\","
      + "\"elements\":[{\"class\":\"java.lang.Runtime\",\"id\":\"el1\"}]}";

    assertThrows( InvalidTypeIdException.class, () -> OBJECT_MAPPER.readValue( json, Query.class ) );
  }

  @Test
  public void rejectsDuplicateTypeId() {
    String json = "{\"class\":\"org.pentaho.metadata.model.thin.Query\","
      + "\"class\":\"org.pentaho.metadata.model.thin.Query\"}";

    assertThrows( JsonParseException.class, () -> OBJECT_MAPPER.readValue( json, Query.class ) );
  }
}

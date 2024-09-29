/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


package org.pentaho.common.ui.metadata.model.impl;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;
import org.pentaho.common.ui.metadata.model.Operator;

public class ConditionTest {
  private static final String TEST_PARAM = "test_param";
  private static final String TEST_CATEGORY = "test_category";
  private static final String TEST_COLUMN = "test_column";

  private Condition condition = new Condition();

  @Before
  public void setUp() {
    condition.setValue( new String[] { "val_0", "val_1" } );
    condition.setCategory( TEST_CATEGORY );
    condition.setColumn( TEST_COLUMN );
  }

  @Test
  public void testGetConditionForStringWithParam() {
    condition.setOperator( Operator.EQUAL.toString() );
    condition.setParameterized( true );
    String result = condition.getCondition( "STRING", TEST_PARAM );
    assertEquals( "[" + TEST_CATEGORY + "." + TEST_COLUMN + "] = [param:" + TEST_PARAM + "]", result );
  }

  @Test
  public void testGetConditionForStringWithoutParam() {
    condition.setOperator( Operator.GREATER_THAN.toString() );
    condition.setParameterized( false );
    String result = condition.getCondition( "STRING", TEST_PARAM );
    assertEquals( "[" + TEST_CATEGORY + "." + TEST_COLUMN + "] >\"val_0\"", result );
  }

  @Test
  public void testGetConditionForDateWithParam() {
    condition.setOperator( Operator.EQUAL.toString() );
    condition.setParameterized( true );
    String result = condition.getCondition( "Date", TEST_PARAM );
    assertEquals( "[" + TEST_CATEGORY + "." + TEST_COLUMN + "] =DATEVALUE([param:val_0])", result );
  }

  @Test
  public void testGetConditionForGreaterDateWithParamAndAggregate() {
    condition.setOperator( Operator.GREATER_THAN.toString() );
    condition.setParameterized( true );
    condition.setSelectedAggType( "test_agg_type" );
    String result = condition.getCondition( "Date", null );
    assertEquals( "[" + TEST_CATEGORY + "." + TEST_COLUMN + ".test_agg_type] >DATEVALUE(\"val_0\")", result );
  }

  @Test
  public void testGetConditionForDateWithoutParam() {
    condition.setOperator( Operator.EQUAL.toString() );
    condition.setParameterized( false );
    String result = condition.getCondition( "Date", TEST_PARAM );
    assertEquals( "[" + TEST_CATEGORY + "." + TEST_COLUMN + "] =DATEVALUE(\"val_0\")", result );
  }
}

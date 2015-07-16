# Visualization API 2.0 shim layer

## Contents

* the framework classes: `pentaho.VizController`, `pentaho.DataTable` and `pentaho.DataView`
* the events façade exposed by the methods in namespace: `pentaho.events`
* the `pentaho.visualizations` array, where visualization definitions are registered

## Changes

The original files were not AMD and so could be loaded either by a script tag or by AMD.
However, although the provided shim files register the same global variables, they are AMD and, as such, **MUST** be loaded by AMD.

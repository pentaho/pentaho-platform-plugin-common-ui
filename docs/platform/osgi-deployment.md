---
title: OSGi/Karaf Artifacts Deployment
description: Explains how to deploy OSGi/Karaf artifacts to the Pentaho Platform.
parent-title: ""
layout: default
---

The Pentaho platform is built on top of an [OSGi](https://www.osgi.org/) container 
([Apache Karaf](https://karaf.apache.org)).
It allows for a simple modular approach at both development time and runtime, 
reducing complexity and facilitating deployment.

The [OSGi/Karaf artifacts](osgi-web-project#osgikaraf-artifacts): bundle, feature file and KAR file, can be deployed to the Pentaho platform by 
dropping them to the **Karaf deploy** directory. Hot deployment is generally supported.
Artifacts are automatically installed and activated (and remain so, even after restarts of the product). 
Replacing an artifact in the deploy folder will reinstall it. Deleting it, will uninstall it.

Depending on the Pentaho product, the _Karaf deploy_ folder is located at:
- PDI: `system/karaf/deploy`
- Pentaho Server: `pentaho-solutions/system/karaf/deploy`.

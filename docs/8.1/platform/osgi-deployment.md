---
title: OSGi Artifacts Deployment
description: Explains how to deploy OSGi/Karaf artifacts to the Pentaho Platform.
layout: 8.1_default
---

The Pentaho platform is built on top of an [OSGi](https://www.osgi.org/) container 
([Apache Karaf](https://karaf.apache.org)).
It allows for a simple modular approach at both development time and runtime, 
reducing complexity and facilitating deployment.

The Pentaho platform supports deployment via dropping files into the deploy folder. Hot deployment is generally supported.
Artifacts are automatically installed and activated (and remain so, even after restarts of the product). 
Replacing an artifact in the deploy folder will reinstall it. Deleting it, will uninstall it.

When a new file is detected in the deploy folder, the platform "delegates" the file handling to the Pentaho Web Package deployer.

The deployer is able to handle zip and tgz files that include web resources described by a `package.json` file.
Multiple web packages can be contained in a single archive, e.g. for provisioning visualization's dependencies.

Depending on the Pentaho product, the _Karaf deploy_ folder is located at:
- PDI: `system/karaf/deploy`;
- Pentaho Server: `pentaho-solutions/system/karaf/deploy`.

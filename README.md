# Grafana Network Weathermap Plugin

This plugin brings customizeable and modern looking network weathermaps to Grafana. The design remains similar to the well known [PHP Network Weathermap](https://www.network-weathermap.com/), well allowing for interoperability with Grafana, and easy customization.

[Link to the wiki! (WIP)](https://grafana-weathermap.seth.cx/)

This project is still a work in progress. It is currently not yet signed for use in Grafana (coming soon), and also may have some bugs or inefficiences that need to be worked out. A large portion of basic functionality is currently completed and what remains to be added is mostly more options for customization and layout.

Currently, I cannot guarantee that there will be consistent state versioning between plugin versions, meaning it is possible that an update could force you to recreate your weathermap. If you really do build something large, and want to ensure it is easier to port over to a newer version, you can export the entire weathermap into a JSON file using the button at the bottom of the editing panel (although this itself is a very much alpha feature).

**If you would like to simply test the plugin to play around in your own environment, please clone this repo and then follow the directions in the [testing README](https://github.com/knightss27/grafana-network-weathermap/tree/main/testing#readme).**

Example layout:
![Example Image](https://github.com/knightss27/grafana-network-weathermap/blob/main/src/img/general-example.svg)

# Grafana Network Weathermap Plugin

This plugin brings customizeable and modern looking network weathermaps to Grafana. The design remains similar to the well known [PHP Network Weathermap](https://www.network-weathermap.com/), well allowing for interoperability with Grafana, and easy customization.

[Link to the wiki! (WIP)](https://grafana-weathermap.seth.cx/) or [download the latest version.](https://github.com/knightss27/grafana-network-weathermap/releases/latest/)

This project is still a work in progress. It is currently not yet signed for use in Grafana (coming soon), and also may have some bugs or inefficiences that need to be worked out. My roadmap to a 1.0 release is filled out, I am now hoping to do some more significant beta testing, including general bugs and stress tests. If you are interested in testing this plugin (and leaving some feedback), please let me know!

The data/state layout is fairly consistent as it stands, and I will do my best not to create more breaking changes. In the case that I do, I will also release a system to either easily convert (or directly import) old plugin version exports.

If you really do build something large and want to ensure it is easier to port over to a newer version, you can export the entire weathermap into a JSON file using the button at the bottom of the editing panel.

**If you would like to simply test the plugin to play around in a separate environment, please clone this repo and then follow the directions in the [testing README](https://github.com/knightss27/grafana-network-weathermap/tree/main/testing#readme).**

Example layout:
![Example Image](https://github.com/knightss27/grafana-network-weathermap/blob/main/src/img/general-example.svg)

# FAQ

- Q: I am using the Zabbix datasource and the only option in the query selection dropdown is "wide"?
    - In the Zabbix datasource settings, please try turning off the "data alignment" property, you may also get this to work for a specific query by disabling data alignment under the query's "Options" section. Taken from [Issue #28](https://github.com/knightss27/grafana-network-weathermap/issues/28).

- Q: I am using the Zabbix datasource and can only select one of my queries (but it is labeled properly)?
    - Try selecting multiple Zabbix "Items" through one Grafana query by using Regex in the "Item" area of the query editor. Taken from [Issue #38](https://github.com/knightss27/grafana-network-weathermap/issues/38).

- Q: I am unable to select one of my data queries, even though it shows up in the query selection dropdown. What's happening?
    - See the note on: [Adding Data](/#adding-data).

- Q: Can I upload an image as a background? Will this be added as a feature?
    - Yes you can now! For node icons as well. You simple have to host the image somewhere and can insert the URL into the image box under the panel customization.

- Q: Plugin is throwing `toReturn.source is undefined`?
    - Just reload or force reload the page. I have yet to properly track down this bug, but rest assured it seems to only occur directly after saving and applying your changes and can be easily fixed.


Other problems and you're somehow on this page before Github? [Leave a new issue!](https://github.com/knightss27/grafana-network-weathermap/issues)
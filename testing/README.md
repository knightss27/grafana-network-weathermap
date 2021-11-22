This docker-compose provides three main containers, to be used while testing the network weathermap.

1. Grafana (with the latest published version of the plugin installed)*
2. Prometheus (pointed to look at the exporter)
3. Exporter (a prometheus exporter which generates fake varied and constant bandwidth data)

Since their connection relies on your local IP, please ensure that the final IP in `exporter/prometheus.yml` represents your local IP.

To start, run:

```bash
cd testing
docker compose build
docker compose up
```

The Grafana instance will be pointed to `localhost:3000`, Prometheus to `:9090` and the exporter to `:8080`.

To connect Prometheus to Grafana, log in to Grafana and add a new data source, setting the URL to your local IP `:9090`.

Now you can create a new dashboard, add a network weathermap panel, and begin creating your own testing weathermap! You can add the query to Prometheus when editing the weathermap panel, setting the metric to `wm_bandwidth_data` and the legend to `{{type}}`. You can now select either of these from the query selector when creating a link.

![image](https://user-images.githubusercontent.com/52898165/142757612-a19c60ae-edbb-4ea2-a9bd-3625c5e8e834.png)

The exporter uses Perlin noise to alternate between 0Mb/s and 1Mb/s smoothly for the `varied` metric. The `constant` metric remains at 700Kb/s.

I will be working soon to also have the panel and data source created for you, with a starting layout in the weathermap as well.

\* This currently builds using Grafana v8.1.1, as the plugin was originall developed on that version, and I have yet to do more testing to ensure compatability with earlier and later versions.

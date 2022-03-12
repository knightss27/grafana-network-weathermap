This docker-compose provides three main containers, to be used while testing the network weathermap.

1. Grafana (with the latest published version of the plugin installed)\*
2. Prometheus (pointed to look at the exporter)
3. Exporter (a prometheus exporter which generates fake varied and constant bandwidth data)

To start, run:

```bash
cd testing
docker compose build
docker compose up
```

The Grafana instance will be pointed to `localhost:3000`. Upon opening, you will find a small test layout of the plugin layed out, already connected to the Prometheus instance. Feel free to edit and play around as you please.

The exporter uses Perlin noise to alternate between 0Mb/s and 1Mb/s smoothly for the `varied` metric. The `constant` metric remains at 700Kb/s.

\* This currently builds using Grafana v8.1.8, as the plugin was originally developed on that version. It should work forwards from there however, so feel free to change the docker-compose.

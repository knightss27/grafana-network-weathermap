# Getting Started

## Installation

For testing with Docker, follow the instructions on the [testing README](https://github.com/knightss27/grafana-network-weathermap/tree/main/testing#readme). This will provide you with an instance to play around with.

To install unsigned to your own Grafana instance, download the [latest release zip](https://github.com/knightss27/grafana-network-weathermap/releases/latest/). This page will be updated once this plugin is officially on the Grafana plugin store (which you will be able to install from there or using their cli).

## Creating a New Weathermap

1. In Grafana, create a new `Empty Panel`.
2. Change the visualisation in the top right corner to `Network Weathermap`.
3. You now have a brand new network weathermap panel! 🎉
4. Learn about weathermap basics below!

---

## On Startup

By default, the panel will start completely blank, looking something like this:

![Blank Panel](img/basics/1-on-startup.png)

## Adding Nodes

- Make sure you have selected `Edit` on the panel in Grafana.
- On the right hand side, find the `Nodes` editor.
  ![Nodes 0](img/basics/2-nodes-0.png)
- Click `Add Node` to create a new node.
- Nodes have three basic fields:
  - X position (`number`): Node's X position.
  - Y position (`number`): Node's Y position.
  - Label (`string`): The text visible on the node.
- You can then move the node by dragging it with your mouse.

## Adding Links

- Ensure you have at least two nodes.
- On the right hand side, find the `Links` editor.
  ![Nodes 1](img/basics/2-nodes-1.png)
- Click `Add Link` to create a new link.
- Links are split into two sides, `A` and `B`.
- Each side has four central fields:
  - Side (`Node`): The node this side of the link connects to.
  - Query (`Query`): A query representing the current side's throughput in `bits/sec`.
  - Bandwidth # (`number`): A number representing the bandwidth of this side in `bits`.
  - Bandwidth Query (`Query`): A query representing the bandwidth of this side in `bits`.
- Select `A` and `B` side nodes from their respective dropdowns.

## Setting Thresholds

- The weathermap color scale allows you to color links based on their bandwidth usage.
- On the right hand side, find the `Color Scale` editor.
  ![Nodes 2](img/basics/2-nodes-2.png)
- Click `Add Scale Value` to create a new threshold.
- Each threshold has two basic fields:
  - % (`number`): The percent of bandwidth usage at which to _start_ this threshold.
  - Color (`picker`): The color of this threshold, can be any valid CSS `color` chosen or input with the picker.
    - `green` | `#00FF00` | `rgb(0, 255, 0)`
- By default, the scale will fill from the highest threshold to 100%. You can see the scale in the top left of the panel.

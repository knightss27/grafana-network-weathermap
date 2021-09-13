# Basic Setup

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
  - Color (`string`): The color of this threshold, can be any valid CSS `color`.
    - `green` | `#00FF00` | `rgb(0, 255, 0)`
- By default, the scale will fill from the highest threshold to 100%.

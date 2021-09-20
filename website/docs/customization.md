# Visual Customization

Once you've gotten a basic layout done, you may be wondering how to customize the way things look, to suit your personal feel.

## Common Terminology

The diagram below illustrates some of the basic terminology this plugin uses.
![Basic Constants](/img/customization/1-constants.png)

## Panel Settings

There are three main panel settings:

- Background Color (`color`): Use the picker to set whatever background you want (including transparent).
- Viewbox Width (`number`): The width in pixels of the SVG viewbox.
- Viewbox Height (`number`): The height in pixels of the SVG viewbox.

By default, the panel's SVG will attempt to take up as much space both vertically and horizontally within the Grafana plugin panel as possible while still maintaining the viewbox aspect ratio.

### Arranging Links

One of the most important parts of creating a weathermap is arranging the links between nodes. Depending on the orientation of these links, some specific settings may work best.

## Link Options

- Anchors:
    - Each node has 5 anchors that any link side can connect to:
        - (`Center | Top | Bottom | Left | Right`)
    - This makes it easy to try and avoid having too many overlapping links. By default, links are auto-spaced to be as far apart as possible when parallel to each other vertically (attached to a `Bottom` of one link, and `Top` of another). When parallel vertically (attached to a `Right` of one link, and `Left` of another), nodes will automatically grow to accomodate them.
- Label Offset # (`number`): A number between 0 and 100 representing the location of the link's label as a percentage of that link's length. (Play around with it to see how it works! This is especially useful if you have close / overlapping links which need their labels to not overlap.)

### Global Link Options
These options are set on all links.

- Stroke Width (`number`): A number in pixels, representing the stroke width of all links.
- Spacing Horizontal (`number`): A number in pixels, representing the spacing used between links when a node has `Constant Spacing` set to true.
- Spacing Vertical (`number`):  A number in pixels, representing the spacing used vertically between links, when a node has `Collapse Vertical Links` set to false (the default).

### Global Arrow Options
These options are set on all arrows.

- Width (`number`): The width of the arrow in pixels. (You probably want it >= the link stroke width.)
- Height (`number`): The height of the arrow in pixels (how long it looks).
- Offset (`number`): The distance from the meeting point of the two links the point of the arrow will reach to. This is the offset for *one* side of the link, meaning the actual space between two arrows will be twice this number.

## Node options:

- In the `Advanced` section of the `Nodes` editor, there are two toggles:
    - Constant Spacing: Should links be a certain `Link Spacing Horizontal (px)` apart?
        - This setting is useful if you have two nodes with signficant differences in text length, as by default the plugin will space links evenly across a `Top | Bottom` anchor. Switching to a constant spacing forces these links to be the same pixel distance apart.
    - Compact Vertical Links: Should nodes ignore the number of links attached to their sides?
        - This setting lets you decide whether an individual node will grow when there is more than one link attached to either `Left | Right` anchor. When on, a node will always only be the size of its text and padding. When off, a node will grow so that links going left to right do not overlap (these links will be `Link Spacing Vertical (px)` apart).

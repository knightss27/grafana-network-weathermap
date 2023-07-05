# Reference

This page documents all editing fields with their expected inputs and usage. It is not necessarily descriptive about _how_ to use some of these fields.

## Node

---

| Field | Type | Description |
|-------|------|-------------|
| X | `number` | X position |
| Y | `number` | Y position |
| Label | `string` | Text displayed on the node, when set to an empty string the node's outline is not drawn |
| Dashboard Link | `string` | URL which clicking on this node will direct you to |
| **Icon:** |
| - Icon | `Icon` | SVG icon drawn with the node, or a custom image |
| - Width | `number` | Bounding width (icon will maintain its original aspect ratio) |
| - Height | `number` | Bounding height (icon will maintain its original aspect ratio) |
| - Padding Horizontal | `number` | Padding in pixels to the left and right of the icon |
| - Padding Vertical | `number` | Padding in pixels above and below the icon |
| - Draw Inside | `boolean` | Draw the icon within the outline of the node |
| **Padding:** |
| - Horizontal | `number` | Padding to the left and right of the label |
| - Vertical | `number` | Padding above and below the label |
| **Status** |
| - Query | `Query` | Query for the Node's status. 0 or null is DOWN, 1 or above is UP |
| - StatusDown Color | `picker` | The color to outline the node with when DOWN |
| **Advanced:** |
| - Constant Spacing | `boolean` | Use global link spacing values for this node |
| - Compact Vertical Links | `boolean` | Do not allow the node to grow vertically |
| - Use As Connection | `boolean` | Draw this node as a connection for use with two links |
| **Colors:** |
| - Background Color | `picker` |
| - Border Color | `picker` |
| - Font Color | `picker` |

## Link

---

| Field | Type | Description |
|-------|------|-------------|
| **A/Z Side:** |
| - Side | `Node ` |
| - Query | `Query` | Query for link throughput |
| - Bandwidth # | `number` | Manual entry for link bandwidth |
| - Bandiwdth Query | `Query` | Query for link bandwidth |
| - Label Offset % | `number` | Distance along this link at which to draw the throughput information |
| - Anchor Point | `Anchor` |
| - Dashboard Link | `string` | URL which clicking on this link will take you to |
| **Options:** |
| - Units | `Unit` | The units for this link's throughput and bandwidth queries, defaults to `bits/sec (IEC)` |
| - Show Throughput as Percentage | `boolean` | Whether or not to show the throughput labels as percentages of bandwidth |
| **Stroke and Arrow** |
| - Stroke Width | `number` | Width of each link |
| - Arrow Width | `number` | Distance from left vertex to right vertex of the arrow |
| - Arrow Height | `number` | Distance from base to tip vertiex of the arrow |
| - Arrow Offset | `number` | Distance between arrow tips in links |

## Global

---

### Panel Options

| Field | Type | Description |
|-------|------|-------------|
| Background Color | `picker` |
| Background Image | `url` |
| Viewbox Width (px) | `number` | SVG viewbox width, allows for drawing larger maps |
| Viewbox Height (px) | `number` | SVG viewbox height, allows for drawing larger maps |
| Zoom Scale | `number` | The viewport zoom, negative is zoomed in, positive zoomed out |
| View Offset X | `number` | The viewport center X position as an offset from (0,0) |
| View Offset Y | `number` | The viewport center Y position as an offset from (0,0) |
| Display Timestamp | `boolean` | Turn the timestamp on or off |

### Link Options

| Field | Type | Description |
|-------|------|-------------|
| Toggle All as Percentage Throughput | `boolean` | Shows all link labels as percentages (but does not override individual link settings when turned off) |
| Default Link Units | `Unit` | The default units used when no specific unit has yet been set on a link |
| Base Color | `picker` | Link color displayed when no data is available |
| Spacing Horizontal | `number` | Constant spacing used between links on `Top` or `Bottom` anchors |
| Spacing Vertical | `number` | Constant spacing used betwene links on `Left` or `Right` anchors |
| **Label:** |
| - Background Color | `picker` |
| - Border Color | `picker` |
| - Font Color | `picker` |

### Grid Options

| Field | Type | Description |
|-------|------|-------------|
| Enable Node Grid Snapping | `boolean` |
| Grid Size (px) | `number` |
| Grid Guides | `boolean` | Enables visual guides for grid snapping |

### Font Options

| Field | Type | Description |
|-------|------|-------------|
| Node Font Size | `number` |
| Link Font Size | `number` |

### Tooltip Options

| Field | Type | Description |
|-------|------|-------------|
| Background Color | `picker` |
| Text Color | `picker` |
| Font Size | `number` |
| Inbound Graph Color | `picker` |
| Outbound Graph Color | `picker` |

### Scale Options

| Field | Type | Description |
|-------|------|-------------|
| Title | `string` |
| Width | `number` | Width of the scale's color box |
| Height | `number` | Height of the scale's color box, equal to a 100% threshold |
| Position X | `number` |
| Position Y | `number` |
| Title Font Size | `number` |
| Threshold Font Size | `number` |
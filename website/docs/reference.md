# Reference

This page documents all editing fields with their expected inputs and usage. It is not descriptive about _how_ to use these fields.

## Node

---

| Field | Type | Description |
|-------|------|-------------|
| X | `number` | X position |
| Y | `number` | Y position |
| Label | `string` | Text displayed on the node, when set to an empty string the node's outline is not drawn |
| **Icon:** |
| - Icon | `Icon` | SVG icon drawn with the node |
| - Width | `number` | Bounding width (icon will maintain its original aspect ratio) |
| - Height | `number` | Bounding height (icon will maintain its original aspect ratio) |
| - Padding Horizontal | `number` | Padding in pixels to the left and right of the icon |
| - Padding Vertical | `number` | Padding in pixels above and below the icon |
| - Draw Inside | `boolean` | Draw the icon within the outline of the node |
| **Padding:** |
| - Horizontal | `number` | Padding to the left and right of the label |
| - Vertical | `number` | Padding above and below the label |
| **Advanced:** |
| - Constant Spacing | `boolean` | Use global link spacing values for this node |
| - Compact Vertical Links | `boolean` | Do not allow the node to grow vertically |
|  Use As Connection | `boolean` | Draw this node as a connection for use with two links |
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

## Global

---

### Panel Options

| Field | Type | Description |
|-------|------|-------------|
| Background Color | `picker` |
| Viewbox Width (px) | `number` | SVG viewbox width, allows for drawing larger maps |
| Viewbox Height (px) | `number` | SVG viewbox height, allows for drawing larger maps |

### Link Options

| Field | Type | Description |
|-------|------|-------------|
| Base Color | `picker` | Link color displayed when no data is available |
| Stroke Width | `number` | Width of each link |
| Spacing Horizontal | `number` | Constant spacing used between links on `Top` or `Bottom` anchors |
| Spacing Vertical | `number` | Constant spacing used betwene links on `Left` or `Right` anchors |
| **Label:** |
| - Background Color | `picker` |
| - Border Color | `picker` |
| - Font Color | `picker` |

### Arrow Options

| Field | Type | Description |
|-------|------|-------------|
| Width | `number` | Distance from left vertex to right vertex of the arrow |
| Height | `number` | Distance from base to tip vertiex of the arrow |
| Offset | `number` | Distance between arrow tips in links |

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
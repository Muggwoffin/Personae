---
type: location
cssclasses:
  - location-note
name: <% tp.file.title %>
aliases: []
significance:
location_type:
country:
address:
location:
active_from:
active_to:
related_people: []
related_organisations: []
tags: []
created: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.file.title %>

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```

> [!info] Add the map
> Set the **location** property to this place's coordinates as two values — latitude, then longitude. The quickest way: copy `lat, long` from Google Maps (right-click the spot → click the coordinates), then run the command **"Research Tools: Paste coordinates into this note"** — it fills the property and the map below reads it automatically. It also appears on the [[Network Map]].

```leaflet
id: <% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") %>
tileServer: https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}
height: 340px
defaultZoom: 12
coordinates: [[<% tp.file.title %>]]
markerFile: [[<% tp.file.title %>]]
```

```dataviewjs
await dv.view("Vault Settings/scripts/location-infobox");
```

## Overview

## History

## Project Significance

## Related Notes

```dataviewjs
await dv.view("Vault Settings/scripts/related-notes");
```

## Notes

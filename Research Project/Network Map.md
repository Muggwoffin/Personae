---
type: map
cssclasses:
  - map-note
tags:
  - network-map
---

# Network Map

Two maps **fill themselves in** automatically: **Locations** from each location note's `location` property, and **Birthplaces** from each person note's `location` property — just add coordinates to a note and a marker appears. The **Deaths** map is kept as manual `marker:` lines, because Leaflet's auto-marker only reads the `location` field.

## Locations

Every location note's `location` property.

```leaflet
id: network-locations
tileServer: https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}
lat: 55
long: 40
defaultZoom: 4
height: 500px
markerFolder: Research Project/Locations
```

## Birthplaces

Every person note's `location` (birthplace) property.

```leaflet
id: network-births
tileServer: https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}
lat: 55
long: 40
defaultZoom: 3
height: 500px
markerFolder: Research Project/People
```

## Deaths

Add a `marker:` line per death below (Leaflet's auto-marker only reads the `location` field, so deaths are listed manually).

```leaflet
id: network-deaths
tileServer: https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}
lat: 55
long: 40
defaultZoom: 3
height: 500px
marker: default, 56.2742, 38.0744, "[[Vladimir Lenin]] — died Gorki (example)"
```

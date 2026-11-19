# Well Layers

[Open Well Layers](https://coolcode.ca/welllayers/)

<!-- coolcode:guide -->
At 20 m, Langley 30145 records “coarse sand” and Hammonds Plains 000119 records “shale / unknown”. Use the paired example to read both intervals, then open the all-logs table to see what every sampled well records at that same depth. Switch units without moving the selected physical depth. The table distinguishes explicit unknown terms, an empty material field, overlapping intervals, gaps and the end of a log.
<!-- /coolcode:guide -->

## Reading the records

The B.C. selection follows 18 stable Langley well tags with usable driller descriptions. In the 2020 Nova Scotia Access database, the importer joins stratigraphy rows to colour, description and lithology lookup tables. It selects eight wells spaced across sorted well numbers for each of six rural Halifax County communities, requiring at least two valid intervals. These examples do not constitute a geological survey of either region. Only the public well identifier, nearest community, province and recorded layers are published.

The driller’s source unit is feet. Metres use the exact factor 0.3048. Layers with absent or invalid depth bounds are omitted. Recorded intervals without a material description remain labelled, gaps are explicitly indicated, and the lower edge of the longest record determines the scale. Numbered bands show drilling order. Both columns now share a single labelled vertical axis. Consecutive bands use different fills and print the source material where space permits. Select any band to read its midpoint. Switch the depth axis to the shallower bottom to inspect thin surface intervals. The full description and any BC observation appear beside each result. Each column starts at local ground level. Raw logs can contain overlapping intervals. Corrected or incomplete records should be checked against the provincial sources.

The address bar keeps the selected wells and depth units when a selection changes. Reopen the [Langley 30145 and Hammonds Plains 000119 comparison](https://coolcode.ca/welllayers/?left=BC-30145&right=NS-000119&units=m&depth=20#depth-probe) to inspect both logs at 20 metres.

## Reading one depth across the sample

The depth lookup uses the interval that begins at or above the chosen point and ends strictly below it. At 50 ft (15.24 m), Langley 30145 enters its coarse-sand interval. At 73 ft (22.2504 m), the log reaches its final boundary. An uncovered depth above the last boundary is a gap. An overlap displays every covering interval.

A blank BC material field can still have an observation. The Nova Scotia archive supplies separate coded fields, and the display retains the terms from their provincial lookups. For example, “shale / unknown” includes a reported term alongside an unknown term. The location and evidence filters apply to the full sampled collection. All depths start at local ground level, which differs between sites.

## Data and updates

[B.C. GWELLS API](https://apps.nrs.gov.bc.ca/gwells/api/) and [Nova Scotia Well Logs Database](https://novascotia.ca/nse/groundwater/welldatabase.asp) supply the underlying records. A monthly GitHub Action downloads the sources and validates the complete edition. The homepage reads the count and retrieval date from [status metadata](https://coolcode.ca/welllayers/data/status.json). The date records when the upstream data was read. Each archive retains its original coverage. When a refresh fails the previously published edition remains available.

## Development

The browser interface lives in `web/`. Run `python3 scripts/refresh.py` to retrieve the source records; install mdbtools first for the Nova Scotia Access export. Run `node --test tests/*.test.mjs`, `python3 -m unittest discover -s tests`, and `python3 scripts/build.py` for a local build. Successful main builds deploy independently to GitHub Pages. Searches and comparisons stay in the browser.

BC observations and coded descriptors are displayed separately from the material field. For Langley tag 30145, GWELLS leaves the first material blank but supplies an observation about a dug well. The numbered bands show drilling order. The empty-material fill is grey. Empty depths below the final log boundary appear separately from hatched gaps within a log. Neither layer order nor similar depths establish a shared formation, aquifer or well yield.

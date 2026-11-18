# Well Layers

[Open Well Layers](https://coolcode.ca/welllayers/)

<!-- coolcode:guide -->
Compare Langley well 48 with a Fall River log. Switch between feet and metres to see both drillers’ recorded depths on a common scale.
<!-- /coolcode:guide -->

## Reading the records

The B.C. selection follows 18 stable Langley well tags with usable driller descriptions. In the 2020 Nova Scotia Access database, the importer joins stratigraphy rows to colour, description and lithology lookup tables. It selects eight wells spaced across sorted well numbers for each of six rural Halifax County communities, requiring at least two valid intervals. These examples do not constitute a geological survey of either region. Only the public well identifier, nearest community, province and recorded layers are published.

The driller’s source unit is feet. Metres use the exact factor 0.3048. Layers with absent or invalid depth bounds are omitted. Recorded intervals without a material description remain labelled, gaps are explicitly indicated, and the lower edge of the longest record determines the scale. Colours distinguish adjacent intervals and carry no lithology classification. Each column starts at local ground level. Raw logs can contain overlapping intervals. Corrected or incomplete records should be checked against the provincial sources.

## Data and updates

[B.C. GWELLS API](https://apps.nrs.gov.bc.ca/gwells/api/) and [Nova Scotia Well Logs Database](https://novascotia.ca/nse/groundwater/welldatabase.asp) supply the underlying records. A monthly GitHub Action downloads the sources and validates the complete edition. The homepage reads the count and retrieval date from [status metadata](https://coolcode.ca/welllayers/data/status.json). The date records when the upstream data was read. Each archive retains its original coverage. When a refresh fails the previously published edition remains available.

## Development

The browser interface lives in `web/`. Run `python3 scripts/refresh.py` to retrieve the source records; install mdbtools first for the Nova Scotia Access export. Run `node --test tests/*.test.mjs`, `python3 -m unittest discover -s tests`, and `python3 scripts/build.py` for a local build. Successful main builds deploy independently to GitHub Pages. Searches and comparisons stay in the browser.

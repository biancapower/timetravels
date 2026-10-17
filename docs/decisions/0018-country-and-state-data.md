# 0018. Countries from the time-zone database, states from GeoNames

**Context.** The place search found only the cities that name time zones, plus a short list of aliases. Searching "india" found Indianapolis and islands in the Indian Ocean but no Indian city, and nobody could search for "Tasmania" or "Japan". Finding places by country and state needs data the browser doesn't have: which zones each country uses, and the names of states, provinces and territories with the zones their people use.

**Decision.**

- **Countries** come from the time-zone database's `zone.tab`, which lists each country's zones. Their names come from the browser (`Intl.DisplayNames`), so they follow the interface language.
- **States, provinces and territories** come from [GeoNames](https://www.geonames.org/): its `admin1CodesASCII.txt` for the names, and `cities1000` for which zones each state's people use. A zone counts for a state when at least 1% of the state's people, by its cities' populations, live in it. Only countries with more than one zone get their states, since a state in a one-zone country is found as the country. Their names are in English.
- **A script, `scripts/places-data.js`,** downloads the inputs and writes `src/places/regions.json`, one entry per line, with the database version and the GeoNames date in it. It is run by hand to update the data, as with a time-zone database update. The inputs aren't committed (the cities file alone is 11 MB); the written file is, so each update is a reviewable diff.
- **How they read:** a country or state with one zone is a place by its own name ("in Japan", "in Tasmania"). One with several zones gives a place for each, named with the zone's city ("Australia: Perth"), in the list and in the sentence. A state named like a country or like a place in another zone gets its country ("Georgia, United States").
- **Credit:** About's credits name the time-zone database and GeoNames, link to GeoNames and to CC BY 4.0, say the data was reduced, and say GeoNames provides it without warranty. `third-party-licences.txt` carries the same, with the files used and how they were changed.
- **Size budget:** 15 KB gzipped. Measured: the main bundle grows from 157.7 KB to 167.7 KB gzipped, 9.9 KB for the data and code.

**Alternatives.**

- **`zone1970.tab`,** the database's newer table: it groups countries that have shared clocks since 1970 under one zone, so 93 countries map only to another country's city, and Iceland would read "Iceland: Abidjan". `zone.tab` gives each country its own zones; the database calls it deprecated for new programs but still publishes it.
- **Unicode CLDR** for state names: it has names but no link from a state to its zones, so about 650 links would be written by hand.
- **Natural Earth's state boundaries with timezone-boundary-builder's zone boundaries:** no credit needed for Natural Earth, but the zone boundaries are ODbL, whose share-alike terms reach a derived database, and it needs a map-processing pipeline.
- **An npm package** such as `countries-and-timezones`: maintained by someone else, but it has no states, ships more than is needed, and isn't the database's own table. It would also be a new dependency.
- **All states, including those of one-zone countries:** about 34 KB gzipped, over the budget, for places the country already finds.

**Reasons.** GeoNames is the only source found that links each state to its zones without writing the links by hand. Its licence, CC BY 4.0, allows this use with credit: GeoNames asks that "You should give credit to GeoNames when using data or web services with a link or another reference to GeoNames" ([GeoNames export](https://www.geonames.org/export/)), and CC BY 4.0 lets the credit be given "in any reasonable manner based on the medium", including "by providing a URI or hyperlink to a resource that includes the required information" (section 3(a)(2), [CC BY 4.0 legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en)). `zone.tab` is in the public domain. Both read on 2026-10-17. The 1% threshold keeps the zones a state's people actually use and drops the edges: Broken Hill drops out of New South Wales and Lindeman out of Queensland, while Indiana keeps three zones and Texas two.

**Consequences.** There are about 1,000 more places. Countries and states are offered once something is typed, not in the list a picker opens with: with them in it, opening the place picker took 800 to 1,400 ms on a phone profile with its processor slowed four times, against 480 to 1,050 ms before. In the results, a place named exactly comes first, then cities, then countries and states, so "tok" gives Tokyo before Tokelau. GeoNames assigns zones city by city, so a state's zones can be wrong at its edges; that wasn't audited beyond the examples above. Zone abbreviations ("PST"), state names in other languages, and the review's other search findings are not part of this.

**Status.** The data sources were recommended by a research subagent (Claude Opus) and proposed by Claude; approved by @biancapower, 2026-10-17.

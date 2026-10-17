# 0017. The question is kept in the address's query string

**Context.** The address was always `timetravels.dev/`, so a question couldn't be sent to someone, bookmarked or stepped back through with Back, and a reload kept only the place. Help and About already use the part after `#`. Once addresses with questions in them are shared, they have to keep working, so the format is a lasting commitment.

**Decision.** The question goes in the query string, one readable parameter per part:

| Parameter | Holds | Example |
|---|---|---|
| `in` | The place asked about, as a time-zone id | `in=Europe/London` |
| `when` | `from-now`, `ago`, `after` or `before`; absent for right now | `when=from-now` |
| `for` | The duration, in the duration field's own syntax | `for=10h`, `for=1h30m`, `for=6mo` |
| `at` | The chosen time, for `after` and `before` | `at=15:00` |
| `day` | `yesterday` or `tomorrow`; absent for today | `day=tomorrow` |
| `at-in` | Whose time the chosen time is, as a time-zone id | `at-in=Australia/Sydney` |

For example, `timetravels.dev/?in=Europe/London&when=after&for=10h&at=15:00&at-in=Australia/Sydney`.

- **No "here" or "my time".** Those mean whoever is looking, so the address names the zone instead, and a zone that matches the device reads as "here" again on opening.
- **Places as time-zone ids,** which are unambiguous and which the time-zone database keeps working when it renames one. A city that shares another's zone, such as Canberra with Sydney, opens as the zone's own city.
- **Home and named places as their city.** They exist only on the device that saved them.
- **The question, not a moment.** "10 hours from now" counts from when the address is opened.
- **A part that can't be read falls back** to that part's default, and the rest still applies.
- **Opening an address doesn't change what is saved.** The remembered place changes only when the person picks one.
- **Each change is a step for Back;** a typed duration is one change, when it is set.

**Alternatives.** The part after `#`: browsers never send it to the server ("The fragment is not sent to the server when the URI is requested", [MDN](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment)), but it would share the `#` with Help and About. Words in the path, such as `/london/10-hours-from-now`: the easiest to read, but they need server and offline fallbacks, and English words in a lasting address work against translation. City names instead of zone ids: easier to read, but not unique, and not stable as aliases are added.

**Reasons.** A query string is the conventional place for a page's settings, it keeps the `#` for Help and About, and it needs no server change. Its cost is privacy: the query string is part of the request, so Cloudflare receives the place, time and duration asked about whenever the page loads from the network, and so does any service that fetches a shared link to preview it. The installed app loads from its own copy, so this is mostly a first visit or a shared link opened elsewhere. What is asked is a city and a time, never a named place's name, and the privacy text says so. Whether Cloudflare Web Analytics reports query strings isn't documented ([dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/), read on 2026-10-17); the maintainer checks its dashboard once this is on staging.

**Consequences.** The address format can be added to but not changed in a way that breaks existing addresses. About's privacy section says what the address holds and who receives it. Help and About keep their `#` addresses, after the query.

**Status.** Proposed by Claude, with the part after `#` as its first choice; the maintainer chose the query string after asking about its privacy consequences. Approved by @biancapower, 2026-10-17.

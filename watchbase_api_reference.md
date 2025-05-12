# WatchBase Data Feed API (v1)  
_A concise reference for building an API connector_

> **Base URL:** `https://api.watchbase.com/v1/`  
> **Auth:** Every request must include `key=<YOUR_API_KEY>` as a query or POST parameter.  
> **Response formats:** XML (default) or JSON via `format=json`.

---

## 1 · Search Endpoints

| Endpoint | Purpose | Required params | Optional params | Notes |
|----------|---------|-----------------|-----------------|-------|
| **`GET /search`** | Whole-word search across brand, family, watch name & reference number | `q` | `format` | Exact-match on words. |
| **`GET /search/refnr`** | Sub-string search on reference numbers | `q` | `format` | Use for partial ref. numbers.|

Example:  

```
/search?q=priors+court&key=YOUR_KEY  
/search/refnr?q=p2/&key=YOUR_KEY&format=json
```

---

## 2 · Reference Lists

| Endpoint | Purpose | Required params | Optional params |
|----------|---------|-----------------|-----------------|
| **`GET /brands`** | All brands (`id`, `name`) | — | `format` |
| **`GET /families`** | Families for a brand | `brand-id` | `format` |

---

## 3 · Watch Collections

| Endpoint | Purpose | Required params | Optional params | Tip |
|----------|---------|-----------------|-----------------|-----|
| **`GET /watches`** | List watches for a brand and/or family | `brand-id` | `family-id`, `updated-since (YYYY-MM-DD)`, `format` | Use `updated-since` for incremental syncs. |
| **`GET /watch`** | Full detail for one watch | `id` | `format` | Returns every data field (specs, images, metadata). |

---

## 4 · Entity Schemas (JSON)

<details>
<summary>⚙️  Click to view simplified field layout</summary>

**Brand**
```jsonc
{
  "id": 59,
  "name": "Audemars Piguet"
}
```

**Family**
```jsonc
{
  "id": 234,
  "name": "P-Series"
}
```

**Watch (list response)**
```jsonc
{
  "id": 11702,
  "refnr": "M1",
  "name": "M1",
  "brand": { ... },
  "family": { ... },
  "thumb": "http://cdn.watchbase.com/watch/medium/...",
  "updated": "2016-02-25"
}
```

**Watch (detail response)** – adds nested objects such as `caliber`, `case`, `dial`, plus meta‐dates (`added`, `modified`, `published`).
</details>

---

## 5 · Typical Integration Workflow

1. **Seed lookup tables**  
   - `GET /brands` → store locally.  
   - For each brand: `GET /families?brand-id={id}`.

2. **Initial import**  
   - `GET /watches?brand-id={id}` (or include `family-id`) to pull IDs & basic data.

3. **Incremental updates**  
   - Daily/weekly: `GET /watches?brand-id={id}&updated-since={YYYY-MM-DD}`.

4. **On-demand detail**  
   - `GET /watch?id={watchId}` whenever full specifications are needed.

---

## 6 · Design Notes & Alternatives

| Approach | When to choose it | Trade-offs |
|----------|------------------|------------|
| **Local mirror** of full watch details | Heavy read load, advanced search, offline ops | Larger storage; must schedule updates. |
| **On-demand detail fetch** | Occasional look-ups, small apps | Slower first load; dependent on API uptime. |

Additional tips:

* Thumbnails in list results use `/medium/`; swap with `/large/` for hi-res images.  
* Rate limits are not documented—throttle conservatively and implement retry/backoff logic.  
* Check `num_results` before iterating to avoid null arrays.  
* Search endpoint is **whole-word**; use `/search/refnr` for fuzzy matching.  

---

## 7 · Error Handling

| HTTP Code | Likely cause | Suggested action |
|-----------|--------------|------------------|
| `401 / 403` | Missing or invalid `key` | Verify key, regenerate if needed |
| `400` | Bad parameter name or type | Validate query string / body |
| `500` | WatchBase internal error | Retry with backoff, alert if persistent |

---

## 8 · Change Log Strategy

Store these dates per watch to detect changes:

* `added` – first import date  
* `modified` – last metadata edit  
* `published` – publication date  
* `updated` (list responses) – identical to latest `modified`

Use whichever best fits your sync policy (e.g., `modified >= lastSync`).  

---

_Source: [WatchBase Data Feed API documentation](https://watchbase.com/data-feed), accessed May 12 2025._

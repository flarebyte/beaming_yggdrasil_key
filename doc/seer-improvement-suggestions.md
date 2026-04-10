# Seer Improvement Suggestions

This note captures practical improvements suggested by using `seer` to maintain the key schema decision records in this repository.

## Context

Current `seer` strengths are already useful:
- deterministic validation
- markdown, JSON, and CSV report formats
- explainability controls such as `explain=true`
- machine-friendly JSON and spreadsheet-friendly CSV

The main gaps we hit are around report ergonomics and file-output workflow rather than the core MCDA logic.

## Main Issues

### 1. Report generation is stdout-only

Today `seer report generate` writes all configured reports to stdout.

This is workable for one report, but awkward when a model defines multiple outputs:
- markdown, JSON, and CSV are concatenated into one mixed stream
- `make` cannot easily route one invocation into separate files
- downstream tooling ends up creating multiple near-identical `.seer.cue` files just to keep one output per run

In this repository, that forced a workaround with:
- one markdown decision config
- one CSV decision config
- one JSON decision config

This is functional but not ideal. It duplicates model content and creates maintenance noise.

### 2. Markdown output is still too terse by default

Even with `explain=true`, the markdown report is still closer to a ranking summary than to a human-readable decision brief.

It currently helps answer:
- what won
- what the scores were
- what the criterion weights were

But it does not sufficiently answer:
- what problem is being solved
- what the alternatives actually are
- what assumptions framed the scenario
- why a given alternative scored better
- what tradeoffs or caveats remain

That means readers often still need to open the `.seer.cue` file to understand the decision context.

### 3. JSON is good for automation, but could expose more context

The current JSON output is already useful for automation and AI agents, especially when paired with the source `.cue` file.

However, if the JSON is consumed on its own, some important context is easy to lose:
- problem title and goal
- alternative titles and descriptions
- criterion titles and descriptions
- scenario descriptions and narratives
- evaluation descriptions
- report arguments used for the render

Agents can still work with the current JSON if the `.cue` file is also available, but richer self-contained JSON would reduce round trips and make downstream summarization easier.

## Suggested Improvements

### A. Add direct file output support

Recommended CLI additions:

```text
seer report generate --config model.cue --output out.md
seer report generate --config model.cue --output-dir doc/decision/data
seer report generate --config model.cue --report decision-json --output out.json
```

Recommended behavior:
- `--report <name>` selects a single report by name
- `--output <path>` writes the selected report directly to a file
- `--output-dir <dir>` writes each configured report into a deterministic file inside that directory
- stdout remains supported for shell composition and ad hoc use

This would remove the need for duplicated config files just to separate formats.

### B. Add markdown detail levels

Suggested report argument or dedicated option:

```cue
arguments: ["detail=brief"]
arguments: ["detail=standard"]
arguments: ["detail=full"]
```

Possible meaning:
- `brief`
  current compact ranking summary
- `standard`
  problem summary, alternatives, scenario context, weights, rankings, and short rationale
- `full`
  standard output plus criterion-level evaluations, descriptions, and richer explanation text

Recommended markdown sections for `standard`:
- Problem
- Alternatives
- Scenarios
- Criteria Weights
- Scenario Rankings
- Final Ranking
- Notes and Tradeoffs

This would make markdown useful as a standalone decision artifact rather than just a score summary.

### C. Make explainability more explicit

Instead of only `explain=true|false`, consider finer controls such as:

```cue
arguments: [
  "include-context=true",
  "include-weights=true",
  "include-alternative-descriptions=true",
  "include-evaluation-notes=true",
  "include-tradeoffs=true",
]
```

That gives users more control than one broad explainability toggle.

### D. Enrich JSON for standalone consumption

Recommended JSON additions:
- `problem.title`
- `problem.goal`
- `problem.description`
- `alternatives[].title`
- `alternatives[].description`
- `criteria[].title`
- `criteria[].description`
- `scenarios[].title`
- `scenarios[].description`
- `scenarios[].narrative`
- `evaluations[].description`
- `report.arguments`

Recommendation:
- keep the current compact ranking JSON shape available
- add a richer mode such as `include-context=true`

That would support both:
- lightweight machine processing
- richer AI-agent interpretation without always reopening the `.cue`

### E. Improve CSV integration ergonomics

CSV is already useful for embedding decision results into other generated docs.

Useful additions would be:
- stable support for selecting one report by name from the CLI
- explicit CSV schemas per report type
- optional metadata rows or sidecar schema docs for downstream consumers

The current CSV output is good for ranking tables, but harder to use when consumers need to know what each table shape guarantees.

## Recommendation Priority

Highest priority:
1. `--report <name>`
2. `--output <path>` and/or `--output-dir <dir>`
3. richer markdown `detail=` support

Second priority:
1. richer JSON context mode
2. more granular explainability controls
3. clearer CSV schema guarantees

## Recommendation For AI-Agent Usage

For AI agents, the current JSON is acceptable if the `.cue` file is also available.

If only one artifact is available, richer JSON would be preferable because it can carry:
- ranking results
- problem context
- scenario framing
- alternative descriptions
- criterion descriptions

So the best long-term setup is:
- markdown for human-readable decision briefs
- JSON with optional richer context for automation and AI agents
- CSV for embedding and analytics workflows

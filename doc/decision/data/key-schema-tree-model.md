# Key Schema Tree Model Decision

## Problem

### Title
Key Schema Tree Model

### Goal
Choose a simple JSON-friendly and Dart-friendly schema model for representing anchor labels and label-driven node definitions.

### Description
The model should represent the schema used by the parser: anchor labels plus node definitions keyed by label, with value types, child labels, terminal behavior, and schema validation concerns.

### Notes
- Current parser design is schema-driven rather than hardcoded.
- The schema is logically a DAG of allowed label transitions; cycles must still be rejected by schema validation.
- Each node definition should stay JSON-friendly and Dart-friendly while supporting valueTypes, childLabels, and terminal behavior.
- Adjacency list shape: nodes[] with label and parentLabel edges encoded across repeated records.
- Normalized map shape: anchorLabels plus nodesByLabel keyed by label, with childLabels on each node.

## Alternatives

### Adjacency List
Represent the schema as a flat array of records where parent-child edges and node definitions are spread across rows keyed by label.

### Normalized Map
Represent the schema as anchorLabels plus nodesByLabel, where each node stores valueTypes, childLabels, and terminal behavior.

## Scenario

### Baseline Library Model
Default evaluation for the current schema-driven library model, which should be easy to store in JSON and later model in Dart.

The preferred model should stay simple for small examples while remaining practical when the package needs direct label lookup, schema validation, and extension of node metadata.

## Decision Drivers

### Criteria

#### JSON Simplicity
The representation should stay small, readable, and easy to serialize without custom codecs.

#### Dart Model Fit
The representation should map cleanly to immutable Dart classes and predictable lookup helpers.

#### Schema Explicitness
The structure should make anchor labels, child rules, and label-level navigation obvious.

#### Lookup And Updates
The model should support direct access to a node and localized updates without scanning the full tree.

#### Metadata Extensibility
The node shape should comfortably hold valueTypes childLabels terminal behavior and future schema metadata without awkward reshaping.

#### Schema Validation Fit
The model should support anchor-label checks, duplicate detection, reachability checks, and loop rejection without extra translation layers.

### Preference Justifications
- Baseline Library Model: Dart Model Fit over JSON Simplicity (strength 2.000000)
- Baseline Library Model: JSON Simplicity over Schema Explicitness (strength 2.000000)
- Baseline Library Model: Lookup And Updates over JSON Simplicity (strength 2.000000)
- Baseline Library Model: Metadata Extensibility over JSON Simplicity (strength 2.000000)
- Baseline Library Model: Dart Model Fit over Schema Explicitness (strength 3.000000)
- Baseline Library Model: Lookup And Updates over Schema Explicitness (strength 2.000000)
- Baseline Library Model: Metadata Extensibility over Schema Explicitness (strength 3.000000)
- Baseline Library Model: Dart Model Fit over Lookup And Updates (strength 2.000000)
- Baseline Library Model: Metadata Extensibility over Dart Model Fit (strength 2.000000)
- Baseline Library Model: Metadata Extensibility over Lookup And Updates (strength 2.000000)
- Baseline Library Model: Schema Validation Fit over JSON Simplicity (strength 2.000000)
- Baseline Library Model: Schema Validation Fit over Schema Explicitness (strength 2.000000)
- Baseline Library Model: Schema Validation Fit over Lookup And Updates (strength 2.000000)
- Baseline Library Model: Schema Validation Fit over Dart Model Fit (strength 2.000000)
- Baseline Library Model: Schema Validation Fit over Metadata Extensibility (strength 2.000000)

### Criteria Weights
- Baseline Library Model: Dart Model Fit=0.182583, JSON Simplicity=0.107810, Lookup And Updates=0.135771, Metadata Extensibility=0.226140, Schema Validation Fit=0.271612, Schema Explicitness=0.076085

## Scenario Ranking

### Baseline Library Model
1. Normalized Map (0.907606)
2. Adjacency List (0.092394)

#### Evaluation Notes
Comparison of the two candidate shapes for a JSON and Dart schema model.

##### Adjacency List
Compact JSON and easy to inspect, but label lookup, child validation, and schema safety checks usually require scanning or extra indexing.

Scores:
- JSON Simplicity: 5
- Dart Model Fit: 4
- Schema Explicitness: 3
- Lookup And Updates: 3
- Metadata Extensibility: 4
- Schema Validation Fit: 2

##### Normalized Map
Slightly more structured JSON, but clearer for direct label access, anchor-label checks, stable references, and future Dart helpers.

Scores:
- JSON Simplicity: 4
- Dart Model Fit: 5
- Schema Explicitness: 4
- Lookup And Updates: 5
- Metadata Extensibility: 5
- Schema Validation Fit: 5

## Final Ranking

1. Normalized Map (0.907606)
2. Adjacency List (0.092394)

## Notes and Tradeoffs

- Aggregation method: equal_average

### Scenario Weights
- Baseline Library Model: 1.000000

### Scenario Criteria Weights
- Baseline Library Model: Dart Model Fit=0.182583, JSON Simplicity=0.107810, Lookup And Updates=0.135771, Metadata Extensibility=0.226140, Schema Validation Fit=0.271612, Schema Explicitness=0.076085

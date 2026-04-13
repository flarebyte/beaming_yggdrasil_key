package seer

config: {
	problem: {
		name:        "key-schema-tree-model"
		title:       "Key Schema Tree Model"
		goal:        "Choose a simple JSON-friendly and Dart-friendly schema model for representing anchor labels and label-driven node definitions."
		description: "The model should represent the schema used by the parser: anchor labels plus node definitions keyed by label, with value types, child labels, terminal behavior, and schema validation concerns."
		notes: [
			"Current parser design is schema-driven rather than hardcoded.",
			"The schema is logically a DAG of allowed label transitions; cycles must still be rejected by schema validation.",
			"Each node definition should stay JSON-friendly and Dart-friendly while supporting valueTypes, childLabels, and terminal behavior.",
			"Adjacency list shape: nodes[] with label and parentLabel edges encoded across repeated records.",
			"Normalized map shape: anchorLabels plus nodesByLabel keyed by label, with childLabels on each node.",
		]
	}
	reports: [
		{
			name:     "decision-markdown"
			title:    "Key Schema Tree Model Decision"
			format:   "markdown"
			filepath: "../../decision/data/key-schema-tree-model.md"
			arguments: [
				"detail=standard",
				"include-context=true",
				"include-weights=true",
				"include-alternative-descriptions=true",
				"include-evaluation-notes=true",
				"include-tradeoffs=true",
			]
		},
		{
			name:     "decision-csv"
			title:    "Key Schema Tree Model Decision CSV"
			format:   "csv"
			filepath: "../../decision/data/key-schema-tree-model.csv"
			arguments: ["columns=scenario,alternative,score,rank", "header=true"]
		},
	]
	criteriaCatalog: [
		{
			name:          "json_simplicity"
			title:         "JSON Simplicity"
			description:   "The representation should stay small, readable, and easy to serialize without custom codecs."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
		{
			name:          "dart_model_fit"
			title:         "Dart Model Fit"
			description:   "The representation should map cleanly to immutable Dart classes and predictable lookup helpers."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
		{
			name:          "tree_explicitness"
			title:         "Schema Explicitness"
			description:   "The structure should make anchor labels, child rules, and label-level navigation obvious."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
		{
			name:          "lookup_and_updates"
			title:         "Lookup And Updates"
			description:   "The model should support direct access to a node and localized updates without scanning the full tree."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
		{
			name:          "metadata_extensibility"
			title:         "Metadata Extensibility"
			description:   "The node shape should comfortably hold valueTypes childLabels terminal behavior and future schema metadata without awkward reshaping."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
		{
			name:          "schema_validation_fit"
			title:         "Schema Validation Fit"
			description:   "The model should support anchor-label checks, duplicate detection, reachability checks, and loop rejection without extra translation layers."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
	]
	alternatives: [
		{
			name:        "adjacency_list"
			title:       "Adjacency List"
			description: "Represent the schema as a flat array of records where parent-child edges and node definitions are spread across rows keyed by label."
			labels:      ["json", "tree", "flat-list"]
		},
		{
			name:        "normalized_map"
			title:       "Normalized Map"
			description: "Represent the schema as anchorLabels plus nodesByLabel, where each node stores valueTypes, childLabels, and terminal behavior."
			labels:      ["json", "tree", "map"]
		},
	]
	scenarios: [{
		name:        "baseline"
		title:       "Baseline Library Model"
		description: "Default evaluation for the current schema-driven library model, which should be easy to store in JSON and later model in Dart."
		narrative:   "The preferred model should stay simple for small examples while remaining practical when the package needs direct label lookup, schema validation, and extension of node metadata."
		activeCriteria: [
			{criterionName: "json_simplicity"},
			{criterionName: "dart_model_fit"},
			{criterionName: "tree_explicitness"},
			{criterionName: "lookup_and_updates"},
			{criterionName: "metadata_extensibility"},
			{criterionName: "schema_validation_fit"},
		]
		preferences: {
			method: "ahp_pairwise"
			scale:  "saaty_1_9"
			comparisons: [
				{
					moreImportantCriterionName: "dart_model_fit"
					lessImportantCriterionName: "json_simplicity"
					strength:                   2
					justification:              "The chosen JSON shape should map cleanly to Dart because the library is ultimately a Dart API."
				},
				{
					moreImportantCriterionName: "json_simplicity"
					lessImportantCriterionName: "tree_explicitness"
					strength:                   2
					justification:              "A compact and readable JSON shape matters slightly more than making schema traversal structure fully explicit."
				},
				{
					moreImportantCriterionName: "lookup_and_updates"
					lessImportantCriterionName: "json_simplicity"
					strength:                   2
					justification:              "Once the model is used in code, predictable node access matters more than the smallest possible JSON form."
				},
				{
					moreImportantCriterionName: "metadata_extensibility"
					lessImportantCriterionName: "json_simplicity"
					strength:                   2
					justification:              "The model should leave room for future schema metadata without awkward reshaping."
				},
				{
					moreImportantCriterionName: "dart_model_fit"
					lessImportantCriterionName: "tree_explicitness"
					strength:                   3
					justification:              "A model that is easy to express as Dart types is more valuable than a slightly more obvious tree layout on paper."
				},
				{
					moreImportantCriterionName: "lookup_and_updates"
					lessImportantCriterionName: "tree_explicitness"
					strength:                   2
					justification:              "Operational lookup and update behavior matters more than purely descriptive shape."
				},
				{
					moreImportantCriterionName: "metadata_extensibility"
					lessImportantCriterionName: "tree_explicitness"
					strength:                   3
					justification:              "The node record needs to stay flexible as schema metadata grows."
				},
				{
					moreImportantCriterionName: "dart_model_fit"
					lessImportantCriterionName: "lookup_and_updates"
					strength:                   2
					justification:              "Convenient access patterns should still emerge from a model that stays natural in Dart."
				},
				{
					moreImportantCriterionName: "metadata_extensibility"
					lessImportantCriterionName: "dart_model_fit"
					strength:                   2
					justification:              "The node contract should preserve future metadata options even if that adds small modeling ceremony."
				},
				{
					moreImportantCriterionName: "metadata_extensibility"
					lessImportantCriterionName: "lookup_and_updates"
					strength:                   2
					justification:              "The model is for schema representation first, so node metadata needs outrank operational convenience."
				},
				{
					moreImportantCriterionName: "schema_validation_fit"
					lessImportantCriterionName: "json_simplicity"
					strength:                   2
					justification:              "The schema must support safe validation rules such as duplicate checks and loop rejection without awkward translation."
				},
				{
					moreImportantCriterionName: "schema_validation_fit"
					lessImportantCriterionName: "tree_explicitness"
					strength:                   2
					justification:              "Validation safety matters more than a purely descriptive shape."
				},
				{
					moreImportantCriterionName: "schema_validation_fit"
					lessImportantCriterionName: "lookup_and_updates"
					strength:                   2
					justification:              "The chosen model should make schema checks straightforward before any parser traversal begins."
				},
				{
					moreImportantCriterionName: "schema_validation_fit"
					lessImportantCriterionName: "dart_model_fit"
					strength:                   2
					justification:              "The schema is consumed through Dart, but safe and direct schema validation is slightly more important than the most natural Dart surface."
				},
				{
					moreImportantCriterionName: "schema_validation_fit"
					lessImportantCriterionName: "metadata_extensibility"
					strength:                   2
					justification:              "Extensible metadata matters, but the chosen schema model should first make validation safety direct and reliable."
				},
			]
		}
	}]
	evaluations: [{
		scenarioName: "baseline"
		description:  "Comparison of the two candidate shapes for a JSON and Dart schema model."
		evaluations: [
			{
				alternativeName: "adjacency_list"
				description:     "Compact JSON and easy to inspect, but label lookup, child validation, and schema safety checks usually require scanning or extra indexing."
				values: {
					json_simplicity: {
						kind:  "ordinal"
						value: 5
						label: "very simple"
					}
					dart_model_fit: {
						kind:  "ordinal"
						value: 4
						label: "good"
					}
					tree_explicitness: {
						kind:  "ordinal"
						value: 3
						label: "adequate"
					}
					lookup_and_updates: {
						kind:  "ordinal"
						value: 3
						label: "adequate"
					}
					metadata_extensibility: {
						kind:  "ordinal"
						value: 4
						label: "good"
					}
					schema_validation_fit: {
						kind:  "ordinal"
						value: 2
						label: "weak"
					}
				}
			},
			{
				alternativeName: "normalized_map"
				description:     "Slightly more structured JSON, but clearer for direct label access, anchor-label checks, stable references, and future Dart helpers."
				values: {
					json_simplicity: {
						kind:  "ordinal"
						value: 4
						label: "simple"
					}
					dart_model_fit: {
						kind:  "ordinal"
						value: 5
						label: "very good"
					}
					tree_explicitness: {
						kind:  "ordinal"
						value: 4
						label: "good"
					}
					lookup_and_updates: {
						kind:  "ordinal"
						value: 5
						label: "very good"
					}
					metadata_extensibility: {
						kind:  "ordinal"
						value: 5
						label: "very good"
					}
					schema_validation_fit: {
						kind:  "ordinal"
						value: 5
						label: "very good"
					}
				}
			},
		]
	}]
	aggregation: {
		method: "equal_average"
	}
}

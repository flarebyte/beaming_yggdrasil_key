package seer

config: {
	problem: {
		name:        "key-schema-tree-model"
		title:       "Key Schema Tree Model"
		goal:        "Choose a simple JSON-friendly and Dart-friendly tree model for representing key schema nodes."
		description: "The model should represent a tree of nodes such as user or note. Each node should carry its entity kind and the type of value it stores such as UUID."
		notes: [
			"Adjacency list shape: nodes[] with id and parentId on each node.",
			"Normalized map shape: rootId plus nodesById keyed by node id, with childIds on each node.",
		]
	}
	reports: [{
		name:      "decision"
		title:     "Key Schema Tree Model Decision"
		format:    "markdown"
		arguments: ["include-scenarios=all", "top-alternatives=2", "include-scores=true", "explain=false"]
	}]
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
			title:         "Tree Explicitness"
			description:   "The structure should make parent-child traversal and root ownership obvious."
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
			description:   "The node shape should comfortably hold entity names, value types such as UUID, and future schema metadata without awkward reshaping."
			polarity:      "benefit"
			valueType:     "ordinal"
			scaleGuidance: [1, 2, 3, 4, 5]
		},
	]
	alternatives: [
		{
			name:        "adjacency_list"
			title:       "Adjacency List"
			description: "Represent the tree as a flat array of nodes where each node stores id, parentId, entity, and valueType."
			labels:      ["json", "tree", "flat-list"]
		},
		{
			name:        "normalized_map"
			title:       "Normalized Map"
			description: "Represent the tree as rootId plus nodesById, where each node stores entity, valueType, and childIds."
			labels:      ["json", "tree", "map"]
		},
	]
	scenarios: [{
		name:        "baseline"
		title:       "Baseline Library Model"
		description: "Default evaluation for a library model that should be easy to store in JSON and later model in Dart."
		narrative:   "The preferred model should stay simple for small examples while remaining practical when the package needs direct node lookup, traversal, and extension of node metadata."
		activeCriteria: [
			{criterionName: "json_simplicity"},
			{criterionName: "dart_model_fit"},
			{criterionName: "tree_explicitness"},
			{criterionName: "lookup_and_updates"},
			{criterionName: "metadata_extensibility"},
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
					justification:              "A compact and readable JSON shape matters slightly more than making traversal structure fully explicit."
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
					justification:              "The node record needs to stay flexible as entity and value-type metadata grows."
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
			]
		}
	}]
	evaluations: [{
		scenarioName: "baseline"
		description:  "Comparison of the two candidate shapes for a JSON and Dart tree schema."
		evaluations: [
			{
				alternativeName: "adjacency_list"
				description:     "Very compact JSON and easy to inspect, but tree traversal and node lookup usually require scanning or extra indexing."
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
				}
			},
			{
				alternativeName: "normalized_map"
				description:     "Slightly more structured JSON, but clearer for direct node access, stable references, and future Dart helpers."
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
				}
			},
		]
	}]
	aggregation: {
		method: "equal_average"
	}
}

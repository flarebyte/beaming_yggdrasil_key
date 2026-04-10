package flyb

source: "beaming-yggdrasil-key"
name:   "beaming-yggdrasil-key"
modules: ["core"]

reports: [{
	title:       "beaming_yggdrasil_key Design"
	filepath:    "../design/dart-key-spec.md"
	description: "Dart key utility spec for parsing, navigation, and relationship checks on Yggdrasil-style keys."
	sections: [{
		title:       "01 Overview"
		description: "Purpose, scope, and intended lightweight usage."
		sections: [{
			title:       "01 Purpose and Scope"
			description: "Repository target, library goal, and the narrow responsibilities of a key utility package."
			notes: [
				"dart.key.goals",
				"dart.key.design-ownership",
				"dart.key.responsibilities",
				"dart.key.non-goals",
			]
		}, {
			title:       "02 Product Shape"
			description: "Main capability areas and preferred API direction."
			notes: [
				"dart.key.scope",
				"dart.key.schema-model",
				"dart.key.schema-validation",
				"dart.key.package-boundary",
				"dart.key.api-direction",
				"dart.key.usecases",
			]
		}]
	}, {
		title:       "02 Parsing Contract"
		description: "Supported key grammar and acceptance boundaries."
		sections: [{
			title:       "01 Parsing Rules"
			description: "Current supported key parsing rules."
			notes: ["dart.key.parsing-rules"]
		}, {
			title:       "02 Acceptance Examples"
			description: "Key examples that should parse successfully."
			notes: ["dart.key.acceptance"]
		}, {
			title:       "03 Rejection Examples"
			description: "Key examples that should fail deterministically."
			notes: ["dart.key.rejection"]
		}]
	}, {
		title:       "03 Derived Data"
		description: "Fields and helpers built from parsed keys."
		sections: [{
			title:       "01 Derived Fields"
			description: "Structured and derived values exposed by the parser."
			notes: ["dart.key.derived-fields", "dart.key.common", "dart.key.parsed-key-examples"]
		}, {
			title:       "02 Parser API"
			description: "API-shape examples for the Dart package."
			notes: ["dart.key.parser-api"]
		}, {
			title:       "03 Performance API"
			description: "Validation and scanning strategies for large key sets."
			notes: ["dart.key.performance-strategies", "dart.key.performance-api", "dart.key.performance-tests"]
		}, {
			title:       "04 Security"
			description: "Implementation guidance for corrupted keys and untrusted schema inputs."
			notes: ["dart.key.security"]
		}]
	}]
}]

notes: [
	{
		name:  "dart.key.goals"
		title: "Library Goals"
		filepath: "examples/library-goals.csv"
		arguments: ["format-csv=table"]
		labels: ["goals", "csv"]
	},
	{
		name:  "dart.key.design-ownership"
		title: "Design Ownership"
		filepath: "examples/design-ownership.csv"
		arguments: ["format-csv=table"]
		labels: ["ownership", "csv"]
	},
	{
		name:  "dart.key.responsibilities"
		title: "Main Responsibilities"
		filepath: "examples/main-responsibilities.csv"
		arguments: ["format-csv=table"]
		labels: ["responsibilities", "csv"]
	},
	{
		name:  "dart.key.non-goals"
		title: "Explicit Non-Goals"
		filepath: "examples/explicit-non-goals.csv"
		arguments: ["format-csv=table"]
		labels: ["non-goals", "csv"]
	},
	{
		name:  "dart.key.usecases"
		title: "Use Cases"
		filepath: "examples/usecases.csv"
		arguments: ["format-csv=table"]
		labels: ["usecase", "csv"]
	},
	{
		name:  "dart.key.scope"
		title: "Library Scope"
		filepath: "examples/library-scope.csv"
		arguments: ["format-csv=table"]
		labels: ["scope", "csv"]
	},
	{
		name:  "dart.key.schema-model"
		title: "Schema Model"
		filepath: "examples/schema-model.ts"
		labels: ["typescript", "schema"]
	},
	{
		name:  "dart.key.schema-validation"
		title: "Schema Validation"
		filepath: "examples/schema-validation.ts"
		labels: ["typescript", "schema", "validation"]
	},
	{
		name:  "dart.key.package-boundary"
		title: "Package Boundary"
		filepath: "examples/package-boundary.csv"
		arguments: ["format-csv=table"]
		labels: ["boundary", "csv"]
	},
	{
		name:  "dart.key.api-direction"
		title: "Practical API Direction"
		filepath: "examples/api-direction.csv"
		arguments: ["format-csv=table"]
		labels: ["api", "csv"]
	},
	{
		name:  "dart.key.parsing-rules"
		title: "Key Parsing Rules"
		filepath: "examples/key-parsing-rules.csv"
		arguments: ["format-csv=table"]
		labels: ["parsing", "csv"]
	},
	{
		name:  "dart.key.acceptance"
		title: "Key Acceptance Examples"
		filepath: "examples/key-acceptance-examples.csv"
		arguments: ["format-csv=table"]
		labels: ["acceptance", "csv"]
	},
	{
		name:  "dart.key.rejection"
		title: "Key Rejection Examples"
		filepath: "examples/key-rejection-examples.csv"
		arguments: ["format-csv=table"]
		labels: ["rejection", "csv"]
	},
	{
		name:  "dart.key.derived-fields"
		title: "Derived Fields"
		filepath: "examples/derived-fields.csv"
		arguments: ["format-csv=table"]
		labels: ["derived", "csv"]
	},
	{
		name:  "dart.key.common"
		title: "Common Key Types"
		filepath: "examples/common.ts"
		labels: ["typescript", "types"]
	},
	{
		name:  "dart.key.parsed-key-examples"
		title: "ParsedKey Examples"
		filepath: "examples/parsed-key-examples.ts"
		labels: ["typescript", "example", "parsed-key"]
	},
	{
		name:  "dart.key.parser-api"
		title: "Parser API Example Shapes"
		filepath: "examples/parser-api.ts"
		labels: ["typescript", "api"]
	},
	{
		name:  "dart.key.performance-strategies"
		title: "Validation Strategies"
		filepath: "examples/performance-strategies.csv"
		arguments: ["format-csv=table"]
		labels: ["performance", "csv"]
	},
	{
		name:  "dart.key.performance-api"
		title: "Performance API Example Shapes"
		filepath: "examples/performance-api.ts"
		labels: ["typescript", "api", "performance"]
	},
	{
		name:  "dart.key.performance-tests"
		title: "Performance Test Suggestions"
		filepath: "examples/performance-tests.csv"
		arguments: ["format-csv=table"]
		labels: ["performance", "testing", "csv"]
	},
	{
		name:  "dart.key.security"
		title: "Security Guidance"
		filepath: "examples/security-guidance.csv"
		arguments: ["format-csv=table"]
		labels: ["security", "csv"]
	},
]

argumentRegistry: {
	version: "1"
	arguments: [{
		name:          "format-csv"
		valueType:     "string"
		scopes:        ["note"]
		allowedValues: ["table", "raw"]
	}]
}

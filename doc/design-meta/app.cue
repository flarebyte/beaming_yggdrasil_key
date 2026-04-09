package flyb

source: "beaming-yggdrasil-key"
name:   "beaming-yggdrasil-key"
modules: ["core"]

reports: [{
	title:       "beaming_yggdrasil_key Design"
	filepath:    "../design/dart-key-spec.md"
	description: "Key-first Dart library spec for Yggdrasil logical key parsing and derived metadata."
	sections: [{
		title:       "01 Overview"
		description: "Purpose, scope, and package boundary."
		sections: [{
			title:       "01 Intent"
			description: "What the key package should own and why it stays separate from transport."
			notes: ["dart.key.readme", "dart.key.overview"]
		}, {
			title:       "02 Use Cases"
			description: "Main parsing and key-relationship workflows."
			notes: ["dart.key.usecases", "dart.key.scope"]
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
			notes: ["dart.key.derived-fields", "dart.key.common"]
		}, {
			title:       "02 Parser API"
			description: "API-shape examples for the Dart package."
			notes: ["dart.key.parser-api"]
		}]
	}]
}]

notes: [
	{
		name:  "dart.key.readme"
		title: "beaming_yggdrasil_key Specs"
		filepath: "README.md"
		labels: ["overview", "markdown"]
	},
	{
		name:  "dart.key.overview"
		title: "Key Library Overview"
		filepath: "overview.md"
		labels: ["overview", "markdown"]
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
		name:  "dart.key.parser-api"
		title: "Parser API Example Shapes"
		filepath: "examples/parser-api.ts"
		labels: ["typescript", "api"]
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

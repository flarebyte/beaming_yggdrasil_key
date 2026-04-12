import type { KeySchema, SchemaValidationIssue, SchemaValidationOptions, SchemaValidationResult } from './common';

export interface BeamingYggdrasilSchemaValidator {
  validateSchema(schema: KeySchema, options?: SchemaValidationOptions): SchemaValidationResult;
}

export const schemaValidationChecks = [
  'rootLabels should not be empty',
  'rootLabels must exist in nodesByLabel',
  'rootLabels should not contain duplicates',
  'anchorLabels should not be empty',
  'anchorLabels must exist in nodesByLabel',
  'anchorLabels should not contain duplicates',
  'each nodesByLabel key should match the node label field',
  'every child label must reference an existing node',
  'childLabels should not contain duplicates within the same node',
  'shared descendants are allowed, so the schema may be a DAG',
  'cycles must be reported as errors, including self-loops and longer loops',
  'terminal nodes must declare an empty childLabels array',
  'every anchor label should be reachable from at least one configured root label',
  'unreachable nodes should be reported at least as warnings',
  'risky shapes such as very broad fan-out or excessive configured depth may be warnings in tolerant mode',
];

export const schemaValidationAlgorithms = [
  'referential-integrity pass: verify every rootLabels entry every anchorLabels entry and every childLabels entry points to a defined node',
  'node-identity pass: verify each nodesByLabel map key matches the embedded node label',
  'duplicate-entry pass: detect repeated rootLabels repeated anchorLabels and repeated childLabels within a node before traversal begins',
  'reachability pass: traverse from rootLabels and warn for any node never reached',
  'anchor-reachability pass: verify every configured anchor label can be reached from at least one configured root label',
  'cycle-detection pass: run DFS with visiting and visited states so DAG reuse is accepted but loops are rejected',
  'shape-risk pass: emit warnings for unusual fan-out anchor count or reachable-node volume based on configured thresholds',
];

export const exampleIssues: SchemaValidationIssue[] = [
  {
    severity: 'error',
    code: 'schema.cycle',
    message: 'Cycle detected: dashboard -> note -> dashboard',
    path: ['dashboard', 'note', 'dashboard'],
  },
  {
    severity: 'error',
    code: 'schema.undefined_child',
    message: 'Node like references undefined child label reaction',
    label: 'like',
  },
  {
    severity: 'warning',
    code: 'schema.unreachable',
    message: 'Node audit is not reachable from any configured root label',
    label: 'audit',
  },
  {
    severity: 'error',
    code: 'schema.unreachable_anchor',
    message: 'Configured anchor label profile is not reachable from any configured root label',
    label: 'profile',
  },
  {
    severity: 'warning',
    code: 'schema.excessive_fan_out',
    message: 'Node dashboard declares 48 child labels which exceeds the warning threshold',
    label: 'dashboard',
  },
  {
    severity: 'error',
    code: 'schema.duplicate_child',
    message: 'Node dashboard declares child label note more than once',
    label: 'dashboard',
  },
  {
    severity: 'error',
    code: 'schema.label_mismatch',
    message: 'Schema entry keyed by dashboard embeds node label dashbord',
    label: 'dashboard',
  },
];

// Validation guidance:
// - strict mode should fail when any error is present
// - tolerant mode may return warnings for risky but still parseable shapes
// - schema validation should happen before parser construction or before accepting an externally supplied schema
// - structural errors must stay errors in every mode; tolerant mode only relaxes risky-shape reporting

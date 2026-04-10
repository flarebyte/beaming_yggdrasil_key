import type { KeySchema, SchemaValidationIssue, SchemaValidationOptions, SchemaValidationResult } from './common';

export interface BeamingYggdrasilSchemaValidator {
  validateSchema(schema: KeySchema, options?: SchemaValidationOptions): SchemaValidationResult;
}

export const schemaValidationChecks = [
  'rootLabels must exist in nodesByLabel',
  'every child label must reference an existing node',
  'shared descendants are allowed, so the schema may be a DAG',
  'cycles must be reported as errors, including self-loops and longer loops',
  'terminal nodes should not declare childLabels',
  'unreachable nodes should be reported at least as warnings',
  'risky shapes such as very broad fan-out or excessive configured depth may be warnings in tolerant mode',
];

export const schemaValidationAlgorithms = [
  'referential-integrity pass: verify every rootLabels entry and every childLabels entry points to a defined node',
  'reachability pass: traverse from rootLabels and warn for any node never reached',
  'cycle-detection pass: run DFS with visiting and visited states so DAG reuse is accepted but loops are rejected',
  'shape-risk pass: emit warnings for unusual fan-out root count or reachable-node volume based on configured thresholds',
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
    severity: 'warning',
    code: 'schema.excessive_fan_out',
    message: 'Node dashboard declares 48 child labels which exceeds the warning threshold',
    label: 'dashboard',
  },
];

// Validation guidance:
// - strict mode should fail when any error is present
// - tolerant mode may return warnings for risky but still parseable shapes
// - schema validation should happen before parser construction or before accepting an externally supplied schema
// - structural errors must stay errors in every mode; tolerant mode only relaxes risky-shape reporting

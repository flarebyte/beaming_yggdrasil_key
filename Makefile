SEER := seer
DECISION_CONFIG := doc/decision-meta/data/key-schema-tree-model.seer.cue
DECISION_REPORT_MD := doc/decision/data/key-schema-tree-model.md
DECISION_REPORT_CSV := doc/decision/data/key-schema-tree-model.csv
DECISION_REPORT_CSV_FOR_FLYB := doc/design-meta/examples/key-schema-tree-model-decision.csv

FLYB := flyb

doc-gen:
	$(FLYB) validate --config doc/design-meta
	$(FLYB) generate markdown --config doc/design-meta

doc-decision:
	mkdir -p doc/decision/data
	$(SEER) validate --config $(DECISION_CONFIG)
	$(SEER) report generate --config $(DECISION_CONFIG)
	cp $(DECISION_REPORT_CSV) $(DECISION_REPORT_CSV_FOR_FLYB)

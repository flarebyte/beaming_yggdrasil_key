SEER := seer
DECISION_CONFIG := doc/decision-meta/data/key-schema-tree-model.seer.cue
DECISION_REPORT := doc/decision/data/key-schema-tree-model.md

FLYB := flyb

doc-gen:
	$(FLYB) validate --config doc/design-meta
	$(FLYB) generate markdown --config doc/design-meta

doc-decision:
	mkdir -p doc/decision/data
	$(SEER) validate --config $(DECISION_CONFIG)
	$(SEER) report generate --config $(DECISION_CONFIG) > $(DECISION_REPORT)

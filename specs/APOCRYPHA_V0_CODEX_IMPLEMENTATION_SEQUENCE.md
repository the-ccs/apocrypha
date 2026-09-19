# APOCRYPHA V0 — CODEX IMPLEMENTATION SEQUENCE

**Sequence:** 16 bounded tasks  
**Rule:** Codex implements contracts already decided here. It does not redesign them.

---

# Dependency map

```text
T01 Repository bootstrap
 │
 ▼
T02 Canonical contracts + schemas
 │
 ├───────────────┐
 ▼               ▼
T03 Persistence  T04 Source ingestion
 │               │
 └───────┬───────┘
         ▼
T05 Evidence + claims graph
         │
         ▼
T06 Assumptions + dependency invalidation
         │
         ▼
T07 Hypothesis engine
         │
         ▼
T08 World materialiser
         │
    ┌────┴─────┐
    ▼          ▼
T09 Provenance T10 Diff + resolution
    │          │
    └────┬─────┘
         ▼
T11 Reconstruction compiler + manifests
         │
         ▼
T12 Renderer interface + registry + mock
         │
         ▼
T13 Higgsfield adapters
         │
         ▼
T14 Core reconstruction UI
         │
         ▼
T15 Compare / Remove / Resolve UI
         │
         ▼
T16 Room fixture + E2E acceptance
```

---

# T01 — Repository bootstrap

## PURPOSE

Create the repository and tooling skeleton without implementing domain behaviour.

## INPUT CONTRACT

`APOCRYPHA_V0_SYSTEM_SPEC`.

## OUTPUT CONTRACT

Working TypeScript monorepo with:

```text
pnpm
React
Vite
Node
Fastify
Vitest
Playwright
ESLint
TypeScript project references
```

## ALLOWED FILES

```text
package.json
pnpm-workspace.yaml
tsconfig*.json
eslint*
.gitignore

apps/web/**
packages/**/package.json
packages/**/tsconfig.json

tests/**
specs/**
```

Only scaffolding.

## FORBIDDEN

No:

```text
domain model implementation
SQLite schema
Higgsfield code
rendering code
fixture assumptions
business logic
```

## INVARIANTS

- package boundaries exist;
- no circular workspace dependencies;
- strict TypeScript enabled.

## ACCEPTANCE TESTS

```text
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

all succeed from a clean checkout.

## DONE CONDITION

A minimal empty app and packages compile with zero domain decisions invented by Codex.

---

# T02 — Canonical domain contracts and schema validation

**Depends on:** T01

## PURPOSE

Implement the shared type system and runtime schemas forming APOCRYPHA's contract surface.

## INPUT CONTRACT

Sections 3–35 of `APOCRYPHA_V0_SYSTEM_SPEC`.

## OUTPUT CONTRACT

Typed definitions and Zod schemas for:

```text
EpistemicClass
SourceArtifact
EvidenceSelector
EvidenceItem
Observation
Claim
ClaimRelation
Assumption
DependencyEdge
HypothesisDefinition
World
WorldEntity
WorldAssertion
WorldRelationship
Dispute
ResolutionProposal
ReconstructionSpec
RenderManifest
RendererCapability
```

## ALLOWED FILES

```text
packages/domain/**
packages/reconstruction/manifests/**
tests/domain/contracts/**
```

## FORBIDDEN FILES

```text
packages/persistence/**
packages/renderers/**
apps/web/**
fixtures/**
```

## INVARIANTS

- provider/model names absent from domain types;
- epistemic enums exactly match spec;
- IDs are opaque branded/string types;
- schemas reject malformed states.

## ACCEPTANCE TESTS

Tests must reject:

- invalid epistemic class;
- image coordinate outside 0..1;
- overlapping hypothesis dispositions;
- empty observation evidence set;
- malformed reconstruction spec;
- malformed render manifest.

## DONE CONDITION

All canonical structures have both compile-time and runtime validation.

---

# T03 — SQLite persistence foundation

**Depends on:** T02

## PURPOSE

Create explicit SQLite persistence and repository contracts.

## INPUT CONTRACT

Canonical types from T02.

## OUTPUT CONTRACT

SQLite migrations and repository implementations for all V0 persistent objects.

## ALLOWED FILES

```text
packages/persistence/**
tests/persistence/**
```

## FORBIDDEN FILES

```text
apps/web/client/**
packages/renderers/**
fixtures/**
```

## INVARIANTS

- migrations are explicit SQL;
- foreign keys enabled;
- source hashes indexed;
- no graph database abstraction;
- no ORM added.

## ACCEPTANCE TESTS

- fresh database migrates;
- second migration run is safe;
- repository CRUD round-trips validated objects;
- invalid foreign references fail;
- transaction rollback works.

## DONE CONDITION

All V0 structures can be persisted and recovered without lossy conversion.

---

# T04 — SourceArtifact ingestion and immutable object storage

**Depends on:** T02, T03

## PURPOSE

Implement the immutable source boundary.

## INPUT CONTRACT

Local file path or uploaded bytes plus project ID.

## OUTPUT CONTRACT

Persisted `SourceArtifact` plus copied immutable object in local storage.

## ALLOWED FILES

```text
packages/domain/evidence/**
packages/persistence/**
apps/web/server/source-ingestion/**
tests/source-ingestion/**
```

## FORBIDDEN FILES

```text
packages/domain/hypotheses/**
packages/reconstruction/**
packages/renderers/**
```

## INVARIANTS

- SHA-256 calculated from exact imported bytes;
- original source object never overwritten;
- stable source ID distinct from path;
- source file mutation creates a different hash/new artifact;
- V0 project cannot become compilation-ready with other than exactly five active sources.

## ACCEPTANCE TESTS

1. import five fixture-like files;
2. verify hashes;
3. verify stored bytes match source bytes;
4. try to overwrite imported object and reject;
5. modify one byte and verify different hash;
6. verify duplicate content detection can identify same hash.

## GATE CONTRIBUTION

**Gate 1**

## DONE CONDITION

Immutable source provenance is functioning independently of all higher layers.

---

# T05 — Evidence, observation and claim graph

**Depends on:** T03, T04

## PURPOSE

Implement exact evidence anchoring and claim relationships.

## INPUT CONTRACT

Existing SourceArtifacts plus structured evidence/observation/claim input.

## OUTPUT CONTRACT

Validated graph:

```text
SourceArtifact
→ EvidenceItem
→ Observation
→ Claim
↔ ClaimRelation
```

## ALLOWED FILES

```text
packages/domain/evidence/**
packages/domain/claims/**
packages/persistence/**
tests/domain/evidence/**
tests/domain/claims/**
```

## FORBIDDEN FILES

```text
packages/domain/assumptions/**
packages/domain/hypotheses/**
packages/reconstruction/**
packages/renderers/**
apps/web/client/**
```

## INVARIANTS

- observations always anchor to evidence;
- evidential claims always retain observation ancestry;
- text spans are offset/hash validated;
- image regions use normalized coordinates;
- contradiction is represented explicitly rather than resolved.

## ACCEPTANCE TESTS

Create:

```text
photo source
evidence region
observation
claim A
claim B
A CONTRADICTS B
```

Verify both claims remain stored and independently queryable.

## GATE CONTRIBUTION

**Gates 2 and 3**

## DONE CONDITION

APOCRYPHA can represent direct evidence and explicit conflict without world construction.

---

# T06 — Assumption graph and dependency invalidation

**Depends on:** T05

## PURPOSE

Implement assumptions as first-class nodes and deterministic transitive invalidation.

## INPUT CONTRACT

Claims, assumptions and dependency edges.

## OUTPUT CONTRACT

Dependency graph operations:

```text
addDependency()
findDependants()
validateAcyclic()
invalidateFrom()
```

## ALLOWED FILES

```text
packages/domain/assumptions/**
packages/domain/claims/**
packages/persistence/**
tests/domain/assumptions/**
```

## FORBIDDEN FILES

```text
packages/domain/hypotheses/**
packages/domain/worlds/**
packages/reconstruction/**
packages/renderers/**
apps/web/**
```

## INVARIANTS

- dependencies are explicit;
- cycles are rejected;
- removal does not delete historical records;
- unaffected branches remain active.

## ACCEPTANCE TEST

Graph:

```text
A01
 ├→ C01
 │   └→ C03
 └→ C02

A02
 └→ C04
```

Removing A01 must affect:

```text
C01
C02
C03
```

and not:

```text
A02
C04
```

## GATE CONTRIBUTION

Foundation for **Gate 8**.

## DONE CONDITION

Selective transitive invalidation is proven before hypotheses exist.

---

# T07 — Hypothesis engine

**Depends on:** T05, T06

## PURPOSE

Implement hypothesis definitions and structural validation.

## INPUT CONTRACT

Claims, relations, assumptions and a `HypothesisDefinition`.

## OUTPUT CONTRACT

```ts
validateHypothesis(...)
```

returning:

```text
VALID
or
typed validation errors
```

## ALLOWED FILES

```text
packages/domain/hypotheses/**
packages/domain/claims/**
packages/domain/assumptions/**
tests/domain/hypotheses/**
```

## FORBIDDEN FILES

```text
packages/domain/worlds/**
packages/reconstruction/**
packages/renderers/**
apps/web/**
```

## INVARIANTS

- multiple hypotheses coexist;
- engine does not rank them;
- mutually exclusive accepted claims fail validation;
- rejected claims remain preserved;
- unresolved claims remain explicit;
- missing assumption dependencies fail.

## ACCEPTANCE TESTS

Build H01/H02/H03 around one contradiction.

Verify:

- all three definitions can coexist;
- a fourth hypothesis accepting both mutually exclusive claims is rejected;
- no ranking or probability exists.

## GATE CONTRIBUTION

Foundation for **Gate 4**.

## DONE CONDITION

APOCRYPHA can represent competing interpretations independently from worlds or renders.

---

# T08 — World Graph materialiser

**Depends on:** T07

## PURPOSE

Convert validated hypotheses into renderer-independent semantic worlds.

## INPUT CONTRACT

Validated hypothesis and domain graph.

## OUTPUT CONTRACT

Persisted:

```text
World
WorldEntity
WorldAssertion
WorldRelationship
```

## ALLOWED FILES

```text
packages/domain/worlds/**
packages/domain/hypotheses/**
packages/persistence/**
tests/domain/worlds/**
```

## FORBIDDEN FILES

```text
packages/reconstruction/compiler/**
packages/renderers/**
apps/web/client/**
```

## INVARIANTS

- stable entity IDs reused across worlds;
- assertion-level epistemic classification;
- unsupported visual detail absent or labelled UNKNOWN/GENERATIVE_FILL;
- no renderer calls.

## ACCEPTANCE TESTS

Materialise three hypotheses.

Verify:

- pairwise semantic difference exists;
- same logical desk retains same entity ID;
- one assertion may be OBSERVED while another property of same entity is INFERRED;
- rejected claim does not leak into active world state.

## GATE CONTRIBUTION

Completes structural core for **Gate 4**.

## DONE CONDITION

Three genuinely different possible worlds exist without rendering.

---

# T09 — Provenance Engine

**Depends on:** T08

## PURPOSE

Implement machine-readable ancestry queries.

## INPUT CONTRACT

Any world entity or assertion ID.

## OUTPUT CONTRACT

Operations:

```text
whyIsThisHere()
whatSupports()
whatContradicts()
whatAssumptions()
```

## ALLOWED FILES

```text
packages/provenance/**
tests/provenance/**
```

Minimal read-only imports from domain/repositories allowed.

## FORBIDDEN FILES

```text
packages/renderers/**
apps/web/**
```

## INVARIANTS

- provenance cannot invent missing ancestors;
- each evidential path terminates in SourceArtifact;
- assumption paths remain distinguishable;
- generative fill cannot masquerade as source-backed ancestry.

## ACCEPTANCE TESTS

Verify separate paths for:

```text
desk existence → claim → observation → photo
desk material → claim → assumption
```

## GATE CONTRIBUTION

**Gate 7**

## DONE CONDITION

`WHY IS THIS HERE?` works entirely before UI or rendering exists.

---

# T10 — World Diff and WHAT WOULD RESOLVE THIS?

**Depends on:** T08

## PURPOSE

Implement structural comparison and disagreement-resolution targets.

## INPUT CONTRACT

Two materialised worlds plus their hypothesis metadata.

## OUTPUT CONTRACT

```text
WorldDiff
Dispute[]
ResolutionProposal[]
```

## ALLOWED FILES

```text
packages/reconstruction/diff/**
packages/domain/worlds/**
tests/reconstruction/diff/**
```

## FORBIDDEN FILES

```text
packages/renderers/**
apps/web/**
```

## INVARIANTS

- render differences excluded;
- stable entity identity used;
- no hypothesis ranking;
- resolution proposals describe missing evidence rather than asserting conclusions;
- no invented probabilities.

## ACCEPTANCE TESTS

Pairwise diff H01/H02/H03.

Tests must demonstrate:

- entity addition/removal;
- attribute change;
- claim disposition change;
- assumption change;
- unresolved difference;
- resolution proposal for at least one dispute.

## GATE CONTRIBUTION

**Gate 9** plus `WHAT WOULD RESOLVE THIS?`

## DONE CONDITION

World disagreement is machine-readable and actionable.

---

# T11 — Reconstruction Compiler and render manifests

**Depends on:** T08, T09, T10

## PURPOSE

Create the hard boundary between epistemic world state and rendering.

## INPUT CONTRACT

Materialised World plus provenance.

## OUTPUT CONTRACT

Validated, canonical:

```text
ReconstructionSpec
```

and manifest construction utilities.

## ALLOWED FILES

```text
packages/reconstruction/compiler/**
packages/reconstruction/manifests/**
tests/reconstruction/compiler/**
```

## FORBIDDEN FILES

```text
packages/renderers/higgsfield/**
apps/web/**
```

## INVARIANTS

Compiler code must contain no direct references to:

```text
Higgsfield
GPT Image
Nano Banana
Seedance
Blender
```

except fixtures explicitly testing that provider leakage is rejected.

Unsupported details become:

```text
UNKNOWN
or
GENERATIVE_FILL
```

## ACCEPTANCE TESTS

- H01/H02/H03 compile successfully;
- schema validates;
- compile same world twice → same canonical hash;
- provenance index survives compilation;
- generated-fill policy explicit;
- source/claim/assumption IDs included.

## GATE CONTRIBUTION

**Gate 5**

## DONE CONDITION

All three worlds are renderable in principle without knowing which renderer exists.

---

# T12 — Renderer interface, registry and MockRenderer

**Depends on:** T11

## PURPOSE

Implement renderer abstraction before provider integration.

## INPUT CONTRACT

`ReconstructionSpec`.

## OUTPUT CONTRACT

```text
RendererAdapter
RendererRegistry
MockRendererAdapter
RenderJob
RenderOutput
```

## ALLOWED FILES

```text
packages/renderers/interface/**
tests/renderers/interface/**
```

## FORBIDDEN FILES

```text
packages/renderers/higgsfield/**
packages/domain/**
```

unless importing public types.

## INVARIANTS

- selection uses abstract capabilities;
- model name not present in compiler;
- renderer cannot access evidence repositories through interface;
- renderer failure leaves epistemic data intact.

## ACCEPTANCE TESTS

- registry resolves `IMAGE_FAST_DRAFT`;
- registry resolves `IMAGE_MULTI_REFERENCE`;
- unsupported capability returns typed error;
- MockRenderer creates output;
- manifest hash recorded;
- simulated renderer failure does not change world DB rows.

## GATE CONTRIBUTION

Foundation for **Gates 6 and 10**.

## DONE CONDITION

APOCRYPHA can execute the complete rendering lifecycle without any external provider.

---

# T13 — Higgsfield API and CLI adapters

**Depends on:** T12

## PURPOSE

Connect Higgsfield strictly behind the renderer abstraction.

## INPUT CONTRACT

Renderer capability request plus `ReconstructionSpec`.

## OUTPUT CONTRACT

```text
HiggsfieldApiAdapter
HiggsfieldCliAdapter
```

with:

```text
upload
discover capabilities/models
submit
poll/get
cancel
download
manifest metadata
```

as supported by the selected interface.

## ALLOWED FILES

```text
packages/renderers/higgsfield/**
tests/renderers/higgsfield/**
```

## FORBIDDEN FILES

```text
packages/domain/**
packages/provenance/**
packages/reconstruction/compiler/**
```

except imports from published interfaces.

## INVARIANTS

- model names/config live only in renderer layer/configuration;
- no provider response mutates evidence;
- credentials never committed;
- Agent API excluded;
- dynamic discovery preferred where supported.

## ACCEPTANCE TESTS

Automated:

- mocked provider request;
- job polling;
- failure;
- cancellation;
- output download;
- output hashing;
- manifest construction.

Live integration test, credential gated:

- submit one known test spec;
- complete one image render;
- persist manifest.

## GATE CONTRIBUTION

Provider side of **Gate 6** and **Gate 10**.

## DONE CONDITION

Higgsfield is replaceable and isolated from epistemic state.

---

# T14 — Core reconstruction UI: World viewer, Evidence Lens, WHY

**Depends on:** T09, T11, T12

## PURPOSE

Expose the fundamental APOCRYPHA interaction model.

## INPUT CONTRACT

Existing project containing sources, hypotheses, worlds and reconstruction records.

## OUTPUT CONTRACT

React UI providing:

```text
project source panel
hypothesis switcher
render panel
entity/assertion panel
Evidence Lens
WHY IS THIS HERE?
```

## ALLOWED FILES

```text
apps/web/client/**
apps/web/server/routes/**
tests/ui/core/**
```

## FORBIDDEN FILES

No domain architecture changes.

## INVARIANTS

- filters apply to semantic state, not truth claims about pixels;
- render remains separate from world data;
- every displayed evidential assertion can open provenance;
- generated fill visibly distinguishable.

## ACCEPTANCE TESTS

Playwright:

1. open H01;
2. toggle INFERRED off;
3. verify inferred annotations disappear;
4. select desk;
5. open provenance;
6. verify claim → observation → source chain;
7. switch to H02 without losing H01.

## GATE CONTRIBUTION

UI proof for **Gate 7** and epistemic lens.

## DONE CONDITION

A user can inspect a reconstruction epistemically rather than merely view an image.

---

# T15 — Compare, Remove Assumption and Resolve UI

**Depends on:** T06, T10, T14

## PURPOSE

Expose the three strongest branch/revision interactions.

## INPUT CONTRACT

At least three materialised worlds with one assumption-dependent disagreement.

## OUTPUT CONTRACT

UI for:

```text
COMPARE WORLDS
REMOVE ASSUMPTION
WHAT WOULD RESOLVE THIS?
```

## ALLOWED FILES

```text
apps/web/client/**
apps/web/server/routes/**
tests/ui/interactions/**
```

## FORBIDDEN FILES

No changes to domain rules except fixes for proven contract defects.

## INVARIANTS

- comparison is structural first;
- assumption removal creates a new revision;
- previous revision remains inspectable;
- dirty descendants shown;
- rerender requirement surfaced;
- missing-evidence proposal never presented as existing evidence.

## ACCEPTANCE TESTS

Playwright:

1. compare H01 and H02;
2. verify structural difference visible;
3. select a dispute;
4. view resolution proposals;
5. remove A03;
6. verify affected claims/entities listed;
7. verify unrelated element remains unchanged;
8. verify reconstruction revision increments.

## GATE CONTRIBUTION

UI proof for **Gates 8 and 9**.

## DONE CONDITION

Branching uncertainty is manipulable, inspectable and reversible.

---

# T16 — Canonical room fixture and full V0 acceptance harness

**Depends on:** T01–T15

## PURPOSE

Turn the V0 claim into a reproducible executable acceptance test.

## INPUT CONTRACT

Exactly:

```text
photo_01.jpg
photo_02.jpg
floorplan.png
inventory.txt
witness_statement.txt
```

plus canonical fixture graph data.

## OUTPUT CONTRACT

```text
fixtures/room_v0/
tests/e2e/v0/**
V0_ACCEPTANCE_REPORT.json
```

The fixture must include:

- exact five sources;
- evidence regions/spans;
- observations;
- claims;
- explicit contradiction;
- assumptions;
- H01/H02/H03;
- world mappings;
- at least one dispute;
- resolution proposals.

## ALLOWED FILES

```text
fixtures/room_v0/**
tests/e2e/**
specs/acceptance/**
```

Bug fixes elsewhere permitted only where an acceptance failure proves the implementation violates the existing spec.

## FORBIDDEN

No new features.

No architecture redesign.

No V0.2 work.

## REQUIRED ACCEPTANCE TESTS

### Gate 1

```text
5 source IDs
5 valid SHA-256 hashes
immutability verified
```

### Gate 2

Every evidential claim traces to exact evidence.

### Gate 3

At least one explicit contradiction exists.

### Gate 4

H01/H02/H03 coexist and pairwise structural diffs are non-empty.

### Gate 5

All worlds compile into provider-neutral specs.

### Gate 6

Mock renderer passes automatically.

Before release declaration, live Higgsfield renders must also exist for:

```text
H01
H02
H03
```

with manifests.

### Gate 7

At least one reconstructed entity returns complete provenance.

### Gate 8

Removing an assumption:

```text
invalidates expected descendants
preserves unrelated state
creates new world revision
creates new reconstruction spec
```

### Gate 9

All three pairwise diffs validate.

### Gate 10

Test attempts to create evidence through renderer output and is rejected.

## FINAL REPORT

Generate:

```json
{
  "v0": {
    "gate_01": "PASS",
    "gate_02": "PASS",
    "gate_03": "PASS",
    "gate_04": "PASS",
    "gate_05": "PASS",
    "gate_06_mock": "PASS",
    "gate_06_live": "PASS",
    "gate_07": "PASS",
    "gate_08": "PASS",
    "gate_09": "PASS",
    "gate_10": "PASS"
  },
  "overall": "PASS"
}
```

`overall` may be `PASS` only if every required live and deterministic acceptance condition passes.

## DONE CONDITION

The repository itself can prove whether APOCRYPHA V0 exists.

---

# Codex execution rules

Every Codex task should begin with:

```text
Do not redesign APOCRYPHA.

Treat APOCRYPHA_V0_SYSTEM_SPEC as authoritative.

If implementation appears to require a change to a frozen contract:
1. stop that portion of implementation;
2. report the conflict;
3. identify the minimum contract change required;
4. do not silently introduce the change.
```

Every task should end by reporting:

```text
FILES CREATED
FILES MODIFIED
TESTS ADDED
TEST RESULTS
CONTRACT DEVIATIONS
OPEN BLOCKERS
DONE CONDITION: PASS / FAIL
```

---

# Scope firewall

Codex must not introduce any of the following during these 16 tasks:

```text
Python services
Neo4j
vector database
embeddings
Redis
Docker orchestration
Kubernetes
cloud database
3D
Blender
Quest
VR
video
audio
GIS
web scraping
autonomous agents
Higgsfield Agent API
authentication
multi-user support
```

A package appearing convenient is not sufficient reason to alter this list.

---

# Gate-to-task matrix

| Gate | Primary task |
|---|---|
| 1 — Immutable sources | T04 |
| 2 — Evidence graph | T05 |
| 3 — Contradiction | T05 |
| 4 — Alternatives | T07–T08 |
| 5 — Compilation | T11 |
| 6 — Rendering | T12–T13, verified T16 |
| 7 — Why | T09, exposed T14 |
| 8 — Assumption removal | T06, T15 |
| 9 — World diff | T10, T15 |
| 10 — Epistemic integrity | T02/T11/T12/T13, verified T16 |

---

# Recommended execution checkpointing

Do not run all sixteen Codex tasks as one sequence without review.

Use four checkpoints:

```text
CHECKPOINT A
T01–T05
Can APOCRYPHA represent immutable evidence and contradiction?

CHECKPOINT B
T06–T10
Can APOCRYPHA represent competing possible worlds and trace their dependencies?

CHECKPOINT C
T11–T13
Can those worlds compile and render without provider contamination?

CHECKPOINT D
T14–T16
Can a person actually interrogate, compare and mutate the epistemic reconstruction?
```

If a checkpoint fails, fix it before proceeding.

Do not compensate for a broken epistemic layer with better UI or better rendering.

---

# Implementation principle

The order is intentionally:

```text
evidence
before
hypotheses

hypotheses
before
worlds

worlds
before
render specifications

render specifications
before
renderers

renderers
before
spectacle
```

That ordering is the project.

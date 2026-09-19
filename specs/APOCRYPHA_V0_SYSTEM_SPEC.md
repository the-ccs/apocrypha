# APOCRYPHA_V0_SYSTEM_SPEC

**Version:** 1.0  
**Status:** AUTHORITATIVE V0 IMPLEMENTATION SPEC  
**Date:** 19 September 2026  
**Parent boundary:** `APOCRYPHA_CAPABILITY_BOUNDARY_V1` — FROZEN FOR V0

---

# 1. Purpose

APOCRYPHA V0 exists to test one proposition:

> Given incomplete, heterogeneous and contradictory evidence about one room, a software system can maintain multiple competing interpretations without collapsing them into one answer, render those interpretations, and preserve a machine-readable explanation for every meaningful reconstructed state.

The V0 input is exactly five source artifacts:

```text
photo_01.jpg
photo_02.jpg
floorplan.png
inventory.txt
witness_statement.txt
```

The required epistemic pipeline is:

```text
SOURCE ARTIFACTS
       ↓
EVIDENCE ITEMS
       ↓
OBSERVATIONS
       ↓
CLAIMS
       ↓
SUPPORT / CONTRADICTION
       ↓
ASSUMPTIONS
       ↓
HYPOTHESES
       ↓
WORLD STATES
       ↓
RECONSTRUCTION COMPILER
       ↓
RENDERER
       ↓
TRACEABLE WORLD OUTPUT
```

V0 succeeds only if APOCRYPHA can maintain at least three structurally different, internally coherent hypotheses over the same five sources and trace the resulting world state back to those sources.

---

# 2. Scope

## 2.1 Included

V0 includes:

- immutable source ingestion;
- SHA-256 source hashing;
- evidence anchoring;
- observations;
- claims;
- support relationships;
- contradiction relationships;
- assumptions;
- dependency tracking;
- hypothesis definitions;
- hypothesis validation;
- world materialisation;
- epistemic classification;
- provenance queries;
- dependency invalidation;
- structural world diff;
- renderer-neutral reconstruction specifications;
- renderer registry;
- Higgsfield API/CLI adapters;
- image rendering;
- render manifests;
- Evidence Lens;
- `WHY IS THIS HERE?`;
- `COMPARE WORLDS`;
- `REMOVE ASSUMPTION`;
- `WHAT WOULD RESOLVE THIS?`;
- JSON import/export;
- SQLite persistence;
- local media storage.

## 2.2 Explicitly excluded

V0 does not include:

```text
3D scene reconstruction
Blender
GLB
VR / Quest
GIS
scientific datasets
live sensors
video reconstruction
audio reconstruction
temporal reconstruction
PDF ingestion
web research
vector search
embeddings
vector databases
Neo4j
cloud databases
multi-user collaboration
authentication
real-time collaboration
autonomous research
Higgsfield Agent API
LLM-required evidence extraction
```

These exclusions are architectural boundaries, not missing features.

---

# 3. Core invariants

These invariants apply to every component.

## INV-01 — Synthetic output never becomes evidence automatically

Generated images, generated objects, inferred textures, filler geometry and other renderer-created content are not admissible as evidence.

They remain:

```text
GENERATIVE_FILL
```

unless explicitly reimported by a human as a new `SourceArtifact` with metadata declaring it a synthetic reference.

No renderer may write to:

```text
SourceArtifact
EvidenceItem
Observation
Claim
Assumption
```

directly.

---

## INV-02 — Source bytes are immutable

A `SourceArtifact` is identified by a stable ID and SHA-256 content hash.

After import:

- source bytes cannot be edited in place;
- content hash cannot change;
- metadata describing the imported bytes cannot be silently rewritten.

A changed file becomes a new source artifact.

---

## INV-03 — No fake probabilities

V0 does not produce uncalibrated values such as:

```text
H01 = 73%
H02 = 18%
H03 = 9%
```

Hypotheses are represented through explicit evidence, claims, contradictions, assumptions and unresolved states.

---

## INV-04 — Uncertainty remains explicit

The canonical epistemic classes are:

```text
OBSERVED
CORROBORATED
INFERRED
CONTESTED
UNKNOWN
GENERATIVE_FILL
```

These are categories, not numeric confidence levels.

---

## INV-05 — Multiple interpretations may coexist

The existence of H01 does not invalidate H02 or H03.

A hypothesis is rejected only because it violates explicit structural constraints, not because another interpretation appears more plausible.

---

## INV-06 — Renderers do not own world state

Renderers receive compiled reconstruction specifications.

They may produce media and renderer metadata.

They may not:

- add evidential claims;
- promote generated details;
- choose the authoritative hypothesis;
- mutate the evidence graph;
- mutate assumptions;
- mutate world state.

---

## INV-07 — Provenance is preserved across compilation

Every material world assertion must retain a path to one or more of:

```text
Claim
Observation
EvidenceItem
SourceArtifact
Assumption
```

A world state without such a path must be `UNKNOWN` or `GENERATIVE_FILL`.

---

## INV-08 — Invalidation is selective

Removing one assumption invalidates only nodes depending transitively upon that assumption.

Unrelated claims and world state remain intact.

---

## INV-09 — Same state, same reconstruction specification

Given:

```text
same source revision
same graph revision
same hypothesis definition
same compiler version
```

the compiler must produce semantically identical canonical reconstruction JSON.

Renderer output itself is not required to be deterministic.

---

## INV-10 — Visual plausibility is not evidential support

A generated room looking convincing adds zero evidential support.

No model-generated detail receives `OBSERVED`, `CORROBORATED` or `INFERRED` merely because it appears visually coherent.

---

# 4. Epistemic classification refinement

The earlier conceptual examples assign epistemic classes to complete entities.

V0 refines this.

## 4.1 Classification belongs primarily to assertions

Example:

```text
desk_01 exists                  OBSERVED
desk_01 located near west wall  CORROBORATED
desk_01 material = oak          INFERRED
desk_01 exact finish            UNKNOWN
drawer handle geometry          GENERATIVE_FILL
```

It would be misleading to classify the entire desk as simply `OBSERVED`.

Therefore the canonical unit of epistemic classification is a **WorldAssertion**.

Entity-level classification may be displayed as a UI summary but is derived from its assertions.

### Downstream effect

This affects:

- World Graph;
- Reconstruction Compiler;
- Evidence Lens;
- World Diff;
- render manifests;
- provenance queries.

It does **not** expand V0 scope.

---

# 5. IDs and revision identity

All primary objects use opaque stable IDs.

Recommended format:

```text
src_<uuid>
evi_<uuid>
obs_<uuid>
clm_<uuid>
asm_<uuid>
hyp_<uuid>
wld_<uuid>
ent_<uuid>
ast_<uuid>
rel_<uuid>
rec_<uuid>
rnd_<uuid>
dsp_<uuid>
```

Application logic must never infer meaning from the ID string.

Human-readable labels are separate fields.

Example:

```json
{
  "id": "ent_...",
  "label": "Writing desk"
}
```

---

# 6. SourceArtifact

Canonical conceptual structure:

```ts
type SourceArtifact = {
  id: SourceArtifactId;
  projectId: ProjectId;

  filename: string;
  mediaType: string;
  byteLength: number;

  sha256: string;
  storagePath: string;

  sourceKind:
    | "PHOTO"
    | "FLOORPLAN"
    | "TEXT"
    | "SYNTHETIC_REFERENCE";

  importedAt: string;

  originalCreatedAt?: string;
  metadata?: Record<string, JsonValue>;

  lifecycle: "ACTIVE";
};
```

`sha256` is computed from original imported bytes.

File path is not identity.

---

# 7. EvidenceItem

`EvidenceItem` identifies the exact portion of a source used for interpretation.

```ts
type EvidenceItem = {
  id: EvidenceItemId;
  sourceArtifactId: SourceArtifactId;

  selector: EvidenceSelector;

  description: string;

  createdAt: string;
};
```

Supported V0 selectors:

```ts
type EvidenceSelector =
  | {
      type: "WHOLE_SOURCE";
    }
  | {
      type: "IMAGE_REGION";
      x: number;
      y: number;
      width: number;
      height: number;
      coordinateSpace: "NORMALIZED_0_1";
    }
  | {
      type: "TEXT_SPAN";
      startOffset: number;
      endOffset: number;
      excerptSha256: string;
    };
```

Image selectors use normalized coordinates.

Text selectors reference the stored canonical text representation and include an excerpt hash to detect accidental drift.

---

# 8. Observation

An Observation records what is directly perceived or read from evidence without yet asserting a larger interpretation.

Example:

```text
O04:
A rectangular wooden surface is visible against the left wall.
```

Canonical structure:

```ts
type Observation = {
  id: ObservationId;

  description: string;

  evidenceItemIds: EvidenceItemId[];

  observationType:
    | "VISUAL"
    | "TEXTUAL"
    | "SPATIAL"
    | "ENUMERATED";

  createdAt: string;

  lifecycle:
    | "ACTIVE"
    | "SUPERSEDED";
};
```

An observation must reference at least one `EvidenceItem`.

---

# 9. Claim

Claims express propositions about the reconstructed world.

Examples:

```text
The room contained a desk.

The desk stood against the western wall.

The northern opening was a doorway.

The northern opening was a window.
```

Canonical structure:

```ts
type Claim = {
  id: ClaimId;

  subject: string;
  predicate: string;
  object: JsonValue;

  description: string;

  epistemicClass:
    | "OBSERVED"
    | "CORROBORATED"
    | "INFERRED"
    | "CONTESTED"
    | "UNKNOWN";

  observationIds: ObservationId[];
  assumptionIds: AssumptionId[];

  createdAt: string;

  lifecycle:
    | "ACTIVE"
    | "INVALIDATED"
    | "SUPERSEDED";
};
```

`GENERATIVE_FILL` is not a normal evidential claim class.

It belongs to reconstruction/world assertions introduced solely for rendering.

---

# 10. Claim relationships

Supported V0 relationship types:

```text
SUPPORTS
CONTRADICTS
QUALIFIES
DERIVED_FROM
DEPENDS_ON
UNRESOLVED
```

Canonical structure:

```ts
type ClaimRelation = {
  id: RelationId;

  fromClaimId: ClaimId;
  toClaimId: ClaimId;

  type:
    | "SUPPORTS"
    | "CONTRADICTS"
    | "QUALIFIES"
    | "DERIVED_FROM"
    | "DEPENDS_ON"
    | "UNRESOLVED";

  mutuallyExclusive?: boolean;

  rationale?: string;
};
```

A `CONTRADICTS` relationship does not automatically mean one claim is false.

It means the relationship must be handled explicitly by hypothesis construction.

---

# 11. Assumptions

Assumptions are first-class graph nodes.

```ts
type Assumption = {
  id: AssumptionId;

  statement: string;
  rationale?: string;

  status:
    | "ACTIVE"
    | "REMOVED";

  createdAt: string;
};
```

Claims, assertions and other derived structures may depend on assumptions.

Dependency information must not be encoded only in prose.

---

# 12. Generic dependency edge

Dependency invalidation uses explicit typed edges.

```ts
type DependencyEdge = {
  fromNodeId: GraphNodeId;
  toNodeId: GraphNodeId;

  type:
    | "DEPENDS_ON"
    | "DERIVED_FROM";
};
```

Interpretation:

```text
A → B
```

means:

> B depends on A.

Removing A therefore places B into the affected downstream set.

Dependency traversal must detect cycles.

A cycle is a validation error unless a later specification explicitly introduces cyclic semantics.

---

# 13. Hypothesis definition

A Hypothesis is not an image.

It is a structured interpretation.

```ts
type HypothesisDefinition = {
  id: HypothesisId;
  label: string;

  acceptedClaimIds: ClaimId[];
  rejectedClaimIds: ClaimId[];
  unresolvedClaimIds: ClaimId[];

  activeAssumptionIds: AssumptionId[];

  createdAt: string;
};
```

The three dispositions are:

```text
ACCEPTED
REJECTED
UNRESOLVED
```

No claim may appear in more than one disposition within the same hypothesis.

---

# 14. Hypothesis validation

A hypothesis is structurally valid only if:

1. all referenced claims exist;
2. all referenced assumptions exist;
3. no claim has multiple dispositions;
4. all claims whose dependencies are required remain valid;
5. no pair of mutually exclusive claims is simultaneously accepted;
6. all required assumptions for accepted claims are active;
7. dependency traversal is cycle-safe;
8. world materialisation does not create mutually exclusive assertions simultaneously.

Hypothesis validation is deterministic.

V0 does **not** require an LLM to invent hypotheses.

Humans, fixtures or later AI systems may propose hypothesis definitions.

APOCRYPHA owns validation.

---

# 15. Structural difference requirement

For V0 acceptance, H01, H02 and H03 must be pairwise structurally different.

A difference counts only if at least one of these differs:

```text
accepted claim
rejected claim
unresolved claim
active assumption
entity existence
entity attribute
entity relationship
spatial state
```

Different prompts, seeds or generated images alone do not constitute different hypotheses.

---

# 16. World Graph

A validated hypothesis materialises into a World.

```ts
type World = {
  id: WorldId;

  hypothesisId: HypothesisId;
  revision: number;

  entities: WorldEntity[];
  assertions: WorldAssertion[];
  relationships: WorldRelationship[];

  generatedAt: string;
};
```

---

# 17. WorldEntity

```ts
type WorldEntity = {
  id: EntityId;

  canonicalKey: string;
  label: string;

  entityType:
    | "ARCHITECTURAL"
    | "FURNITURE"
    | "OBJECT"
    | "OPENING"
    | "SURFACE"
    | "OTHER";

  existence:
    | "PRESENT"
    | "ABSENT"
    | "UNRESOLVED";
};
```

The same logical entity uses the same stable entity ID across hypotheses where applicable.

This is essential for structural diffing.

---

# 18. WorldAssertion

`WorldAssertion` is the primary reconstructed semantic unit.

```ts
type WorldAssertion = {
  id: WorldAssertionId;

  entityId: EntityId;

  property: string;
  value: JsonValue;

  epistemicClass:
    | "OBSERVED"
    | "CORROBORATED"
    | "INFERRED"
    | "CONTESTED"
    | "UNKNOWN"
    | "GENERATIVE_FILL";

  claimIds: ClaimId[];
  assumptionIds: AssumptionId[];

  lifecycle:
    | "ACTIVE"
    | "INVALIDATED";
};
```

Rules:

- `OBSERVED` requires direct observation ancestry.
- `CORROBORATED` requires supporting ancestry from at least two distinct evidence paths.
- `INFERRED` must identify its inferential support and any assumptions.
- `CONTESTED` must identify incompatible evidence or claims.
- `UNKNOWN` may have no asserted value beyond explicit uncertainty.
- `GENERATIVE_FILL` must not cite itself as evidence.

---

# 19. World relationships

```ts
type WorldRelationship = {
  id: WorldRelationshipId;

  subjectEntityId: EntityId;
  predicate: string;
  objectEntityId: EntityId;

  epistemicClass: EpistemicClass;

  claimIds: ClaimId[];
  assumptionIds: AssumptionId[];
};
```

Examples:

```text
desk_01 AGAINST west_wall
chair_01 IN_FRONT_OF desk_01
door_01 CONNECTS room_main corridor
```

---

# 20. World materialisation

The World Materialiser consumes:

```text
Validated Hypothesis
+
Claims
+
Assumptions
+
Domain mapping rules
```

and creates the World Graph.

The materialiser must not call a renderer.

The materialiser must not call Higgsfield.

---

# 21. Provenance Engine

The Provenance Engine operates over graph ancestry.

Required query:

```ts
whyIsThisHere(targetId)
```

Example response:

```json
{
  "target_id": "ent_desk_01",
  "paths": [
    {
      "world_assertion": "ast_...",
      "claim": "clm_C17",
      "observation": "obs_O04",
      "evidence_item": "evi_...",
      "source_artifact": "src_photo_02"
    }
  ]
}
```

It must also support:

```ts
whatSupports(targetId)
whatContradicts(targetId)
whatAssumptions(targetId)
```

All paths must terminate at a source artifact, assumption or explicit unknown/generative state.

---

# 22. Assumption removal

Removing an assumption is a scenario mutation, not deletion of historical evidence.

Operation:

```ts
removeAssumption(hypothesisId, assumptionId)
```

Required algorithm:

```text
1. mark assumption inactive for the target hypothesis;
2. find all outbound dependency descendants;
3. mark affected derived claims/assertions invalid;
4. revalidate the hypothesis;
5. rematerialise affected world state;
6. calculate dirty entity IDs;
7. compile a new reconstruction revision;
8. request renderer regeneration if required;
9. preserve the previous revision and manifests.
```

Historical revisions remain queryable.

The source graph is not destroyed.

---

# 23. Dirty-set regeneration

The invalidation engine returns:

```ts
type InvalidationResult = {
  removedAssumptionId: AssumptionId;

  affectedClaimIds: ClaimId[];
  affectedAssertionIds: WorldAssertionId[];
  affectedEntityIds: EntityId[];

  requiresRecompile: boolean;
  requiresRender: boolean;
};
```

Where the renderer supports targeted edit/regeneration, APOCRYPHA may use it.

Otherwise a full rerender is permitted.

The manifest must record:

```text
regeneration_mode = FULL | PARTIAL
dirty_entity_ids
previous_reconstruction_id
```

Selective semantic invalidation is mandatory.

Selective pixel generation is not.

---

# 24. World Diff

Required operation:

```ts
diffWorlds(worldA, worldB)
```

Canonical result:

```ts
type WorldDiff = {
  worldA: WorldId;
  worldB: WorldId;

  entitiesAdded: EntityId[];
  entitiesRemoved: EntityId[];

  existenceChanges: Change[];
  attributeChanges: Change[];
  relationshipChanges: Change[];

  claimDispositionChanges: Change[];
  assumptionChanges: Change[];

  unresolvedDifferences: Change[];
};
```

A render-only difference is excluded.

---

# 25. WHAT WOULD RESOLVE THIS?

Disagreements become explicit `Dispute` objects.

```ts
type Dispute = {
  id: DisputeId;

  subject: string;

  claimIds: ClaimId[];
  hypothesisIds: HypothesisId[];

  description: string;
};
```

Resolution output:

```ts
type ResolutionProposal = {
  disputeId: DisputeId;

  priority:
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  requestedEvidence: string;
  evidenceKind: string;

  discriminatesBetween: ClaimId[];

  rationale: string;
};
```

V0 does not need autonomous research.

It only needs to identify what evidence would discriminate between alternatives.

No probabilities are generated.

---

# 26. Resolution heuristics

V0 may use deterministic heuristics.

Examples:

### Spatial disagreement

If two hypotheses disagree about location:

```text
HIGH:
direct photograph showing disputed region
original dimensioned floorplan

MEDIUM:
renovation drawing
inventory with explicit location

LOW:
general architectural typology
```

### Existence disagreement

```text
HIGH:
photograph showing disputed area
primary inventory
contemporaneous plan

MEDIUM:
witness statement
secondary description

LOW:
analogy with similar rooms
```

These outputs are research targets, not evidence.

---

# 27. Reconstruction Compiler

The Reconstruction Compiler converts a World into a renderer-independent `ReconstructionSpec`.

It must not import provider-specific code.

Input:

```text
World
Hypothesis
Provenance index
Compiler policy
```

Output:

```ts
type ReconstructionSpec = {
  specVersion: string;

  reconstructionId: ReconstructionId;

  hypothesisId: HypothesisId;
  worldId: WorldId;
  worldRevision: number;

  entities: ReconstructionEntity[];

  relationships: ReconstructionRelationship[];

  sourceArtifactIds: SourceArtifactId[];
  claimIds: ClaimId[];
  assumptionIds: AssumptionId[];

  requiredCapabilities: RendererCapability[];

  renderingPolicy: RenderingPolicy;

  provenanceIndex: Record<string, ProvenanceRef[]>;

  canonicalHash: string;
};
```

---

# 28. ReconstructionEntity

```ts
type ReconstructionEntity = {
  entityId: EntityId;

  existence: "PRESENT" | "ABSENT" | "UNRESOLVED";

  properties: {
    property: string;
    value: JsonValue;
    epistemicClass: EpistemicClass;
    claimIds: ClaimId[];
    assumptionIds: AssumptionId[];
  }[];

  rendererHints?: {
    semanticRegion?: string;
  };
};
```

`rendererHints` are not evidence.

They exist only to aid rendering.

---

# 28A. ReconstructionRelationship

`ReconstructionRelationship` is the renderer-neutral compiled representation of a relationship present in the World Graph.

It preserves the identity and epistemic provenance of the source `WorldRelationship`.

```ts
type ReconstructionRelationship = {
  relationshipId: WorldRelationshipId;

  subjectEntityId: EntityId;
  predicate: string;
  objectEntityId: EntityId;

  epistemicClass: EpistemicClass;

  claimIds: ClaimId[];
  assumptionIds: AssumptionId[];
};
```

Rules:

- `relationshipId` preserves the identity of the originating `WorldRelationship`.
- `subjectEntityId` and `objectEntityId` must reference entities contained in the compiled reconstruction.
- `predicate` must be a non-empty string.
- `epistemicClass` uses the canonical APOCRYPHA epistemic classes.
- `claimIds` and `assumptionIds` preserve upstream provenance dependencies.
- Duplicate IDs are not permitted within `claimIds` or `assumptionIds`.
- A reconstruction relationship does not create new evidential authority.
- A `GENERATIVE_FILL` relationship must not claim evidential support that does not exist in the World Graph.
- Renderer-specific information must not be added to this structure.

`ReconstructionRelationship` is derived from world state.

Renderers consume it.

Renderers do not create or mutate it.

---

# 28B. ProvenanceRef

`ProvenanceRef` is a compact renderer-independent reference to provenance information associated with a reconstructed entity, property, or relationship.

It does not replace the Provenance Engine or encode the complete provenance graph.

```ts
type ProvenanceRef =
  | {
      type: "CLAIM";
      id: ClaimId;
    }
  | {
      type: "OBSERVATION";
      id: ObservationId;
    }
  | {
      type: "EVIDENCE_ITEM";
      id: EvidenceItemId;
    }
  | {
      type: "SOURCE_ARTIFACT";
      id: SourceArtifactId;
    }
  | {
      type: "ASSUMPTION";
      id: AssumptionId;
    }
  | {
      type: "UNKNOWN";
      reason?: string;
    }
  | {
      type: "GENERATIVE_FILL";
      reason?: string;
    };
```

Rules:

- `ProvenanceRef` is a discriminated union using `type`.
- References to graph objects must contain the correctly typed stable ID.
- `UNKNOWN` and `GENERATIVE_FILL` do not contain graph-node IDs unless such a node type is explicitly introduced by a later specification.
- `UNKNOWN` means the reconstruction contains explicit unresolved state.
- `GENERATIVE_FILL` means the referenced reconstruction detail exists solely to make representation/rendering possible.
- `GENERATIVE_FILL` must never reference generated output as evidential support.
- A flat `ProvenanceRef[]` is an index of relevant provenance nodes, not a substitute for ordered provenance paths.
- Full ancestry remains the responsibility of the Provenance Engine.
- Provenance references must never be interpreted as probability or confidence values.

The `ReconstructionSpec.provenanceIndex` therefore remains:

```ts
provenanceIndex: Record<string, ProvenanceRef[]>;
```

The record key identifies the reconstruction entity, property, or relationship whose provenance is being indexed.

The exact key-generation convention belongs to the Reconstruction Compiler implementation and must be deterministic.

# 29. Rendering policy

```ts
type RenderingPolicy = {
  unknownHandling:
    | "KEEP_AMBIGUOUS"
    | "ALLOW_FILL";

  generatedFillLabelRequired: true;

  preserveContestedElements: boolean;

  excludedEntityIds: EntityId[];

  notes?: string[];
};
```

Any detail necessary for a coherent image but unsupported by world assertions is classified as `GENERATIVE_FILL`.

---

# 30. Renderer capabilities

Core capability vocabulary:

```text
IMAGE_MULTI_REFERENCE
IMAGE_EDIT
IMAGE_FAST_DRAFT

OBJECT_3D
SCENE_3D

VIDEO_REFERENCE_GUIDED
ENVIRONMENT_AUDIO
```

Only the image capabilities are relevant to V0.

Core domain packages may refer to capability names.

They may not refer to provider names or model names.

---

# 31. RendererAdapter

Conceptual contract:

```ts
interface RendererAdapter {
  providerId(): string;

  capabilities(): Promise<RendererCapability[]>;

  upload(input: RendererUploadInput): Promise<RendererAsset>;

  renderImage(
    spec: ReconstructionSpec,
    options?: RenderOptions
  ): Promise<RenderJob>;

  getJob(jobId: string): Promise<RenderJob>;

  cancelJob(jobId: string): Promise<void>;
}
```

Future methods may include:

```text
render3D()
renderVideo()
renderAudio()
```

but they are not introduced in V0.

---

# 32. RendererRegistry

`RendererRegistry` resolves abstract requirements to a current provider implementation.

Conceptually:

```ts
resolve({
  capability: "IMAGE_MULTI_REFERENCE",
  quality: "FINAL"
});
```

may return:

```text
provider = higgsfield
model = <current discovered/configured model>
```

Model identifiers are configuration/runtime data.

They must not be scattered throughout domain logic.

---

# 33. Higgsfield adapters

V0 package boundary:

```text
packages/renderers/higgsfield/
    api/
    cli/
```

Required architectural classes:

```text
HiggsfieldApiAdapter
HiggsfieldCliAdapter
```

`HiggsfieldAgentAdapter` is excluded from V0 execution.

The adapter records provider-specific identifiers but translates them into generic renderer contracts.

---

# 34. Render Manifest

Every completed render must produce a manifest.

Required fields:

```ts
type RenderManifest = {
  reconstructionId: ReconstructionId;

  hypothesisId: HypothesisId;
  worldRevision: number;

  provider: string;
  adapter: string;

  model: string;
  providerModelVersion?: string;

  requestOrJobId: string;

  promptOrRequest: JsonValue;
  parameters: JsonValue;

  sourceArtifactIds: SourceArtifactId[];
  claimIds: ClaimId[];
  assumptionIds: AssumptionId[];

  epistemicClasses: EpistemicClass[];

  regenerationMode:
    | "INITIAL"
    | "FULL"
    | "PARTIAL";

  dirtyEntityIds?: EntityId[];

  generatedAt: string;

  outputPath: string;
  outputSha256: string;
};
```

A render without a manifest is not a valid APOCRYPHA reconstruction output.

---

# 35. Render-output semantics

Generated imagery is a representation of the compiled world.

It is **not** itself the world graph.

The existence of a generated object in the output image does not prove the object exists in the reconstruction specification.

The renderer may hallucinate.

Therefore APOCRYPHA must preserve:

```text
compiled entity list
render manifest
generated output
```

as separate objects.

---

# 36. Entity selection and render overlays

V0 must not pretend that generative pixels provide deterministic object segmentation.

Therefore entity selection is semantic.

The UI may provide:

- entity chips;
- entity cards;
- annotation markers;
- approximate overlays;
- list-to-render highlighting.

However any render-space annotation is renderer metadata, not source evidence.

If a pixel region has not been independently verified, APOCRYPHA must not describe it as a proven mapping.

---

# 37. Evidence Lens

The Evidence Lens filters reconstructed semantic state by:

```text
OBSERVED
CORROBORATED
INFERRED
CONTESTED
UNKNOWN
GENERATIVE_FILL
```

V0 implementation may:

- hide/show entity annotations;
- dim entity cards;
- change overlays;
- filter world assertions.

It does not need to rewrite generated pixels.

---

# 38. WHY IS THIS HERE?

Selecting a reconstructed entity or assertion exposes:

```text
world state
↓
claim(s)
↓
observation(s)
↓
evidence item(s)
↓
source artifact(s)
```

and where relevant:

```text
assumption(s)
```

Example:

```text
desk_01
 ├─ existence = PRESENT [OBSERVED]
 │   └─ C17
 │      └─ O04
 │         └─ photo_02.jpg region [...]
 │
 └─ material = oak [INFERRED]
     ├─ C31
     └─ A03
```

---

# 39. COMPARE WORLDS

The interface presents structural difference first.

Required sections:

```text
ENTITIES
ATTRIBUTES
RELATIONSHIPS
CLAIMS
ASSUMPTIONS
UNRESOLVED
```

Rendered images may be shown alongside the diff but never replace it.

---

# 40. REMOVE ASSUMPTION interaction

The UI must show the impact before or immediately after recomputation:

```text
Assumption removed:
A03

Affected:
2 claims
3 assertions
1 entity
1 reconstruction

Unaffected:
17 claims
8 entities
...
```

The new world becomes a new revision.

The prior world revision remains available.

---

# 41. Project-level constraint

A V0 Room Project has:

```text
exactly 5 ACTIVE source artifacts
at least 3 valid hypotheses
```

Compilation is blocked until five sources are present.

The sixth source is not silently accepted into the V0 fixture.

Future project types may use different constraints.

---

# 42. Extraction policy

Autonomous LLM extraction is **not required** for V0.

Observations and claims may enter through:

- fixture data;
- structured forms;
- deterministic import;
- future LLM proposals.

If an LLM is later used, its result is treated as a proposal requiring schema validation.

This keeps the V0 proof focused on epistemic structure rather than extraction quality.

---

# 43. Persistence

V0 uses:

```text
SQLite
local filesystem
JSON export
```

Recommended persistence tables:

```text
projects

source_artifacts
evidence_items

observations
claims
claim_relations

assumptions
dependency_edges

hypotheses
hypothesis_claims
hypothesis_assumptions

worlds
world_entities
world_assertions
world_relationships

disputes
resolution_proposals

reconstruction_specs

render_jobs
render_outputs
render_manifests

audit_events
```

JSON columns may be used for extensible metadata but not as a substitute for core graph relationships.

---

# 44. Storage layout

Recommended local structure:

```text
data/
├── apocrypha.sqlite
└── objects/
    ├── source/
    └── generated/
```

Suggested object naming:

```text
objects/source/<sha256>
objects/generated/<sha256>
```

Original filename remains metadata.

---

# 45. SQLite policy

SQLite stores graph edges relationally.

No graph database is introduced.

Recursive dependency queries may use:

- recursive CTEs; or
- deterministic traversal in TypeScript.

Either is acceptable if tests prove correct invalidation.

---

# 46. Audit events

Important state-changing actions create audit records.

Examples:

```text
SOURCE_IMPORTED
OBSERVATION_CREATED
CLAIM_CREATED
CLAIM_RELATION_CREATED
ASSUMPTION_CREATED
HYPOTHESIS_CREATED
HYPOTHESIS_VALIDATED
WORLD_MATERIALISED
ASSUMPTION_REMOVED
WORLD_RECOMPUTED
RECONSTRUCTION_COMPILED
RENDER_SUBMITTED
RENDER_COMPLETED
```

Audit records are informational and do not replace domain state.

---

# 47. JSON export

A V0 project export must contain enough structured data to inspect:

- sources and hashes;
- evidence selectors;
- observations;
- claims;
- relationships;
- assumptions;
- hypotheses;
- worlds;
- provenance;
- diffs;
- reconstruction specs;
- render manifests.

Source media may be referenced rather than embedded.

---

# 48. Recommended implementation stack

V0 standardises the implementation stack to prevent Codex making framework decisions independently.

```text
TypeScript
pnpm workspaces
React
Vite
Node
Fastify
SQLite
better-sqlite3
Zod
Vitest
Playwright
```

No ORM is required.

Schema migrations should be explicit SQL files.

This is an implementation decision, not a change in architectural scope.

---

# 49. Repository

```text
apocrypha/
├── apps/
│   └── web/
│       ├── client/
│       └── server/
│
├── packages/
│   ├── domain/
│   │   ├── evidence/
│   │   ├── claims/
│   │   ├── assumptions/
│   │   ├── hypotheses/
│   │   └── worlds/
│   │
│   ├── provenance/
│   │
│   ├── reconstruction/
│   │   ├── compiler/
│   │   ├── manifests/
│   │   └── diff/
│   │
│   ├── renderers/
│   │   ├── interface/
│   │   └── higgsfield/
│   │
│   └── persistence/
│
├── fixtures/
│   └── room_v0/
│
├── specs/
│
└── tests/
```

No package may bypass declared public interfaces merely for convenience.

---

# 50. Dependency direction

Allowed dependency direction:

```text
domain
  ↑
provenance
  ↑
reconstruction
  ↑
application
```

Persistence implements repositories defined by domain/application contracts.

Renderers implement renderer interfaces.

Core domain code must not import:

```text
Fastify
React
Higgsfield SDK
Higgsfield CLI
SQLite implementation details
```

---

# 51. Error model

Errors must be typed.

Minimum categories:

```text
VALIDATION_ERROR
SOURCE_INTEGRITY_ERROR
DEPENDENCY_CYCLE_ERROR
HYPOTHESIS_CONFLICT_ERROR
MISSING_DEPENDENCY_ERROR
COMPILATION_ERROR
RENDERER_UNAVAILABLE
RENDERER_JOB_FAILED
STORAGE_ERROR
```

Renderer failure does not invalidate epistemic state.

---

# 52. Renderer failure isolation

If rendering is unavailable:

```text
Evidence Graph       AVAILABLE
Claims               AVAILABLE
Hypotheses           AVAILABLE
World Graph          AVAILABLE
Provenance           AVAILABLE
World Diff           AVAILABLE
Assumption Removal   AVAILABLE
Compilation          AVAILABLE
Rendering            UNAVAILABLE
```

This is required behaviour.

---

# 53. Test strategy

Four levels are required.

## Unit

Tests individual domain rules:

```text
hash validation
claim relations
hypothesis consistency
dependency traversal
world materialisation
provenance traversal
world diff
compiler determinism
```

## Contract

Tests repository and renderer interfaces against deterministic test doubles.

## Integration

Tests SQLite and Higgsfield adapters independently.

## End-to-end

Runs the entire room fixture through all ten V0 acceptance gates.

---

# 54. Renderer testing clarification

Automated CI must not depend on paid or nondeterministic external rendering.

Therefore CI uses:

```text
MockRendererAdapter
```

to verify:

- registry resolution;
- render request creation;
- manifest generation;
- output hashing;
- failure isolation.

However V0 Gate 6 additionally requires at least one successful **live Higgsfield integration run for H01, H02 and H03** before V0 can be declared complete.

This does not weaken Gate 6.

It prevents external provider state from making the entire deterministic test suite unreliable.

---

# 55. Gate mapping

## GATE 1 — Immutable sources

Pass conditions:

- five fixture sources imported;
- five stable source IDs;
- SHA-256 recorded;
- mutation attempt rejected;
- reimported changed bytes create a new source.

## GATE 2 — Evidence graph

Pass conditions:

- every fixture observation references evidence;
- every evidential claim traces through observations to source artifacts;
- image regions/text spans survive export/import.

## GATE 3 — Contradiction

Pass conditions:

- at least one explicit `CONTRADICTS` relationship exists;
- conflict is visible to hypothesis validation and comparison;
- contradiction is not silently resolved globally.

## GATE 4 — Alternatives

Pass conditions:

- H01, H02 and H03 coexist;
- all validate;
- each pair produces non-empty structural difference;
- all use the same shared source set.

## GATE 5 — Reconstruction compilation

Pass conditions:

- all three hypotheses materialise;
- all compile;
- compiler output validates against schema;
- no provider-specific model identifiers appear in core compiler code;
- identical input produces identical canonical spec hash.

## GATE 6 — Rendering

Pass conditions:

- H01, H02 and H03 each produce an image through a Higgsfield adapter;
- every output has a render manifest;
- every output has SHA-256 recorded;
- provider/model/job ID are recorded.

## GATE 7 — Why

Pass conditions:

- at least one entity contains multiple assertions;
- `WHY IS THIS HERE?` resolves valid provenance for existence and an attribute;
- assumption-dependent ancestry is distinguishable from direct evidence.

## GATE 8 — Assumption removal

Pass conditions:

- one hypothesis contains an assumption-dependent state;
- removal produces expected dirty descendants;
- unrelated nodes are unchanged;
- new world revision is created;
- reconstruction is recompiled;
- required rerender scope is reported.

## GATE 9 — World diff

Pass conditions:

- H01↔H02;
- H01↔H03;
- H02↔H03

all emit valid machine-readable diffs.

At least one diff must demonstrate an entity/state difference and one must demonstrate a claim or assumption difference.

## GATE 10 — Epistemic integrity

Pass conditions:

- generated output cannot create observations or claims through renderer code;
- generative filler remains labelled;
- render-output import requires explicit human action and receives a new source record;
- automated test confirms there is no renderer → evidence mutation path.

---

# 56. V0 end-state

The completed system must demonstrate the following sequence:

```text
IMPORT 5 SOURCES
      ↓
ANCHOR EVIDENCE
      ↓
CREATE OBSERVATIONS
      ↓
CREATE CLAIMS
      ↓
RECORD CONTRADICTION
      ↓
CREATE ASSUMPTIONS
      ↓
DEFINE H01 / H02 / H03
      ↓
VALIDATE
      ↓
MATERIALISE 3 WORLDS
      ↓
COMPILE 3 RECONSTRUCTIONS
      ↓
RENDER 3 IMAGES
      ↓
INSPECT EVIDENCE LENS
      ↓
ASK "WHY IS THIS HERE?"
      ↓
COMPARE WORLDS
      ↓
ASK "WHAT WOULD RESOLVE THIS?"
      ↓
REMOVE ASSUMPTION
      ↓
INVALIDATE DEPENDANTS
      ↓
RECOMPILE AFFECTED WORLD
      ↓
RERENDER
```

At no point does generated media become evidential authority.

---

# 57. Architectural doctrine

The governing rule remains:

> **Higgsfield generates representations. APOCRYPHA decides what those representations are allowed to mean.**

The V0 implementation must preserve this boundary even where violating it would make development easier.

---

# 58. V0 definition

> **Given five pieces of evidence about one room, APOCRYPHA must construct three competing, internally traceable interpretations, render each interpretation, identify exactly why their elements exist, expose their disagreements, identify evidence that could resolve those disagreements, and recompute only the affected semantic world state when an assumption is removed.**

# APOCRYPHA

> **Evidence → observations → claims → assumptions → competing hypotheses → possible worlds → traceable reconstructions**

**APOCRYPHA** is an epistemic reconstruction platform for turning incomplete, conflicting, uncertain, or heterogeneous evidence into multiple **traceable possible worlds**.

It is not a generic generative-AI application and it is not designed to produce a single plausible-looking reconstruction.

Its defining principle is:

> **Every reconstructed element must retain a machine-readable explanation of why it exists, what supports it, what contradicts it, what assumptions it depends on, and what portion was invented solely to make rendering possible.**

---

## Core idea

Traditional reconstruction systems tend to collapse uncertainty into one output.

APOCRYPHA preserves the uncertainty itself.

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
   ↙       ↓       ↘
 H01      H02      H03
   \       |       /
       ↓
WORLD STATES
       ↓
RECONSTRUCTION COMPILER
       ↓
RENDERER
       ↓
TRACEABLE WORLD OUTPUT
```

Multiple internally consistent interpretations can coexist without one being silently promoted to the truth.

---

## Epistemic states

APOCRYPHA preserves the distinction between:

```text
OBSERVED
CORROBORATED
INFERRED
CONTESTED
UNKNOWN
GENERATIVE_FILL
```

Synthetic output never automatically becomes evidence.

A generated object, texture, image, sound, or other synthetic detail remains generated unless a human explicitly reintroduces it as a synthetic reference.

This prevents recursive hallucination from entering the evidence graph.

---

## APOCRYPHA owns the reasoning layer

### Evidence Graph

Represents:

```text
SourceArtifact
    ↓
EvidenceItem
    ↓
Observation
    ↓
Claim
```

with typed relationships including:

```text
SUPPORTS
CONTRADICTS
QUALIFIES
DERIVED_FROM
DEPENDS_ON
UNRESOLVED
```

### Assumption Graph

Assumptions are first-class objects.

APOCRYPHA can determine exactly which claims, entities, attributes, and reconstructed states depend on a particular assumption.

Removing an assumption invalidates only the affected parts of a world.

### Hypothesis Engine

Multiple interpretations of the same evidence can coexist.

APOCRYPHA does not prematurely collapse uncertainty into a single answer.

### World Graph

Represents renderer-independent reconstruction state:

```text
World
Entity
WorldAssertion
Relationship
SpatialState
CandidateState
```

Different hypotheses may assign different states to the same logical entity.

### Provenance Engine

Supports questions such as:

```text
WHY IS THIS HERE?

WHAT SUPPORTS THIS?

WHAT CONTRADICTS THIS?

WHAT ASSUMPTIONS DOES THIS DEPEND ON?
```

### Reconstruction Compiler

Converts a hypothesis/world into a renderer-independent reconstruction specification.

Rendering systems consume APOCRYPHA state.

They do not define it.

### World Diff

Provides structural comparison between possible worlds:

```text
entities added / removed
attribute changes
relationship changes
claim changes
assumption changes
unresolved differences
```

### WHAT WOULD RESOLVE THIS?

For disagreements between competing worlds, APOCRYPHA can identify what missing evidence would best discriminate between them.

---

## Rendering boundary

APOCRYPHA is renderer-agnostic.

Higgsfield is the primary rendering substrate being explored for the initial implementation, but it is not the hypothesis authority.

> **Higgsfield generates representations. APOCRYPHA decides what those representations are allowed to mean.**

Renderer capabilities are accessed through abstract interfaces and a `RendererRegistry`, rather than hardcoding model names into the epistemic core.

If a renderer is unavailable, the evidence graph, hypotheses, worlds, provenance, diffs, and assumption system must continue to function.

---

# V0

The first prototype is deliberately constrained.

## Test case

> **Reconstruct one room from exactly five pieces of evidence.**

Example input:

```text
photo_01.jpg
photo_02.jpg
floorplan.png
inventory.txt
witness_statement.txt
```

No arbitrary web research is required for V0.

---

## Required V0 interactions

### EVIDENCE LENS

Reveal or hide reconstructed state by epistemic class.

### WHY IS THIS HERE?

Select a reconstructed element and inspect its provenance.

Example:

```text
desk_01
  ↓
Claim C17
  ↓
Observation O04
  ↓
photo_02.jpg
```

### COMPARE WORLDS

Structurally compare H01, H02, and H03 rather than merely placing generated images side-by-side.

### REMOVE ASSUMPTION

Remove an assumption, identify its dependants, recompute the affected world state, and regenerate only what is necessary where practical.

### WHAT WOULD RESOLVE THIS?

Identify evidence that would discriminate between competing hypotheses.

---

## V0 acceptance gates

V0 is complete only when:

1. Source files receive immutable IDs and hashes.
2. Claims trace back to exact source evidence.
3. At least one explicit contradiction is represented.
4. At least three structurally different hypotheses coexist.
5. Each hypothesis compiles into a renderer-neutral reconstruction specification.
6. Each hypothesis can be rendered.
7. A reconstructed entity can answer `WHY IS THIS HERE?`.
8. Removing an assumption invalidates the correct dependent state.
9. Any pair of worlds can produce a machine-readable structural diff.
10. Generated detail is never silently promoted into evidence.

---

## Technology

V0 intentionally uses a small stack:

```text
TypeScript
React
Vite
Node
Fastify
SQLite
pnpm
Vitest
Playwright
```

Local media/object storage and JSON import/export are used initially.

V0 deliberately does **not** require:

```text
Neo4j
vector databases
Python services
cloud databases
3D
Blender
VR
GIS
video reconstruction
audio reconstruction
autonomous web research
multi-user collaboration
```

Those belong to later phases only if the epistemic core succeeds.

---

## Repository structure

Target structure:

```text
apocrypha/
├── apps/
│   └── web/
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
└── tests/
```

---

## Specifications

The authoritative V0 documents live in [`specs/`](./specs/).

Primary documents:

```text
APOCRYPHA_V0_SYSTEM_SPEC.md
APOCRYPHA_V0_CODEX_IMPLEMENTATION_SEQUENCE.md
```

The System Spec defines architecture and behavioural contracts.

The implementation sequence divides V0 into sixteen bounded Codex tasks so architecture is designed deliberately rather than invented during implementation.

---

## Development discipline

Codex is not asked to:

> Build APOCRYPHA.

Implementation is divided into narrowly bounded tasks with explicit:

```text
PURPOSE
INPUT CONTRACT
OUTPUT CONTRACT
ALLOWED FILES
FORBIDDEN FILES
INVARIANTS
ACCEPTANCE TESTS
DONE CONDITION
```

The implementation order is deliberately:

```text
evidence
before
hypotheses

hypotheses
before
worlds

worlds
before
reconstruction specifications

reconstruction specifications
before
renderers

renderers
before
spectacle
```

---

## Current status

**V0 — early implementation**

The architecture and V0 capability boundary have been defined.

Development begins with the repository/tooling bootstrap, followed by the evidence and epistemic domain model.

3D, VR, temporal reconstruction, scientific datasets, archives, and larger-scale applications remain outside V0.

---

## Longer-term direction

If the V0 epistemic model succeeds, later phases may explore:

- deterministic 3D reconstruction;
- multi-image spatial reconstruction;
- Blender integration;
- temporal world states;
- video reconstruction;
- audio reconstruction;
- archive and historical reconstruction;
- scientific datasets;
- spatial computing and VR;
- large-scale heterogeneous evidence environments.

These remain downstream of the core requirement:

> **A reconstruction must be able to explain itself.**

---

## V0 in one sentence

> **Given five pieces of evidence about one room, APOCRYPHA must construct three competing, internally traceable interpretations, render each interpretation, identify exactly why their elements exist, expose their disagreements, and recompute the affected world when an assumption is removed.**

---

## License

License not yet selected.

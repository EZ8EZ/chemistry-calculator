# Valence Studio

A chemistry-native molecular builder with live 3D rendering, graph-based structure editing, and scientifically honest identity resolution.

Valence Studio treats molecules as **graphs** (atoms = nodes, bonds = edges) — not as element counts. Bond order, formal charge, stereochemistry, aromaticity, and protonation state all matter.

## Quick Start

```bash
npm install
npm run dev     # Start development server at http://localhost:3000
npm test        # Run chemistry engine tests (88 tests)
npm run build   # Production build
```

## Architecture

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── chem/               # Chemistry-specific UI components
│   │   ├── ElementPalette   # Element selection + tool palette
│   │   ├── MoleculeViewer2D # Interactive SVG 2D editor
│   │   ├── MoleculeViewer3D # 3Dmol.js 3D rendering
│   │   ├── IdentityPanel    # Molecular identity & identifiers
│   │   ├── CandidatePanel   # Ambiguity resolution UI
│   │   ├── AtomInspector    # Atom/bond property editor
│   │   ├── ExportPanel      # File format export
│   │   └── ActionHistory    # Undo/redo log
│   ├── layout/             # App layout (Header, MainLayout)
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── chem/               # Core chemistry engine
│   │   ├── types.ts        # Type definitions (Atom, Bond, Molecule, etc.)
│   │   ├── elements.ts     # Element data (CPK colors, valences, masses)
│   │   ├── graph.ts        # Molecular graph engine
│   │   └── operations.ts   # Editing operations (add/remove/modify)
│   ├── candidates/
│   │   └── ambiguity.ts    # Ambiguity detection & candidate management
│   └── ui/
│       └── store.ts        # Zustand state management
└── __tests__/              # Test suites
    ├── chem-graph.test.ts
    ├── chem-operations.test.ts
    └── ambiguity.test.ts
```

## Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + class-variance-authority
- **State**: Zustand
- **3D Rendering**: 3Dmol.js
- **Testing**: Jest + ts-jest

## Chemistry Engine

### Data Model

The molecule is represented as a graph:

- **Atoms**: element, atomic number, isotope, formal charge, radical electrons, explicit H count, aromatic flag, chiral tag, 2D/3D coordinates
- **Bonds**: source/target atom IDs, order (1/1.5/2/3), aromatic flag, stereo (none/up/down/E/Z)

### Algorithms Implemented

| Algorithm | Status |
|---|---|
| Valence checking & enforcement | Fully implemented |
| Implicit hydrogen calculation | Fully implemented |
| Molecular formula (Hill system) | Fully implemented |
| Exact mass / molecular weight | Fully implemented |
| SMILES generation (canonical + isomeric) | Implemented (basic) |
| MOL V2000 file generation | Fully implemented |
| XYZ file generation | Fully implemented |
| Ring detection (DFS-based SSSR) | Implemented |
| Aromaticity perception (Hückel 4n+2) | Implemented |
| Stereocenter detection | Implemented (basic CIP) |
| Fragment detection (BFS) | Fully implemented |
| Symmetry-aware candidate deduplication | Implemented via canonical SMILES |
| Candidate plausibility scoring | Implemented |

### Chemistry Assumptions & Limitations

**Fully supported in v1:**
- Small organic molecules (C, H, N, O, S, P, halogens)
- Formal charges (-3 to +3)
- Standard bond orders (single, double, triple)
- Implicit and explicit hydrogen handling
- Ring systems up to 8-membered
- Basic aromaticity (5-7 membered rings, Hückel rule)
- Stereocenter detection (tetrahedral sp3 carbons)
- E/Z double bond stereochemistry (metadata only)
- Isotope labeling
- Radical electrons (0-2)
- Multiple disconnected fragments

**Partially supported (with warnings):**
- Transition metals (rendered, but coordination chemistry not fully validated)
- Hypervalent main-group atoms (e.g., SF6)
- Complex polycyclic aromatic systems

**Not supported in v1:**
- Full CIP priority determination (simplified detection only)
- IUPAC systematic naming (would need external library)
- InChI/InChIKey generation (requires RDKit backend)
- Conformer generation / 3D coordinate optimization
- Reaction planning
- Polymer/macromolecule editing
- Crystal structures

### Honesty Rules

- **No name hallucination**: Common names shown only from a curated lookup table (~60 molecules). If no match, displays "No confident common-name match."
- **No fake certainty**: Confidence badges indicate resolution status.
- **Ambiguity is surfaced**: When multiple valid structures exist for an edit, candidates are shown with explanations.
- **Unsupported features are labeled**: Transition metals get "partially supported" badges.

## Interaction Model

### Mode A: Guided Atomic Calculator
Click elements to add atoms. The app shows valid attachment sites, previews candidates when ambiguous, and explains what changed.

### Mode B: Expert Structure Editor
Click atoms/bonds to inspect and modify. Full control over charge, isotope, radical, stereochemistry, bond order, and explicit hydrogens.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| V | Select tool |
| A | Add atom tool |
| B | Add bond tool |
| X | Remove tool |
| Q | Charge tool |
| R | Ring closure tool |
| S | Stereo tool |
| C, N, O, F, P | Select element + add tool |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z / Ctrl+Y | Redo |

## UI Design

- Dark mode default, light mode available
- Three-panel layout: left rail (tools), center (2D editor + 3D viewer), right (identity + inspector)
- Collapsible bottom drawer for candidates, export, and history
- Beginner/Expert mode toggle with progressive disclosure

## Export Formats

- SMILES / Isomeric SMILES (copy to clipboard)
- MOL V2000 (download)
- SDF (download)
- XYZ (download)
- PNG screenshot (from 3D viewer canvas)

## Roadmap

### Near-term
- RDKit.js integration for canonical SMILES, InChI, and sanitization
- Server-side RDKit for authoritative validation
- Conformer generation (3D coordinate optimization)
- Full CIP priority for stereocenter assignment
- Drag-to-draw bonds in 2D editor
- Atom drag-and-drop repositioning

### Medium-term
- IUPAC name generation
- PubChem/ChemSpider lookup for identity enrichment
- Ketcher integration for advanced sketch mode
- Tautomer enumeration
- pKa estimation
- Fragment library / template insertion
- Shareable URL molecule encoding

### Long-term
- Reaction editor
- Polymer builder
- Coordination chemistry support
- Quantum chemistry property prediction
- Collaborative editing

## License

MIT

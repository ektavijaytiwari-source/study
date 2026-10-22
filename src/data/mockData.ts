import { Course, StudyNote, Exam, StudySession, StudentProfile } from '../types';

export const initialCourses: Course[] = [
  {
    id: 'course-cs310',
    name: 'Computer Architecture & Systems',
    code: 'CS 310',
    color: 'indigo',
    instructor: 'Dr. Evelyn Vance',
    schedule: 'Mon, Wed 10:00 - 11:30 AM',
    term: 'Fall 2026',
    credits: 4,
  },
  {
    id: 'course-chem222',
    name: 'Organic Chemistry II',
    code: 'CHEM 222',
    color: 'emerald',
    instructor: 'Prof. Marcus Chen',
    schedule: 'Tue, Thu 01:00 - 02:30 PM',
    term: 'Fall 2026',
    credits: 4,
  },
  {
    id: 'course-econ201',
    name: 'Intermediate Microeconomics',
    code: 'ECON 201',
    color: 'amber',
    instructor: 'Dr. Sophia Aris',
    schedule: 'Mon, Wed, Fri 09:00 - 09:50 AM',
    term: 'Fall 2026',
    credits: 3,
  },
  {
    id: 'course-math240',
    name: 'Linear Algebra & Vector Calculus',
    code: 'MATH 240',
    color: 'violet',
    instructor: 'Prof. Alistair Thorne',
    schedule: 'Tue, Thu 10:00 - 11:50 AM',
    term: 'Fall 2026',
    credits: 4,
  },
];

export const initialProfile: StudentProfile = {
  name: 'Alex Rivera',
  major: 'Computer Science & Mathematics',
  university: 'Institute of Science & Technology',
  term: 'Fall 2026',
  dailyGoalMinutes: 120,
  streakDays: 6,
  lastActiveDate: '2026-10-21',
};

export const initialNotes: StudyNote[] = [
  {
    id: 'note-cs-pipeline',
    courseId: 'course-cs310',
    title: '5-Stage RISC Pipeline Hazards & Forwarding Paths',
    unit: 'Unit 3: Instruction-Level Parallelism',
    tags: ['Pipelines', 'Data Hazards', 'Forwarding', 'Branch Prediction'],
    isPinned: true,
    createdAt: '2026-10-14T14:30:00Z',
    updatedAt: '2026-10-18T16:20:00Z',
    content: `## 5-Stage Classic RISC Pipeline Overview

The classic RISC pipeline consists of five stages executed per instruction cycle:
1. **IF (Instruction Fetch)**: Read instruction from instruction cache via Program Counter (PC)
2. **ID (Instruction Decode / Register Read)**: Decode opcode and read operand registers
3. **EX (Execute / ALU Calculation)**: Calculate effective address or arithmetic/logical operation
4. **MEM (Memory Access)**: Read or write data cache for load/store instructions
5. **WB (Write Back)**: Write calculated result back into destination register file

### 1. Structural Hazards
Occur when two instructions simultaneously attempt to access the same hardware resource.
- **Solution**: Separate Instruction and Data caches (Harvard architecture memory sub-system)
- Multi-port register files allowing 2 simultaneous reads and 1 write in the same clock phase.

### 2. Data Hazards (RAW, WAR, WAW)
The most common hazard in standard in-order pipelines is **Read-After-Write (RAW)**.
- **Arithmetic-to-Arithmetic Dependency**:
  - Example: \`ADD R1, R2, R3\` followed immediately by \`SUB R4, R1, R5\`
  - Without forwarding: Requires 2 stall cycles (bubbles).
  - With ALU-to-ALU Forwarding: Result available directly from EX/MEM pipeline register to ALU input MUX. **Zero stall cycles required!**

### 3. Load-Use Data Hazard
When a memory read is followed by an instruction consuming that data:
- \`LW R1, 0(R2)\`
- \`ADD R3, R1, R4\`
- Data is only valid at the end of the **MEM** stage.
- Forwarding alone cannot bridge the gap backwards in time: **1 bubble (stall cycle) is unavoidable** unless code is rescheduled by compiler.

### Key Equations & Performance
- Speedup from Pipelining:
  $$Speedup = \\frac{\\text{Depth of Pipeline} \\times CPI_{\\text{unpipelined}}}{1 + \\text{Pipeline Stalls per Instruction}}$$`,
    flashcards: [
      {
        id: 'fc-cs-1',
        front: 'What are the three main categories of pipeline hazards?',
        back: '1. Structural Hazards (hardware resource conflict)\n2. Data Hazards (data dependency between instructions: RAW, WAR, WAW)\n3. Control Hazards (branches, jumps, and PC redirection)',
        mastery: 'mastered',
        lastReviewed: '2026-10-19T09:00:00Z',
      },
      {
        id: 'fc-cs-2',
        front: 'Why cannot ALU forwarding eliminate the stall in a Load-Use hazard?',
        back: 'Because the loaded memory data is only available at the conclusion of the MEM stage, whereas the dependent instruction requires it at the start of the EX stage in the next cycle. This requires a 1-cycle stall bubble.',
        mastery: 'learning',
        lastReviewed: '2026-10-20T11:00:00Z',
      },
      {
        id: 'fc-cs-3',
        front: 'What is branch delay slot scheduling?',
        back: 'A compiler optimization technique where the instruction immediately following a conditional branch is executed unconditionally, regardless of whether the branch is taken or not.',
        mastery: 'new',
      },
    ],
    attachments: [
      {
        id: 'att-cs-1',
        title: 'Lecture 12 Slides — Pipeline Data Paths.pdf',
        url: 'https://cs310.faculty.edu/slides/lecture-12-pipeline.pdf',
        type: 'slides',
      },
      {
        id: 'att-cs-2',
        title: 'Patterson & Hennessy Chapter 4 Reading',
        url: 'https://library.edu/cs310/ch4-processor',
        type: 'textbook',
      },
    ],
  },
  {
    id: 'note-chem-eas',
    courseId: 'course-chem222',
    title: 'Electrophilic Aromatic Substitution (EAS) & Directing Effects',
    unit: 'Unit 4: Aromatic Compounds',
    tags: ['EAS', 'Arenium Ion', 'Activating Groups', 'Directing Effects'],
    isPinned: true,
    createdAt: '2026-10-12T11:00:00Z',
    updatedAt: '2026-10-19T14:15:00Z',
    content: `## Electrophilic Aromatic Substitution (EAS) Mechanism

The two-step general mechanism:
1. **Attack by the aromatic ring on the electrophile ($E^+$)**:
   - Breaks aromaticity, forming the resonance-stabilized **arenium ion (sigma complex)**.
   - This is the **rate-determining step (RDS)** due to lost aromatic resonance energy ($~36\\text{ kcal/mol}$).
2. **Deprotonation of the sigma complex**:
   - Rapid loss of proton by weak base restores the stable $6\\pi$ aromatic sextet.

### Substituent Effects: Activation & Orientation
Substituents on the benzene ring influence both the **rate** of substitution and the **position** (ortho/para vs meta):

| Substituent Class | Examples | Directing Effect | Activation Status | Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| Strongly Activating | $-OH, -O^-, -NH_2, -NR_2$ | ortho / para | Strongly Activates | Lone pair resonance donation |
| Moderately Activating | $-OCH_3, -NHCOCH_3$ | ortho / para | Activates | Resonance donation with competing carbonyl |
| Weakly Activating | $-CH_3, -R$ (Alkyl) | ortho / para | Activates | Hyperconjugation & inductive donation |
| Weakly Deactivating | $-F, -Cl, -Br, -I$ | ortho / para | Deactivates | Inductive withdrawal dominates rate; lone pair stabilizes arenium |
| Strongly Deactivating | $-NO_2, -CF_3, -CN, -SO_3H$ | meta | Strongly Deactivates | Strong inductive withdrawal and formal positive charge adjacent to ring |

### Halogen Paradox: Ortho/Para Directing yet Deactivating
- **Halogens** are electronegative, pulling electron density through $\\sigma$-bonds (inductive effect $\\rightarrow$ deactivates rate).
- In the ortho/para transition state, the halogen can share a lone pair to form a fourth resonance structure with a complete octet on all carbon atoms. Thus, it directs **ortho/para**!`,
    flashcards: [
      {
        id: 'fc-chem-1',
        front: 'Why are Halogens (-Cl, -Br) ortho/para directors even though they are deactivating?',
        back: 'Their strong electronegativity deactivates the ring inductively (slowing the rate), but in the ortho/para sigma complex, their lone pairs can donate via resonance to produce a crucial octet-complete resonance form.',
        mastery: 'mastered',
        lastReviewed: '2026-10-21T08:30:00Z',
      },
      {
        id: 'fc-chem-2',
        front: 'What is the rate-determining step in EAS?',
        back: 'The initial attack of the aromatic $\\pi$-electron cloud on the electrophile to form the non-aromatic carbocation sigma complex (arenium ion).',
        mastery: 'good' as any,
      },
    ],
    attachments: [
      {
        id: 'att-chem-1',
        title: 'EAS Reaction Mechanism Cheat Sheet.pdf',
        url: 'https://chem222.edu/mechanisms/eas-summary.pdf',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'note-math-eigen',
    courseId: 'course-math240',
    title: 'Eigenvalues, Diagonalization & Spectral Theorem',
    unit: 'Unit 5: Linear Transformations & Orthogonality',
    tags: ['Eigenvalues', 'Diagonalization', 'Spectral Theorem', 'Hermitian'],
    isPinned: false,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-17T09:45:00Z',
    content: `## Eigenvalues and Eigenvectors

For an $n \\times n$ matrix $A$, a non-zero vector $v \\in \\mathbb{R}^n$ is an eigenvector with corresponding eigenvalue $\\lambda$ if:
$$A v = \\lambda v \\iff (A - \\lambda I)v = 0$$

### Finding Eigenvalues:
1. Compute the **Characteristic Polynomial**:
   $$p(\\lambda) = \\det(A - \\lambda I) = 0$$
2. Solve for roots $\\lambda_1, \\lambda_2, \\dots, \\lambda_k$.
3. For each eigenvalue, find the **Eigenspace**:
   $$E_{\\lambda} = \\ker(A - \\lambda I)$$

### Diagonalization Theorem
An $n \\times n$ matrix $A$ is diagonalizable if and only if $A$ has $n$ linearly independent eigenvectors.
Then:
$$A = P D P^{-1}$$
where $D$ is diagonal matrix containing eigenvalues, and $P$'s columns are the corresponding eigenvectors.

### The Real Spectral Theorem
Every real symmetric matrix $A = A^T$ is **orthogonally diagonalizable**:
$$A = Q D Q^T$$
where $Q$ is an orthogonal matrix ($Q^{-1} = Q^T$) consisting of orthonormal eigenvectors, and all eigenvalues of $A$ are guaranteed to be real.`,
    flashcards: [
      {
        id: 'fc-math-1',
        front: 'What condition guarantees that a real matrix is orthogonally diagonalizable?',
        back: 'The matrix must be symmetric (i.e., A = A^T). By the Spectral Theorem, all its eigenvalues are real and eigenvectors corresponding to distinct eigenvalues are mutually orthogonal.',
        mastery: 'mastered',
        lastReviewed: '2026-10-18T15:00:00Z',
      },
      {
        id: 'fc-math-2',
        front: 'How is matrix power A^k computed efficiently using diagonalization?',
        back: 'Compute A^k = P (D^k) P^(-1). Since D is diagonal, D^k simply raises each diagonal eigenvalue entry to the power k.',
        mastery: 'mastered',
        lastReviewed: '2026-10-18T15:10:00Z',
      },
    ],
    attachments: [
      {
        id: 'att-math-1',
        title: 'Gilbert Strang Section 6.1 Notes',
        url: 'https://ocw.mit.edu/courses/math-linear-algebra-spectral',
        type: 'textbook',
      },
    ],
  },
  {
    id: 'note-econ-monopoly',
    courseId: 'course-econ201',
    title: 'Monopoly Profit Maximization & Deadweight Loss',
    unit: 'Unit 3: Market Structures & Pricing',
    tags: ['Monopoly', 'Deadweight Loss', 'Elasticity', 'Price Discrimination'],
    isPinned: false,
    createdAt: '2026-10-08T16:00:00Z',
    updatedAt: '2026-10-15T11:20:00Z',
    content: `## Profit Maximization for a Single-Price Monopolist

A monopoly faces the downward-sloping market demand curve $P(Q)$.
Total Revenue: $TR(Q) = P(Q) \\cdot Q$
Marginal Revenue:
$$MR(Q) = \\frac{d(TR)}{dQ} = P(Q) + Q \\frac{dP}{dQ} = P \\left(1 - \\frac{1}{|\\epsilon_d|}\\right)$$

### Optimal Output Rule
The monopolist maximizes profit by producing where:
$$MR(Q^*) = MC(Q^*)$$
Because $MR < P$ for all $Q > 0$, the price charged $P(Q^*) > MC(Q^*)$.

### Deadweight Loss (DWL) Analysis
- **Consumer Surplus** is transferred partially to producer surplus (monopoly profit).
- The output level $Q^*$ is strictly below the socially efficient output $Q_c$ (where $P = MC$).
- The triangle between demand, MC, and the quantity gap $(Q_c - Q^*)$ represents lost gains from mutually beneficial trade: **Deadweight Loss**.`,
    flashcards: [
      {
        id: 'fc-econ-1',
        front: 'What is the Lerner Index of monopoly power?',
        back: 'L = (P - MC) / P = 1 / |epsilon_d|. It measures the firm markup over marginal cost as the inverse of price elasticity of demand.',
        mastery: 'learning',
        lastReviewed: '2026-10-19T13:00:00Z',
      },
    ],
    attachments: [],
  },
];

export const initialExams: Exam[] = [
  {
    id: 'exam-cs310-midterm',
    courseId: 'course-cs310',
    title: 'Midterm 2: Pipelining, Caches & Virtual Memory',
    examDate: '2026-10-27T10:00:00',
    location: 'Science Hall 104 & ProctorTrack',
    type: 'Midterm',
    weight: 30,
    targetGrade: '92%',
    priority: 'high',
    completed: false,
    syllabusTopics: [
      { id: 'top-1', topic: '5-Stage MIPS/RISC-V Datapath & Control', status: 'mastered', estimatedHours: 4 },
      { id: 'top-2', topic: 'Data & Control Hazards Resolution (Forwarding & Stall Logic)', status: 'mastered', estimatedHours: 3 },
      { id: 'top-3', topic: 'Direct-Mapped & Set-Associative Cache Organization', status: 'reviewing', estimatedHours: 4 },
      { id: 'top-4', topic: 'Cache Miss Classification (Compulsory, Capacity, Conflict)', status: 'reviewing', estimatedHours: 2 },
      { id: 'top-5', topic: 'Virtual Memory, Page Tables & TLB Hit/Miss Flow', status: 'not_started', estimatedHours: 5 },
    ],
    notes: 'Permitted: One double-sided handwritten 8.5x11 reference sheet. Calculator allowed.',
  },
  {
    id: 'exam-chem222-exam3',
    courseId: 'course-chem222',
    title: 'Exam 3: Carbonyl Chemistry & Synthesis Reactions',
    examDate: '2026-11-05T13:30:00',
    location: 'Chemistry Lecture Amphitheater 2',
    type: 'Midterm',
    weight: 25,
    targetGrade: '88%',
    priority: 'high',
    completed: false,
    syllabusTopics: [
      { id: 'top-6', topic: 'Electrophilic Aromatic Substitution (EAS)', status: 'mastered', estimatedHours: 4 },
      { id: 'top-7', topic: 'Nucleophilic Acyl Substitution in Carboxylic Derivatives', status: 'reviewing', estimatedHours: 5 },
      { id: 'top-8', topic: 'Aldol Condensation & Claisen Condensation', status: 'not_started', estimatedHours: 4 },
      { id: 'top-9', topic: 'Retrosynthetic Analysis & Multistep Organic Synthesis', status: 'not_started', estimatedHours: 6 },
    ],
    notes: 'Molecular model kits permitted. No cheat sheet permitted.',
  },
  {
    id: 'exam-math240-quiz',
    courseId: 'course-math240',
    title: 'Vector Calculus Practical Quiz: Stokes & Divergence',
    examDate: '2026-10-24T10:15:00',
    location: 'Math Building Room 302',
    type: 'Quiz',
    weight: 15,
    targetGrade: '95%',
    priority: 'medium',
    completed: false,
    syllabusTopics: [
      { id: 'top-10', topic: "Green's Theorem in the Plane", status: 'mastered', estimatedHours: 2 },
      { id: 'top-11', topic: 'Surface Integrals of Vector Fields', status: 'reviewing', estimatedHours: 3 },
      { id: 'top-12', topic: "Stokes' Theorem & Curl Interpretation", status: 'mastered', estimatedHours: 3 },
      { id: 'top-13', topic: 'Divergence Theorem & Flux Calculations', status: 'reviewing', estimatedHours: 3 },
    ],
    notes: '20 minutes, 3 problems. Focus on orientation of surface normals.',
  },
  {
    id: 'exam-econ201-final',
    courseId: 'course-econ201',
    title: 'Comprehensive Final Examination',
    examDate: '2026-12-14T09:00:00',
    location: 'Main Gymnasium Hall C',
    type: 'Final',
    weight: 40,
    targetGrade: '90%',
    priority: 'normal',
    completed: false,
    syllabusTopics: [
      { id: 'top-14', topic: 'Consumer Theory & Slutsky Decomposition', status: 'mastered', estimatedHours: 3 },
      { id: 'top-15', topic: 'Production Functions, Cost Minimization & Profit Maximization', status: 'reviewing', estimatedHours: 4 },
      { id: 'top-16', topic: 'Monopoly & Oligopoly (Cournot, Bertrand, Stackelberg)', status: 'reviewing', estimatedHours: 5 },
      { id: 'top-17', topic: 'Game Theory & Nash Equilibrium', status: 'not_started', estimatedHours: 4 },
      { id: 'top-18', topic: 'General Equilibrium & Welfare Theorems', status: 'not_started', estimatedHours: 4 },
    ],
    notes: 'Cumulative final covering Chapters 1 through 16.',
  },
];

export const initialSessions: StudySession[] = [
  {
    id: 'sess-1',
    courseId: 'course-cs310',
    examId: 'exam-cs310-midterm',
    topic: 'Pipeline Data Hazards & ALU Forwarding Practice',
    durationMinutes: 50,
    date: '2026-10-21',
    mode: 'pomodoro',
    notes: 'Solved 4 practice hazard exercises from textbook chapter 4.',
    completedAt: '2026-10-21T15:20:00Z',
  },
  {
    id: 'sess-2',
    courseId: 'course-chem222',
    examId: 'exam-chem222-exam3',
    topic: 'Arenium Ion Resonance & EAS Mechanisms',
    durationMinutes: 45,
    date: '2026-10-21',
    mode: 'deep_work',
    notes: 'Reviewed halogen directing effects and Friedel-Crafts limitations.',
    completedAt: '2026-10-21T11:45:00Z',
  },
  {
    id: 'sess-3',
    courseId: 'course-math240',
    examId: 'exam-math240-quiz',
    topic: "Green's Theorem & Line Integrals Calculation",
    durationMinutes: 60,
    date: '2026-10-20',
    mode: 'pomodoro',
    notes: 'Completed 6 line integral problems around closed curves.',
    completedAt: '2026-10-20T17:00:00Z',
  },
  {
    id: 'sess-4',
    courseId: 'course-cs310',
    examId: 'exam-cs310-midterm',
    topic: 'Set-Associative Cache Indexing & Tag Matching',
    durationMinutes: 40,
    date: '2026-10-20',
    mode: 'review',
    notes: 'Drew address breakdown for 32KB 4-way cache with 64B blocks.',
    completedAt: '2026-10-20T14:10:00Z',
  },
  {
    id: 'sess-5',
    courseId: 'course-econ201',
    topic: 'Cournot Duopoly Reaction Curves',
    durationMinutes: 45,
    date: '2026-10-19',
    mode: 'deep_work',
    notes: 'Derived best-response functions and calculated market deadweight loss.',
    completedAt: '2026-10-19T18:00:00Z',
  },
  {
    id: 'sess-6',
    courseId: 'course-chem222',
    topic: 'Carboxylic Acid Derivatives Reactivity Ladder',
    durationMinutes: 50,
    date: '2026-10-18',
    mode: 'pomodoro',
    notes: 'Acyl chlorides > Anhydrides > Esters > Amides.',
    completedAt: '2026-10-18T16:30:00Z',
  },
  {
    id: 'sess-7',
    courseId: 'course-math240',
    topic: 'Spectral Theorem for Real Symmetric Matrices',
    durationMinutes: 55,
    date: '2026-10-17',
    mode: 'review',
    notes: 'Proved orthogonality of eigenvectors corresponding to distinct eigenvalues.',
    completedAt: '2026-10-17T11:00:00Z',
  },
  {
    id: 'sess-8',
    courseId: 'course-cs310',
    topic: 'MIPS Instruction Encoding & Register Specifiers',
    durationMinutes: 45,
    date: '2026-10-16',
    mode: 'manual',
    notes: 'R-format, I-format, J-format field bitwidths.',
    completedAt: '2026-10-16T19:30:00Z',
  },
];

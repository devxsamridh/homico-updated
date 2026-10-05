export type ProjectStage =
  | "submitted"
  | "planning"
  | "foundation"
  | "structure"
  | "finishing"
  | "handover";

export const STAGES: { key: ProjectStage; label: string; defaultProgress: number }[] = [
  { key: "submitted", label: "Submitted", defaultProgress: 5 },
  { key: "planning", label: "Planning", defaultProgress: 20 },
  { key: "foundation", label: "Foundation", defaultProgress: 40 },
  { key: "structure", label: "Structure", defaultProgress: 60 },
  { key: "finishing", label: "Finishing", defaultProgress: 85 },
  { key: "handover", label: "Handover", defaultProgress: 100 },
];

export const STAGE_LABEL: Record<ProjectStage, string> = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
) as Record<ProjectStage, string>;

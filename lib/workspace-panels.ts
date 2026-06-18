import type { PanelVisibility } from "@/components/ui/panel-section-controls";

export type WorkspacePanelSide = "left" | "right";

export type WorkspacePanelState = Record<WorkspacePanelSide, PanelVisibility>;

const STORAGE_KEY = "mr-software.workspace-panels";

export const DEFAULT_WORKSPACE_PANELS: WorkspacePanelState = {
  left: "expanded",
  right: "expanded",
};

export function loadWorkspacePanels(): WorkspacePanelState {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_PANELS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKSPACE_PANELS;
    const parsed = JSON.parse(raw) as Partial<WorkspacePanelState> & { center?: PanelVisibility };
    return {
      left: parsed.left ?? "expanded",
      right: parsed.right ?? "expanded",
    };
  } catch {
    return DEFAULT_WORKSPACE_PANELS;
  }
}

export function saveWorkspacePanels(state: WorkspacePanelState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

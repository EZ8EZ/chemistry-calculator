"use client";

import React from "react";
import { useValenceStore } from "@/lib/ui/store";
import { cn } from "@/components/ui/button";

export function ActionHistory() {
  const { actionLog, undoStack, redoStack, undo, redo } = useValenceStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          History
        </h3>
        <div className="flex gap-1">
          <button
            className={cn(
              "h-6 w-6 rounded text-xs flex items-center justify-center transition-colors",
              undoStack.length > 0
                ? "hover:bg-accent text-foreground"
                : "text-muted-foreground/30 cursor-not-allowed"
            )}
            onClick={undo}
            disabled={undoStack.length === 0}
            title="Undo (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            className={cn(
              "h-6 w-6 rounded text-xs flex items-center justify-center transition-colors",
              redoStack.length > 0
                ? "hover:bg-accent text-foreground"
                : "text-muted-foreground/30 cursor-not-allowed"
            )}
            onClick={redo}
            disabled={redoStack.length === 0}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↪
          </button>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {actionLog.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 py-2">
            No actions yet
          </p>
        ) : (
          [...actionLog].reverse().map((action, i) => (
            <div
              key={action.id}
              className={cn(
                "px-2 py-1 rounded text-[11px] transition-colors",
                i === 0 ? "bg-accent/50" : "hover:bg-accent/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{action.description}</span>
                <span className="text-[9px] text-muted-foreground ml-2 whitespace-nowrap">
                  {formatTime(action.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 5000) return "now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

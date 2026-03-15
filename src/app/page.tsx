"use client";

import { HeroSection } from "@/components/research/HeroSection";
import { MoleculeGallery } from "@/components/research/MoleculeGallery";
import { MechanismVisualizer } from "@/components/research/MechanismVisualizer";
import { ReactionScope } from "@/components/research/ReactionScope";
import { PublicationTimeline } from "@/components/research/PublicationTimeline";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground tracking-tight">
              Zhang Lab
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Metalloradical Catalysis
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: "Molecules", href: "#molecules" },
              { label: "Mechanisms", href: "#mechanism" },
              { label: "Reactions", href: "#reactions" },
              { label: "Publications", href: "#publications" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-14">
        <HeroSection />
        <MoleculeGallery />
        <MechanismVisualizer />
        <ReactionScope />
        <PublicationTimeline />

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Research visualization of work by <strong>Prof. X. Peter Zhang</strong> and coworkers at Boston College.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Structures are representative scaffolds for educational purposes.
              For authoritative data, consult the original publications via the linked DOIs.
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground/40">
              <a
                href="https://www.bc.edu/bc-web/schools/morrissey/departments/chemistry/people/faculty-directory/peter-zhang.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Faculty Page
              </a>
              <a
                href="https://scholar.google.com/citations?user=nl8UNRQAAAAJ"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Google Scholar
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

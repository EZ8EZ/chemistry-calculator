"use client";

import { HeroSection } from "@/components/research/HeroSection";
import { MoleculeGallery } from "@/components/research/MoleculeGallery";
import { MechanismVisualizer } from "@/components/research/MechanismVisualizer";
import { ReactionScope } from "@/components/research/ReactionScope";
import { PublicationTimeline } from "@/components/research/PublicationTimeline";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">
              Zhang Lab
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline font-medium">
              Metalloradical Catalysis
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {[
              { label: "Molecules", href: "#molecules" },
              { label: "Mechanisms", href: "#mechanism" },
              { label: "Reactions", href: "#reactions" },
              { label: "Publications", href: "#publications" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 font-medium"
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
        <footer className="py-16 px-6 border-t border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <p className="text-sm text-gray-500">
              Research visualization of work by{" "}
              <strong className="text-gray-700">Prof. X. Peter Zhang</strong> and coworkers at Boston College.
            </p>
            <p className="text-xs text-gray-400">
              Structures are representative scaffolds for educational purposes.
              For authoritative data, consult the original publications via the linked DOIs.
            </p>
            <div className="flex justify-center gap-6 text-xs font-medium">
              <a
                href="https://www.bc.edu/bc-web/schools/morrissey/departments/chemistry/people/faculty-directory/peter-zhang.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                Faculty Page
              </a>
              <a
                href="https://scholar.google.com/citations?user=nl8UNRQAAAAJ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
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

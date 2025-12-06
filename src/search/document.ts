import type { DocSection } from '../types/models.js';
import type { SearchEngine } from './engine.js';
import { logger } from '../utils/logger.js';

export class DocumentTree {
  private sections: Map<string, DocSection>;

  constructor() {
    this.sections = new Map();
  }

  buildFromEngine(engine: SearchEngine): void {
    const documents = engine.getAllDocuments();
    const sectionMap = new Map<string, Set<string>>();

    // Group documents by section
    for (const doc of documents) {
      if (!sectionMap.has(doc.section)) {
        sectionMap.set(doc.section, new Set());
      }
      sectionMap.get(doc.section)!.add(doc.path);
    }

    // Build section tree
    for (const [section, paths] of sectionMap) {
      // Determine subsections (folders under section)
      const subsections = new Set<string>();
      for (const path of paths) {
        const parts = path.split('/');
        if (parts.length > 2) {
          // Has subsection (e.g., ci/pipelines/...)
          subsections.add(parts[1]);
        }
      }

      this.sections.set(section, {
        name: section,
        path: section,
        pageCount: paths.size,
        subsections: subsections.size > 0 ? Array.from(subsections).sort() : undefined,
      });
    }

    logger.info(`Built document tree: ${this.sections.size} sections`);
  }

  getAllSections(): DocSection[] {
    return Array.from(this.sections.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getSectionCount(): number {
    return this.sections.size;
  }

  getSection(name: string): DocSection | undefined {
    return this.sections.get(name);
  }
}

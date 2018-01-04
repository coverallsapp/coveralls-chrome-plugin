// @flow

export interface IOverlay {
  sha: ?string,
  filesAndPathsForLoading(): ?Object,
  applyFileCoverage(filepath: string, coverage: Array<number>): void,
  applyPathCoverage(path: string, coverage: Object): void,
  resetOverlay(): void,
}

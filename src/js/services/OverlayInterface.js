// @flow

export interface IOverlay {
  sha: string,
  filesAndPathsForLoading(): Object,
  applyFileCoverage(filepath: string, coverage: Array<number>): void,
  applyPathCoverage(filepath: string, coverage: Object): void,
}

// @flow

export interface IOverlay {
  sha: ?string,
  checkSha(): boolean,
  filesAndPathsForLoading(): ?Object,
  loadedFileCoverage(filepath: string, coverage: Array<number>): void,
  loadedPathCoverage(path: string, coverage: Object): void,
  resetOverlay(): void,
}

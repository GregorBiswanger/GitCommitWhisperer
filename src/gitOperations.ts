import { GitExtension, Repository } from './git';
import * as vscode from 'vscode';

export async function getGitRepository() {
  const gitExtension = findGitExtension();

  if (gitExtensionAvailable(gitExtension)) {
    return findFirstRepository(gitExtension);
  }
}

function findGitExtension() {
  const git = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

  if (!git) {
    vscode.window.showErrorMessage('Git extension not found');
  }

  return git;
}

function gitExtensionAvailable(gitExtension: GitExtension | undefined) {
  return gitExtension !== undefined;
}

function findFirstRepository(git: GitExtension | undefined) {
  const gitRepository = git?.getAPI(1).repositories[0];

  if (!gitRepository) {
    vscode.window.showErrorMessage('Git repository not found');
  }

  return gitRepository;
}

export async function getGitDiff(gitRepository: Repository | undefined) {
  await gitRepository?.status();
  const hasStagedChanges = await hasStagedChangesInRepository(gitRepository);

  return getDiffBasedOnStagedStatus(gitRepository, hasStagedChanges);
}

async function hasStagedChangesInRepository(gitRepository: Repository | undefined): Promise<boolean> {
  const stagedChanges = await gitRepository?.diff(true);
  return !!stagedChanges;
}

async function getDiffBasedOnStagedStatus(gitRepository: Repository | undefined,  hasStagedChanges: boolean) {
  if (hasStagedChanges) {
    return await gitRepository?.diff(true);
  }

  return await gitRepository?.diff(false);
}


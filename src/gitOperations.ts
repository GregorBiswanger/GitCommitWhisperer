import { GitExtension, Repository } from './git';
import * as vscode from 'vscode';

export async function getGitRepository() {
  const gitExtension = getGitExtension();

  if (isGitExtensionAvailable(gitExtension)) {
    return firstRepository(gitExtension);
  }
}

function getGitExtension() {
  const git = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

  if (!git) {
    vscode.window.showErrorMessage('Git extension not found');
  }

  return git;
}

function isGitExtensionAvailable(gitExtension: GitExtension | undefined) {
  return gitExtension !== undefined;
}

function firstRepository(git: GitExtension | undefined) {
  const gitRepository = git?.getAPI(1).repositories[0];

  if (!gitRepository) {
    vscode.window.showErrorMessage('Git repository not found');
  }

  return gitRepository;
}

export async function getGitDiff(gitRepository: Repository | undefined) {
  await gitRepository?.status();

  const stagedChanges = await gitRepository?.diff(true);

  if (stagedChanges) { 
    return stagedChanges;
  }

  return await gitRepository?.diff(false);
}
import * as vscode from 'vscode';
import { getGitRepository, getGitDiff } from './gitOperations';
import { isOpenIdKeyAvailableInSettings, promptAndSaveOpenIdKey, selectCommitType } from './configurationManager';
import { generateCommitMessage } from './openaiUtils';
import { Repository } from './git.d';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.generateCommitMessage', async () => {
    if (await isOpenIdKeyAvailableInSettings()) {
      const gitRepository = await getGitRepository();
      const gitDiff = await getGitDiff(gitRepository);

      if (gitDiff) {
        const commitType = await selectCommitType();
        const message = await generateCommitMessage(gitDiff, commitType);
        await openSourceControlView();
        writeCommitMessageToInputBox(gitRepository, message);
      } else {
        vscode.window.showErrorMessage(
          'No changes detected. Unable to generate a commit message without any modifications.'
        );
      }
    } else {
      if (await promptAndSaveOpenIdKey()) {
        vscode.commands.executeCommand('extension.generateCommitMessage');
      }
    }
  });

  context.subscriptions.push(disposable);
}

async function openSourceControlView() {
  await vscode.commands.executeCommand('workbench.view.scm');
}

function writeCommitMessageToInputBox(gitRepository: Repository | undefined, message: string | undefined) {
  if (gitRepository) {
    gitRepository.inputBox.value = message || 'No commit message generated';
  }
}

export function deactivate() {}

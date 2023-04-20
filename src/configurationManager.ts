import * as vscode from 'vscode';

const CONFIGURATION_NAME = 'generateCommitMessage';
const OPENAPI_KEY_NAME = 'openaiApiKey';
const COMMIT_TYPES = 'commitTypes';

export function isOpenIdKeyAvailableInSettings() {
  const openaiApiKey = vscode.workspace.getConfiguration(CONFIGURATION_NAME).get(OPENAPI_KEY_NAME);
  return !!openaiApiKey;
}

export async function promptAndSaveOpenIdKey() {
  const input = await vscode.window.showInputBox({
    prompt: 'Please enter your OpenID key:',
    ignoreFocusOut: true,
  });

  if (input === undefined || input.trim() === '') {
    vscode.window.showErrorMessage('No OpenID key was entered. The extension will not run.');
    return false;
  } else {
    await vscode.workspace
      .getConfiguration(CONFIGURATION_NAME)
      .update(OPENAPI_KEY_NAME, input, vscode.ConfigurationTarget.Global);
  }

  return true;
}

export async function selectCommitType() {
  const commitTypes = vscode.workspace.getConfiguration(CONFIGURATION_NAME).get<string[]>(COMMIT_TYPES) || [];

  if (commitTypes.length === 0) {
    return '';
  }

  const selectedType = await vscode.window.showQuickPick(['Auto Detection', ...commitTypes], {
    placeHolder: 'Select a commit type',
  });

  return generateCommitTypeMessage(selectedType);
}

function generateCommitTypeMessage(selectedType: string | undefined) {
  if (selectedType === 'Auto Detection' || !selectedType) {
    return '';
  }

  return `Use the following commit type for this message: ${selectedType}.`;
}
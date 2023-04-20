import * as vscode from 'vscode';

const CONFIGURATION_NAME = 'generateCommitMessage';
const OPENAPI_KEY_NAME = 'openaiApiKey';
const COMMIT_TYPES = 'commitTypes';
const USE_EMOJI_FOR_COMMIT_TYPE = 'useEmojiForCommitType';
const COMMIT_MESSAGE_PROMPT = 'commitMessagePrompt';

export function isOpenIdKeyAvailableInSettings() {
  const openaiApiKey = vscode.workspace.getConfiguration(CONFIGURATION_NAME).get<string>(OPENAPI_KEY_NAME);
  return !!openaiApiKey;
}

export function getOpenIdKey() { 
  return vscode.workspace.getConfiguration(CONFIGURATION_NAME).get<string>(OPENAPI_KEY_NAME);
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
  if (selectedType === 'Auto Detection' || selectedType === undefined) {
    return '';
  }

  return `Use the following commit type: ${selectedType}.`;
}

export function getCustomPrompt() {
  return vscode.workspace.getConfiguration(CONFIGURATION_NAME).get<string>(COMMIT_MESSAGE_PROMPT) || '';
}

export function isEmojiForCommitTypeEnabled(): boolean {
  return vscode.workspace.getConfiguration(CONFIGURATION_NAME).get<boolean>(USE_EMOJI_FOR_COMMIT_TYPE) || false;
}

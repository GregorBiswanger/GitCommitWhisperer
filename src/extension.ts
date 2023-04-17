import * as vscode from 'vscode';
import { OpenAIApi, Configuration } from 'openai';
import { GitExtension, Repository } from './git.d';
const CONFIGURATION_NAME = 'generateCommitMessage';
const OPENAPI_KEY_NAME = 'openaiApiKey';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.generateCommitMessage', async () => {
    if (await isOpenIdKeyAvailableInSettings()) {
      const gitRepository = getGitRepository();
      const gitDiff = await getGitDiff(gitRepository);

      if (isDiffAvailable(gitDiff)) { 
        const message = await generateCommitMessage(gitDiff);
        await openSourceControlView();
        writeCommitMessageToInputBox(gitRepository, message);
      } else {
        vscode.window.showErrorMessage('No changes detected. Unable to generate a commit message without any modifications.');
      }
    } else {
      if (await promptAndSaveOpenIdKey()) {
        vscode.commands.executeCommand('extension.generateCommitMessage');
      }
    }
  });

  context.subscriptions.push(disposable);
}

async function isOpenIdKeyAvailableInSettings() {
  const openaiApiKey = vscode.workspace.getConfiguration(CONFIGURATION_NAME).get(OPENAPI_KEY_NAME);
  return !!openaiApiKey;
}

function getGitRepository() {
  const git = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

  if (!git) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  const gitRepository = git.getAPI(1).repositories[0];

  if (!gitRepository) {
    vscode.window.showErrorMessage('Git repository not found');
    return;
  }

  return gitRepository;
}

async function getGitDiff(gitRepository: Repository | undefined) {
  await gitRepository?.status();
  let hasStagedChanges = false;

  const stagedChanges = await gitRepository?.diff(true);
  if (stagedChanges) {
    hasStagedChanges = true;
  }

  return hasStagedChanges ? stagedChanges : await gitRepository?.diff(false);
}

function isDiffAvailable(gitDiff: string | undefined) {
  return !!gitDiff;
}

async function generateCommitMessage(gitDiff: string | undefined) {
  const configuration = new Configuration({
    apiKey: vscode.workspace.getConfiguration(CONFIGURATION_NAME).get(OPENAPI_KEY_NAME),
  });

  const openai = new OpenAIApi(configuration);

  const prompt = `I want you to act as a commit message generator. I will provide you with information about the git diff, and I would like you to generate an appropriate commit message using the conventional commit format. Do not write any explanations or other words, just reply with the commit message with maximal 50 character.`;
  const customPrompt = getCustomPrompt();
  const openAIResponse = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt + ' ' + customPrompt + '\n\nTask information:' + gitDiff,
    temperature: 0.6,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return openAIResponse.data.choices[0].text?.trim();
}

function getCustomPrompt() {
  const customPrompt = vscode.workspace.getConfiguration('generateCommitMessage').get('commitMessagePrompt');
  return customPrompt || '';
}

async function openSourceControlView() {
  await vscode.commands.executeCommand('workbench.view.scm');
}

function writeCommitMessageToInputBox(gitRepository: Repository | undefined, message: string | undefined) {
  if (gitRepository) {
    gitRepository.inputBox.value = message || 'No commit message generated';
  }
}

async function promptAndSaveOpenIdKey() {
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

export function deactivate() {}

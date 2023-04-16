import * as vscode from 'vscode';
import { OpenAIApi, Configuration } from 'openai';
import { GitExtension, Repository } from './git.d';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.generateCommitMessage', async () => {
    const gitRepository = getGitRepository();
    const gitDiff = await gitRepository?.diff(true);
    const message = await generateCommitMessage(gitDiff);
    await openSourceControlView();
    writeCommitMessageToInputBox(gitRepository, message);
  });

  context.subscriptions.push(disposable);
}

function getGitRepository() {
  const git = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

  if (!git) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  return git.getAPI(1).repositories[0];
}

async function generateCommitMessage(gitDiff: string | undefined) {
  const configuration = new Configuration({
    apiKey: vscode.workspace.getConfiguration('generateCommitMessage').get('openaiApiKey'),
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
  await vscode.commands.executeCommand('git.stageAll');
  await vscode.commands.executeCommand('workbench.view.scm');
}

function writeCommitMessageToInputBox(gitRepository: Repository | undefined, message: string | undefined) {
  if (gitRepository) {
    gitRepository.inputBox.value = message || 'No commit message generated';
  }
}

export function deactivate() {}
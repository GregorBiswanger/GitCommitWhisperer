import * as vscode from 'vscode';
import { OpenAIApi, Configuration } from 'openai';
import { GitExtension } from './git.d';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.generateCommitMessage', async () => {
		const git = getGitExtension();

		if (!git) {
			vscode.window.showErrorMessage('Git extension not found');
			return;
		}

		const gitAPI = git.getAPI(1);

		const selectedRepo = gitAPI.repositories[0];
		const diff = await selectedRepo.diff(true);
		
		const configuration = new Configuration({
			apiKey: vscode.workspace.getConfiguration('generateCommitMessage').get('openaiApiKey')
		});
		const openai = new OpenAIApi(configuration);

		const prompt = `I want you to act as a commit message generator. I will provide you with information about the git diff, and I would like you to generate an appropriate commit message using the conventional commit format. Do not write any explanations or other words, just reply with the commit message with maximal 50 character.`;
		const customPrompt = vscode.workspace.getConfiguration('generateCommitMessage').get('commitMessagePrompt');
		const openAIResponse = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: prompt + ' ' + customPrompt + '\n\nTask information:' + diff,
			temperature: 0.7,
			max_tokens: 256,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});

		await vscode.commands.executeCommand('git.stageAll');
		await vscode.commands.executeCommand('workbench.view.scm');

		selectedRepo.inputBox.value = openAIResponse.data.choices[0].text?.trim() || 'No commit message generated';
    });

    context.subscriptions.push(disposable);
}

function getGitExtension() {
    const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git');
    return vscodeGit?.exports;
}

export function deactivate() {}

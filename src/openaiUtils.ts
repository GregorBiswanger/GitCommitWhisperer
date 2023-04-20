import * as vscode from 'vscode';
import { OpenAIApi, Configuration } from 'openai';

const CONFIGURATION_NAME = 'generateCommitMessage';
const OPENAPI_KEY_NAME = 'openaiApiKey';

export async function generateCommitMessage(gitDiff: string | undefined, commitType: string) {
  const configuration = new Configuration({
    apiKey: vscode.workspace.getConfiguration(CONFIGURATION_NAME).get(OPENAPI_KEY_NAME),
  });

  const openai = new OpenAIApi(configuration);

  const prompt = `I want you to act as a commit message generator. I will provide you with information about the git diff, and I would like you to generate an appropriate commit message using the conventional commit format. Do not write any explanations or other words, just reply with the commit message with maximal 50 character.`;
  const customPrompt = getCustomPrompt();
  const openAIResponse = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${prompt} ${commitType} ${customPrompt}\n\n###\n\n${gitDiff}`,
    temperature: 0.6,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return removeBackticks(openAIResponse.data.choices[0].text?.trim());
}

function getCustomPrompt() {
  const customPrompt = vscode.workspace.getConfiguration('generateCommitMessage').get('commitMessagePrompt');
  return customPrompt || '';
}

function removeBackticks(message: string = '') {
  return message.replace(/^`|`$/g, '');
}
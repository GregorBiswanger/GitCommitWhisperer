import { OpenAIApi, Configuration } from 'openai';
import { getCustomPrompt, getOpenIdKey, isEmojiForCommitTypeEnabled } from './configurationManager';

export async function generateCommitMessage(gitDiff: string | undefined, commitType: string) {
  const configuration = new Configuration({
    apiKey: getOpenIdKey(),
  });

  const openai = new OpenAIApi(configuration);

  const prompt = `I want you to act as a commit message generator. I will provide you with information about the git diff, and I would like you to generate an appropriate commit message using the conventional commit format. Do not write any explanations or other words, just reply with the commit message with maximal 50 character.`;
  const customPrompt = getCustomPrompt();
  const emojiInstruction = getEmojiInstruction();
  const openAIResponse = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${prompt} ${commitType} ${emojiInstruction} ${customPrompt}\n\n###\n\n${gitDiff}`,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return removeBackticks(openAIResponse.data.choices[0].text?.trim());
}

export function getEmojiInstruction(): string {
  if (isEmojiForCommitTypeEnabled()) {
    return 'For the commit type, just use an emoji without writing the commit type name in the message, separated by a space without a colon. The message should start with capital letters.';
  }

  return '';
}

function removeBackticks(message: string = '') {
  return message.replace(/^`|`$/g, '');
}

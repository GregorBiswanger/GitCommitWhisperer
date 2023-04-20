# Git Commit Whisperer

**Git Commit Whisperer** is a Visual Studio Code extension that helps you generate git commit messages using OpenAI's GPT-3 (ChatGPT).

**WARNING** This extension transmits your git diff to OpenAI-API. Using this extension on confidential repositories is not advised, as it could potentially breach your NDA.

## Features

- Automatically generate git commit messages based on the diff of your changes
- Customize commit types using emojis
- Configure custom prompts for OpenAI's GPT-3
- Quick selection of commit types

## Requirements

- An OpenAI API key is required to use this extension

## Installation

Install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=GregorBiswanger.git-commit-whisperer).

## Usage

1. Make sure you have a valid OpenAI API key, which can be obtained [here](https://platform.openai.com/).
2. Configure the extension with your OpenAI API key:
   - Either enter it directly in the settings (`generateCommitMessage.openaiApiKey`)
   - Or, the extension will prompt you to enter your API key the first time you run the command
3. Execute the `Generate Commit Message` command from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
4. If there are staged changes, select a commit type (or choose "Auto Detection") and let the extension generate a commit message for you.
5. The generated commit message will be placed in the Source Control input box.

## Configuration

You can customize the behavior of the Git Commit Whisperer by modifying the following settings:

```json
{
  "generateCommitMessage.openaiApiKey": "your-openai-api-key",
  "generateCommitMessage.commitTypes": ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
  "generateCommitMessage.useEmojiForCommitType": false,
  "generateCommitMessage.commitMessagePrompt": "your custom prompt"
}
```

## Known Issues

- The extension might not work properly if the Git diff is very large or if there are too many changes.
- The commit message length might exceed the recommended 50 characters in some cases.

## Contributing

If you have any suggestions or find any bugs, please open an issue on the [GitHub repository](https://github.com/GregorBiswanger/git-commit-whisperer).

<!-- ## Release Notes

For the release notes, please refer to the [CHANGELOG](https://github.com/GregorBiswanger/git-commit-whisperer/blob/main/CHANGELOG.md). -->

## License

This extension is licensed under the [MIT License](https://github.com/GregorBiswanger/git-commit-whisperer/blob/main/LICENSE).
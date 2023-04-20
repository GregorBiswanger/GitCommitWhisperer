# Git Commit Message Generator Extension

This VSCode extension uses OpenAI's API to automatically generate git commit messages based on the git diff. It follows Clean Code and SOLID principles and keeps the cyclomatic complexity below 5.

## Classes and Modules

### `gitOperations.ts`

This module contains functions for interacting with Git repositories, such as getting the git repository and retrieving git diffs.

### `configurationManager.ts`

This module contains utility functions related to extension settings and configuration, such as checking for the availability of an OpenID key, prompting the user to save their OpenID key, and selecting a commit type.

### `openaiUtils.ts`

This module contains utility functions related to the OpenAI API, such as generating commit messages using the OpenAI API.

### `extension.ts`

This is the main entry point of the extension. It contains the `activate` and `deactivate` functions, which are responsible for initializing the extension and cleaning up resources when the extension is deactivated, respectively. The `activate` function imports the necessary functions from `gitOperations`, `configurationManager`, and `openaiUtils` and registers the `extension.generateCommitMessage` command.

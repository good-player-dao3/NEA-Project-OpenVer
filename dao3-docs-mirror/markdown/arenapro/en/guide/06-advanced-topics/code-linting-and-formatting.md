---
title: "Tutorial: Configure Your \"Code Butler\" and Say Goodbye to Messy Code"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/code-linting-and-formatting.html"
---

# Tutorial: Configure Your "Code Butler" and Say Goodbye to Messy Code

## A War Sparked by "Code Style"

Imagine this scenario:

You join a new project with three team members:

- **John**, who prefers using the`Tab`key for code indentation.
- **Doe**, who firmly believes that a 2-space indent is the universal truth.
- **You**, who are accustomed to adding a semicolon`;`at the end of each line of code.

The result is that the same file looks one way when you open it today, and another way after Doe commits his changes tomorrow. The code jumps back and forth between`Tab`and spaces, filling the history with unnecessary file changes, making Code Review a disaster.

Wouldn't it be great if there was a "code butler" that could**automatically unify everyone's code into the same style**upon saving and committing?

This "code butler" is a modern front-end workflow composed of**Prettier (formatter) + ESLint (linter) + Husky (automator)**. The ArenaPro boilerplate has all of this built-in for you. You just need to understand it and adjust it as needed.

## Step 1: Meet Your Two Core "Servants"

Your "code butler" is mainly composed of two core "servants":

### Servant One: Prettier (Chief Stylist)

- **Responsibility**: Solely responsible for the**appearance**of the code. For example, should single or double quotes be used? How many spaces for indentation? At what length should a line of code automatically wrap?
- **Characteristic**: It's very "opinionated." It doesn't care if your code logic is correct, only if it looks good.
- **Configuration File**:`.prettierrc`

### Servant Two: ESLint (Quality Director)

- **Responsibility**: Responsible for the**quality and standards**of the code. For instance, have you defined a variable but never used it? Have you written some low-level errors that could lead to bugs?
- **Characteristic**: It's like a rigorous teacher, constantly checking your code for "bad smells."
- **Configuration File**:`eslint.config.mjs`

In the ArenaPro project, we have already made these two "servants" cooperate:**When ESLint checks code quality, it will also adopt Prettier's appearance standards**. You don't have to worry about conflicts between them.

## Step 2: Configure Your "Servants" (VS Code Edition)

To have them serve you as you write code, we highly recommend installing two extensions in VS Code:

1. **ESLint Extension**:[Click to install](vscode:extension/dbaeumer.vscode-eslint)
2. **Prettier - Code formatter Extension**:[Click to install](vscode:extension/esbenp.prettier-vscode)

After installation, please open your VS Code settings (`Ctrl + ,`or`Cmd + ,`) and ensure the following configurations are enabled. This will make the "butler" automatically start working every time you press`Ctrl + S`to save a file.

json

```
// .vscode/settings.json
{
  // 1. Automatically format code on save
  "editor.formatOnSave": true,

  // 2. Specify Prettier as the default formatter
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // 3. Also have ESLint automatically fix what it can on save
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

Once configured, when you save a messily formatted file, the code will instantly become neat and beautiful, and potential low-level errors will be automatically fixed.

## Step 3: Hire a "Guard" (Husky)

Now, your local coding experience is very comfortable. But how do you ensure that the "less-disciplined" members of the team (like Doe, who hasn't installed the VS Code extensions) must also adhere to the standards?

This is where we need to hire a "guard" —**Husky**.

- **Responsibility**: Stands guard at the "main gate" of the code repository. Whenever someone tries to`git commit`, it intercepts the code and hands it over to the "servants" for inspection.
- **Rule**: Only code that passes Prettier's format check and ESLint's quality check is allowed to be committed. Non-compliant code is rejected!

This process is fully automatic. As long as the project is configured, no team member, regardless of their editor, can commit non-standard code to the repository. This fundamentally guarantees the code quality of the entire project.

### How to Check if the "Guard" is on Duty?

This "guard system" is configured by the`.husky/`folder and the`.lintstagedrc`file. The ArenaPro project has this configured for you by default.

If you want to test it, you can intentionally write some code that doesn't conform to ESLint rules in a file (like`let a;`for an unused variable) and then try to`git commit`. You will find that the commit is intercepted by Husky, and you are notified of the issues in your code.

> **Initialization Tip**If you are pulling the project for the first time, you might find that Husky isn't working. Please run the`npm run prepare`command once in the project root to activate it.

## Summary

With this "code butler" system, your team achieves:

- **Unified Style**: Everyone's code format is automatically unified by Prettier.
- **Quality Assurance**: All code is checked by ESLint, avoiding low-level errors.
- **Process Automation**: All checks are automatically triggered by Husky upon committing code, requiring no manual supervision.

This workflow will greatly enhance your development experience and your team's collaboration efficiency.

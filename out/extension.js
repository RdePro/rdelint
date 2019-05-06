"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const lint_1 = require("./lint");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let linter = new lint_1.default();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('javascript', linter);
    vscode.languages.registerCodeActionsProvider('javascriptreact', linter);
    vscode.languages.registerCodeActionsProvider('typescript', linter);
    vscode.languages.registerCodeActionsProvider('typescriptreact', linter);
    vscode.languages.registerCodeActionsProvider('vue', linter);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
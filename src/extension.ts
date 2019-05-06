// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import RdeLintProvider from './lint';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let linter = new RdeLintProvider();
	linter.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('javascript', linter);
	vscode.languages.registerCodeActionsProvider('javascriptreact', linter);
	vscode.languages.registerCodeActionsProvider('typescript', linter);
	vscode.languages.registerCodeActionsProvider('typescriptreact', linter);
	vscode.languages.registerCodeActionsProvider('vue', linter);
}

// this method is called when your extension is deactivated
export function deactivate() {}

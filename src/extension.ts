// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from 'util';
import RdeLintProvider from './lint';

// @ts-ignore
const asyncExec = util.promisify(cp.exec);
const checkEnv = async() => {
	try {
		await asyncExec('docker -v & docker-compose -v & docker info & rde -v');
		return true;
	} catch (e) {
		return false;
	}
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	if (!await checkEnv()) {
		return;
	}

	let linter = new RdeLintProvider();
	linter.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('javascript', linter);
	vscode.languages.registerCodeActionsProvider('javascriptreact', linter);
	vscode.languages.registerCodeActionsProvider('typescript', linter);
	vscode.languages.registerCodeActionsProvider('typescriptreact', linter);
	vscode.languages.registerCodeActionsProvider('vue', linter);
}

// this method is called when your extension is deactivated
export function deactivate() {

}

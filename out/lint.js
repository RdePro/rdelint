"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const util = require("util");
const path = require("path");
// @ts-ignore
const asyncExec = util.promisify(cp.exec);
class RdeLintProvider {
    activate(subscriptions) {
        this.command = vscode.commands.registerCommand(RdeLintProvider.commandId, this.runCodeAction, this);
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        vscode.workspace.onDidOpenTextDocument(this.doLint, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.doLint, this, subscriptions);
        vscode.workspace.textDocuments.forEach(this.doLint, this);
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.command.dispose();
    }
    doLint(textDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'].includes(textDocument.languageId)) {
                return;
            }
            let decoded = '';
            let diagnostics = [];
            const { rootPath = '' } = vscode.workspace;
            const filePath = path.relative(rootPath, textDocument.fileName);
            let childProcess = cp.spawn('rde', ['lint', '-e', `--format json ${filePath}`], {
                cwd: rootPath,
            });
            if (childProcess.pid) {
                childProcess.stdout.on('data', (data) => {
                    decoded += data;
                });
                childProcess.stdout.on('end', () => {
                    decoded = decoded.toString();
                    const jsonPattern = /^\[\{"filePath.*"\}\]$/gim;
                    const matches = decoded.match(jsonPattern);
                    if (matches && matches.length) {
                        const result = JSON.parse(matches[0]);
                        const fileResult = result[0];
                        fileResult.messages.forEach((item) => {
                            let severity = typeof item.severity === 'string' ? item.severity.toLowerCase() : item.severity;
                            severity = (severity === 1 || severity === 'warning') ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error;
                            let message = item.message;
                            let range = new vscode.Range(item.line - 1, item.column - 1, item.endLine - 1, item.endColumn - 1);
                            let diagnostic = new vscode.Diagnostic(range, message, severity);
                            diagnostics.push(diagnostic);
                        });
                        this.diagnosticCollection.set(textDocument.uri, diagnostics);
                    }
                });
            }
        });
    }
    provideCodeActions(document, range, context, token) {
        return [];
    }
    runCodeAction(document, range, message) {
        vscode.window.showErrorMessage("Nothing happened");
    }
}
RdeLintProvider.commandId = 'rde.lint.runCodeAction';
exports.default = RdeLintProvider;
//# sourceMappingURL=lint.js.map
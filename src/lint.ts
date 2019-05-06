import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from 'util';
import * as path from 'path';

// @ts-ignore
const asyncExec = util.promisify(cp.exec);
export default class RdeLintProvider {
  private static commandId: string = 'rde.lint.runCodeAction';

  // @ts-ignore
  private diagnosticCollection: vscode.DiagnosticCollection;

  // @ts-ignore
  private command: vscode.Disposable;

  public activate(subscriptions: vscode.Disposable[]) {
    this.command = vscode.commands.registerCommand(RdeLintProvider.commandId, this.runCodeAction, this);

    subscriptions.push(this);
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();

    vscode.workspace.onDidOpenTextDocument(this.doLint, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument((textDocument) => {
      this.diagnosticCollection.delete(textDocument.uri);
    }, null, subscriptions);

    vscode.workspace.onDidSaveTextDocument(this.doLint, this);

    vscode.workspace.textDocuments.forEach(this.doLint, this);
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }

  public async checkEnv() {
    try {
      await asyncExec('docker -v');

      await asyncExec('docker-compose -v');

      // whether is running or not
      await asyncExec('docker info');

      await asyncExec('rde -v');

      return true;
    } catch (e) {
      return false;
    }
  }

  public async doLint(textDocument: vscode.TextDocument) {
    if (!['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'].includes(textDocument.languageId)) {
      return;
    }

    if (!this.checkEnv()) {
      return;
    }

    let decoded: any = '';
    let diagnostics: vscode.Diagnostic[] = [];
    const {rootPath = ''} = vscode.workspace;
    const filePath = path.relative(rootPath, textDocument.fileName);
    
    let childProcess = cp.spawn('rde', ['lint', '-e', `--format json ${filePath}`], {
      cwd: rootPath,
    });
    if (childProcess.pid) {
      childProcess.stdout.on('data', (data: Buffer) => {
        decoded += data;
      });

      childProcess.stdout.on('end', () => {
        decoded = decoded.toString();
        const jsonPattern = /^\[\{"filePath.*"\}\]$/gim;
        const matches = decoded.match(jsonPattern);

        if (matches && matches.length) {
          const result = JSON.parse(matches[0]);
          const fileResult = result[0];
          fileResult.messages.forEach((item: any) => {
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
  }

  public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
    let diagnostic:vscode.Diagnostic = context.diagnostics[0];
    return [{
      title: "Accept rde lint suggestion",
      command: RdeLintProvider.commandId,
      arguments: [document, diagnostic.range, diagnostic.message]
    }];
  }

  private runCodeAction(document: vscode.TextDocument, range: vscode.Range, message:string): any {
		vscode.window.showErrorMessage("Nothing happened");
	}
}

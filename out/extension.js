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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const cp = require("child_process");
const util = require("util");
const lint_1 = require("./lint");
// @ts-ignore
const asyncExec = util.promisify(cp.exec);
const checkEnv = () => __awaiter(this, void 0, void 0, function* () {
    try {
        yield asyncExec('docker -v & docker-compose -v & docker info & rde -v');
        return true;
    }
    catch (e) {
        return false;
    }
});
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield checkEnv())) {
            return;
        }
        let linter = new lint_1.default();
        linter.activate(context.subscriptions);
        vscode.languages.registerCodeActionsProvider('javascript', linter);
        vscode.languages.registerCodeActionsProvider('javascriptreact', linter);
        vscode.languages.registerCodeActionsProvider('typescript', linter);
        vscode.languages.registerCodeActionsProvider('typescriptreact', linter);
        vscode.languages.registerCodeActionsProvider('vue', linter);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as childProcess from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let marker = new Markers();
  console.log('Congratulations, your extension "ruby-markers" is now active!');
  marker.validateDependencies();

  let evaluate = vscode.commands.registerCommand('extension.evaluate', () => {
    marker.evaluate(vscode.window.activeTextEditor);
  });

  let addMark = vscode.commands.registerCommand('extension.addMark', () => {
    marker.addMark(vscode.window.activeTextEditor);
  });

  context.subscriptions.push(hello);
  context.subscriptions.push(evaluate);
  context.subscriptions.push(addMark);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class Markers {
  public validateDependencies(){
    let comand = 'xmpfilter -v'
    let ls = childProcess.exec(comand, function (error, stdout, stderr) {
      if (error) {
        vscode.window.showErrorMessage('RUBY-MARKERS Require the command xmpfilter installed in your system, please read the README');
      }
    });
  }

  public evaluate(editor){
    const document = editor.document;
    let content = document.getText().replace(/"/g, "\\\"");
    let comand = 'echo "' + content + '" | xmpfilter';

    let ls = childProcess.exec(comand, function (error, stdout, stderr) {
      if (error) {
        console.log(error.stack);
      }else{
        editor.edit(function (editBuilder) {
          let pos1 = new vscode.Position(0, 0);
          let pos2 = new vscode.Position(document.lineCount-1, document.lineAt(document.lineCount-1).text.length);
          let range = new vscode.Range(pos1, pos2);

          editBuilder.replace(range, stdout.replace(/\n$/, ""));
        });
      }
    });
  }

  public addMark(editor){
    console.log('add mark');
    editor.edit((editBuilder) => {
      for (let selection of editor.selections) {
        let line = selection.end.line
        var lineText = editor.document.lineAt(line).text
        var pos1 = new vscode.Position(line, 0);
        var pos2 = new vscode.Position(line, lineText.length);
        var range = new vscode.Range(pos1, pos2);
        editBuilder.replace(range, this.add_mark_at(lineText));
      }
    });
  }

  private add_mark_at(line: string) {
    var spaces = (line.length < 50) ? 50 - line.length : 1
    return (line.length == 0 || line == "# =>" ) ? "# =>" : line + " ".repeat(spaces) + "# =>"
  }
}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const request = require("request");
const COMMNET_EXTRACTOR = require("extract-comments");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "doc-doctor" is now active!');
  const setting = vscode.workspace.getConfiguration("doc_doctor");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "doc-doctor.checkGrammar",
    async function () {
      // The code you place here will be executed every time your command is executed
      var currentlyOpenTabfilePath =
        vscode.window.activeTextEditor.document.fileName;
      vscode.workspace
        .openTextDocument(currentlyOpenTabfilePath)
        .then((document) => {
          let text = document.getText();
          // console.log(text);
          // @ts-ignore
          const COMMENTS = COMMNET_EXTRACTOR(text);
          // console.log(COMMENTS);
          COMMENTS.forEach((comment) => {
            // console.log(comment.value);
            var options = {
              method: "POST",
              url: "https://grammarbot.p.rapidapi.com/check",
              headers: {
                "x-rapidapi-host": "grammarbot.p.rapidapi.com",
                "x-rapidapi-key": setting.key,
                "content-type": "application/x-www-form-urlencoded",
                useQueryString: true,
              },
              form: {
                language: "en-US",
                text: comment.value,
              },
            };

            request(options, function (error, response, body) {
              if (error) throw new Error(error);
              // console.log(body);
              var results = JSON.parse(body)["matches"];
              console.log(results);
              results.forEach((error) => {
                vscode.window.showErrorMessage(error.message);
              });
            });
          });
        });
      // Display a message box to the user
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

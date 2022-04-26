import * as vscode from 'vscode';
import { join } from 'path';
import {
  getTemplateCode,
  runCommand,
  getRepoTypeOptions,
  getBundlerOptions,
  getResourcePath,
  getTemplatesNames,
} from './helpers';

let webviewPanel: vscode.WebviewPanel;

function disposeWebview() {
  if (webviewPanel) {
    webviewPanel.dispose();
  }
}

interface Options {
  repoType: string;
  name: string;
  version: string;
  bundler: string;
  targetFolder: string;
  piralPackage: string;
  npmRegistry: string;
  template: string;
}

function validateParameters(options: Options): string[] {
  const validationErrors: Array<string> = [];

  if (!options.targetFolder) {
    validationErrors.push('LocalPath');
  }

  if (!options.repoType) {
    validationErrors.push('RepoType');
  }

  if (!options.template) {
    validationErrors.push('Template');
  }

  if (!options.version.trim()) {
    options.version = '1.0.0';
  }

  if (!options.bundler.trim()) {
    validationErrors.push('Bundler');
  }

  if (!options.name.trim()) {
    validationErrors.push('Name');
  }

  if (options.repoType === 'pilet') {
    // nothing for now ...
    if (!options.piralPackage.trim()) {
      options.piralPackage = 'sample-piral';
    }

    if (!options.npmRegistry.trim()) {
      options.npmRegistry = 'https://registry.npmjs.org/';
    }
  }

  return validationErrors;
}

export async function createRepository(context: vscode.ExtensionContext) {
  const { extensionPath } = context;
  const { window, ViewColumn } = vscode;

  disposeWebview();

  webviewPanel = window.createWebviewPanel('piral.createProject', 'Piral - Create Project', ViewColumn.One, {
    enableScripts: true,
  });

  webviewPanel.webview.html = getTemplateCode(extensionPath, 'repository', {
    styles: [getResourcePath(webviewPanel, extensionPath, 'media/media.css')],
    scripts: [
      { url: getResourcePath(webviewPanel, extensionPath, 'media/media.js'), type: 'application/javascript' },
      { url: getResourcePath(webviewPanel, extensionPath, 'media/toolkit.min.js'), type: 'module' },
    ],
    repoTypes: getRepoTypeOptions(webviewPanel, extensionPath),
    bundlers: getBundlerOptions(webviewPanel, extensionPath),
    images: {
      selectedItemIcon: getResourcePath(webviewPanel, extensionPath, 'resources/selected-item.png'),
      foldersIcon: getResourcePath(webviewPanel, extensionPath, 'resources/folders-icon.png'),
      spinner: getResourcePath(webviewPanel, extensionPath, 'resources/spinner.gif'),
    },
  });

  webviewPanel.iconPath = vscode.Uri.file(join(extensionPath, 'resources/piral.png'));

  webviewPanel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case 'createPiralPilet':
          const options: Options = Object.assign(
            {
              repoType: '',
              template: '',
              name: '',
              version: '',
              bundler: '',
              targetFolder: '',
              piralPackage: '',
              npmRegistry: '',
            },
            message.parameters,
          );
          const validationErrors = validateParameters(options);
          const errorMessage = { command: 'error', data: validationErrors };
          webviewPanel.webview.postMessage(errorMessage);

          if (validationErrors.length > 0) {
            return;
          }

          // Go to target folder & create app folder
          const createAppFolder = `cd '${options.targetFolder}' && mkdir '${options.name}' && cd '${options.name}'`;
          const openProject = `npm --no-git-tag-version version '${options.version}' && code .`;

          if (options.repoType === 'piral') {
            // Handle Piral Instance
            const scaffoldPiral = `npm init piral-instance --registry '${options.npmRegistry}' --bundler '${options.bundler}' --defaults`;
            runCommand(`${createAppFolder} && ${scaffoldPiral} && ${openProject}`);

            // Dispose Webview
            disposeWebview();
          } else if (options.repoType === 'pilet') {
            // Handle Pilet Instance
            const scaffoldPilet = `npm init pilet --source '${options.piralPackage}' --registry '${options.npmRegistry}' --bundler '${options.bundler}' --defaults`;
            runCommand(`${createAppFolder} && ${scaffoldPilet} && ${openProject}`);

            // Dispose Webview
            disposeWebview();
          }
          break;

        case 'getLocalPath':
          const localPath = await window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            openLabel: 'Select a folder to create project',
          });

          if (localPath) {
            webviewPanel.webview.postMessage({ command: 'sendLocalPath', data: localPath });
          }

        case 'getTemplatesNames':
          const templatesNames = await getTemplatesNames(message.parameters);
          webviewPanel.webview.postMessage({
            command: 'sendTemplatesNames',
            type: message.parameters,
            templatesNames: templatesNames,
            selectedItemIcon: getResourcePath(webviewPanel, extensionPath, 'resources/selected-item.png')
          });
      }
    },
    undefined,
    context.subscriptions,
  );
}

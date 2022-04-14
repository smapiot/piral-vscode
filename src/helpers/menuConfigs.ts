import * as vscode from 'vscode';
import { join } from 'path';

const repoTypeOptions = [
  {
    type: 'piral',
    icon: 'resources/piral.png',
    title: 'Piral',
    description: 'Create a new Piral instance project.',
  },
  {
    type: 'pilet',
    icon: 'resources/piral.png',
    title: 'Pilet',
    description: 'Create a new pilet project.',
  },
];

const bundlerOptions = [
  {
    type: 'parcel',
    icon: 'resources/parcel.png',
    title: 'Parcel',
    description: 'Use Parcel as bundler for the project.',
  },
  {
    type: 'webpack',
    icon: 'resources/webpack.svg',
    title: 'Webpack',
    description: 'Use Webpack as bundler for the project.',
  },
  {
    type: 'parcel2',
    icon: 'resources/parcel.png',
    title: 'Parcel2',
    description: 'Use Parcel2 as bundler for the project.',
  },
  {
    type: 'Webpack5',
    icon: 'resources/webpack.svg',
    title: 'Webpack5',
    description: 'Use Webpack5 as bundler for the project.',
  },
  {
    type: 'vite',
    icon: 'resources/vite.png',
    title: 'Vite',
    description: 'Use Vite as bundler for the project.',
  },
  {
    type: 'esbuild',
    icon: 'resources/esbuild.png',
    title: 'Esbuild',
    description: 'Use Esbuild as bundler for the project.',
  },
  {
    type: 'rollup',
    icon: 'resources/rollup.png',
    title: 'Rollup',
    description: 'Use Rollup as bundler for the project.',
  },
  {
    type: 'xbuild',
    icon: 'resources/xbuild.png',
    title: 'Xbuild',
    description: 'Use Xbuild as bundler for the project.',
  },
];

function mapToLocalIcon<T extends { icon: string }>(
  items: Array<T>,
  panel: vscode.WebviewPanel,
  baseUriResources: string,
): Array<T> {
  return items.map((item) => ({
    ...item,
    icon: getResourcePath(panel, baseUriResources, item.icon),
  }));
}

export function getResourcePath(panel: vscode.WebviewPanel, baseUriResources: string, fileName: string) {
  return panel.webview.asWebviewUri(vscode.Uri.file(join(baseUriResources, fileName)));
}

export function getToolkitUri(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const pathList = [
    'node_modules',
    '@vscode',
    'webview-ui-toolkit',
    'dist',
    'toolkit.min.js'
  ];
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

export function getRepoTypeOptions(panel: vscode.WebviewPanel, baseUriResources: string) {
  return mapToLocalIcon(repoTypeOptions, panel, baseUriResources);
}

export function getBundlerOptions(panel: vscode.WebviewPanel, baseUriResources: string) {
  return mapToLocalIcon(bundlerOptions, panel, baseUriResources);
}

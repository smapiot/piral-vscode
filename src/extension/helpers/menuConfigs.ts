import * as vscode from 'vscode';
import { join } from 'path';
import axios from 'axios';

const repoTypeOptions = [
  {
    type: 'piral',
    icon: 'resources/types/piral.png',
    title: 'Piral',
    description: 'Create a new Piral instance project.',
  },
  {
    type: 'pilet',
    icon: 'resources/types/pilet.png',
    title: 'Pilet',
    description: 'Create a new pilet project.',
  },
];

const bundlerOptions = [
  {
    type: '',
    icon: 'resources/bundlers/none.png',
    title: '(none)',
    package: '',
    description: 'Choose no bundler for the moment.',
  },
  {
    type: 'parcel',
    icon: 'resources/bundlers/parcel.png',
    title: 'Parcel v1',
    package: 'piral-cli-parcel',
    description: 'Use Parcel v1 as bundler for the project.',
  },
  {
    type: 'webpack',
    icon: 'resources/bundlers/webpack.png',
    title: 'Webpack v4',
    package: 'piral-cli-webpack',
    description: 'Use Webpack v4 as bundler for the project.',
  },
  {
    type: 'parcel2',
    icon: 'resources/bundlers/parcel.png',
    title: 'Parcel v2',
    package: 'piral-cli-parcel2',
    description: 'Use Parcel v2 as bundler for the project.',
  },
  {
    type: 'webpack5',
    icon: 'resources/bundlers/webpack.png',
    title: 'Webpack v5',
    package: 'piral-cli-webpack5',
    description: 'Use Webpack v5 as bundler for the project.',
  },
  {
    type: 'vite',
    icon: 'resources/bundlers/vite.png',
    title: 'Vite',
    package: 'piral-cli-vite',
    description: 'Use Vite as bundler for the project.',
  },
  {
    type: 'esbuild',
    icon: 'resources/bundlers/esbuild.png',
    title: 'esbuild',
    package: 'piral-cli-esbuild',
    description: 'Use Esbuild as bundler for the project.',
  },
  {
    type: 'rollup',
    icon: 'resources/bundlers/rollup.png',
    title: 'Rollup',
    package: 'piral-cli-rollup',
    description: 'Use Rollup as bundler for the project.',
  },
  {
    type: 'bun',
    icon: 'resources/bundlers/bun.png',
    title: 'Bun',
    package: 'piral-cli-bun',
    description: 'Use Bun as bundler for the project.',
  },
  {
    type: 'xbuild',
    icon: 'resources/bundlers/xbuild.png',
    title: 'xbuild',
    package: 'piral-cli-xbuild',
    description: 'Use Xbuild as bundler for the project.',
  },
];

const languageOptions = [
  {
    type: 'ts',
    icon: 'resources/languages/ts.png',
    title: 'TypeScript',
    description: 'Use TypeScript to write your code.',
  },
  {
    type: 'js',
    icon: 'resources/languages/js.png',
    title: 'JavaScript',
    description: 'Use JavaScript to write your code.',
  },
];

const npmClientOptions = [
  {
    type: 'npm',
    icon: 'resources/clients/npm.png',
    title: 'npm',
    description: 'Use npm as your package manager.',
  },
  {
    type: 'yarn',
    icon: 'resources/clients/yarn.png',
    title: 'Yarn@1',
    description: 'Use Yarn v1 as your package manager.',
  },
  {
    type: 'pnpm',
    icon: 'resources/clients/pnpm.png',
    title: 'pnpm',
    description: 'Use pnpm as your package manager.',
  },
  {
    type: 'bun',
    icon: 'resources/clients/bun.png',
    title: 'Bun',
    description: 'Use Bun as your package manager.',
  },
  {
    type: 'lerna',
    icon: 'resources/clients/lerna.png',
    title: 'Lerna',
    description: 'Use Lerna as your package manager (works only in monorepos).',
  },
  {
    type: 'rush',
    icon: 'resources/clients/rush.png',
    title: 'Rush',
    description: 'Use Rush as your package manager (works only in monorepos).',
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

function stringifyAuthor(author: string | { name: string }) {
  if (typeof author === 'string') {
    return author;
  } else if (typeof author === 'object' && author) {
    return author.name;
  } else {
    return '';
  }
}

export const bundlerPackages = bundlerOptions.map((b) => b.package);

export function getResourcePath(panel: vscode.WebviewPanel, baseUriResources: string, fileName: string) {
  return panel.webview.asWebviewUri(vscode.Uri.file(join(baseUriResources, fileName)));
}

export async function getTemplatesNames(type: 'piral' | 'pilet', size = 50) {
  const baseUrl = `https://registry.npmjs.org/-/v1/search?text=keywords:${type}+template&size=${size}`;
  const result = await axios.get(baseUrl);
  const test = /@smapiot\/.*-template-(.*)/;

  const templates = await result.data.objects.map((elm: any) => {
    const { author, description, name: packageName } = elm.package;

    const shortName = test.exec(packageName);
    const name = shortName ? shortName[1] : packageName;
    return {
      name,
      author: stringifyAuthor(author),
      packageName,
      description,
    };
  });

  return templates;
}

export async function getTemplatesOptions(packageName: string) {
  const baseUrl = `https://registry.npmjs.org/${packageName}`;
  const result = await axios.get(baseUrl);
  const metaData = result.data;
  const latestVersion = await metaData['dist-tags'].latest;
  const { templateOptions } = await metaData.versions[latestVersion];

  return templateOptions;
}

export function getBundlerInfos(packageName: string) {
  return bundlerOptions.find((b) => b.package === packageName);
}

export function getRepoTypeOptions(panel: vscode.WebviewPanel, baseUriResources: string) {
  return mapToLocalIcon(repoTypeOptions, panel, baseUriResources);
}

export function getBundlerOptions(panel: vscode.WebviewPanel, baseUriResources: string) {
  return mapToLocalIcon(bundlerOptions, panel, baseUriResources);
}

export function getNpmClientOptions(panel: vscode.WebviewPanel, baseUriResources: string) {
  return mapToLocalIcon(npmClientOptions, panel, baseUriResources);
}

export function getLanguageOptions(panel: vscode.WebviewPanel, baseUriResources: string) {
  return mapToLocalIcon(languageOptions, panel, baseUriResources);
}

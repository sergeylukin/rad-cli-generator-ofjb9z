import './style.css';
import 'highlight.js/styles/tomorrow-night-bright.css';

import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('bash', bash);

// MEASURING SPOONS
export interface Config {
  name: string;
  application: string;
  scope: string;
  type: string;
  packages?: string[];
  dependencies?: string[];
  libs?: string[];
  entities?: Schema[];
  detached?: {
    [key: string]: Schema;
  };
}

export interface Schema {
  model: string;
  modelPlural: string;
}

// THE KITCHEN
const workspace = ({ config }) =>
  `npx create-nx-workspace@latest ${config.name} \\
  --appName=${config.application} \\
  --preset=${config.type} \\
  --npmScope=${config.scope} \\
  --nx-cloud=false \\
  --linter=eslint \\
  --style=scss && \\
cd ${config.name}/ && \\\n`;

const packages = ({ config }) =>
  config.packages.reduce((code, dependency) => {
    return (code += `npm i ${dependency} --force && \\\n`);
  }, '');

const dependencies = ({ config }) =>
  config.dependencies.reduce((code, dependency) => {
    return (code += `npx nx g ${dependency}:ng-add --no-interactive && \\\n`);
  }, '');

const libs = ({ config, suffix = '' }) =>
  config.libs.reduce((code, lib) => {
    return (code += `nx g lib ${lib} ${suffix} && \\\n`);
  }, '');

const slice = ({ config, module }) =>
  config.entities.reduce((code, entity) => {
    return (code += `nx g slice ${entity.modelPlural} \\
    --project ${module} \\
    --directory ${entity.modelPlural} \\
    --no-interactive \\
    --facade && \\\n`);
  }, '');

const state = ({ config, module }) =>
  config.entities.reduce((code, entity) => {
    return (code += `nx g @nrwl/angular:ngrx ${entity.modelPlural} \\
    --module=libs/${module}/src/lib/${module}.module.ts \\
    --directory ${entity.modelPlural} \\
    --no-interactive \\
    --facade && \\\n`);
  }, '');

const services = ({ config, module }) =>
  config.entities.reduce((code, entity) => {
    return (code += `nx g s services/${entity.modelPlural}/${entity.modelPlural} --project=${module} && \\\n`);
  }, '');

const containerComponent = ({ entity, suffix = '' }) =>
  `nx g c ${entity.modelPlural} ${suffix} && \\\n`;

const listComponent = ({ entity, suffix = '' }) =>
  `nx g c ${entity.modelPlural}-list --directory=${entity.modelPlural}${suffix} && \\\n`;

const detailsComponent = ({ entity, suffix = '' }) =>
  `nx g c ${entity.model}-details  --directory=${entity.modelPlural} ${suffix} && \\\n`;

const libComponent = ({ entity, project, suffix = '' }) =>
  `nx g c ${entity.model} --project ${project} ${suffix} && \\\n`;

const componentLayer = ({ config, suffix = '' }) =>
  config.entities.reduce((code, entity) => {
    code += containerComponent({ entity, suffix });
    code += listComponent({ entity, suffix });
    code += detailsComponent({ entity, suffix });
    return code;
  }, '');

const nest = ({ config }) =>
  config.entities.reduce((code, entity) => {
    return (code += `nx g @nestjs/schematics:resource ${entity.modelPlural} \\
    --project api \\
    --no-interactive && \\\n`);
  }, '');

const routingModule = () =>
  `nx g m routing --flat=true -m=app.module.ts && \\\n`;

const stateContainer = () => `touch libs/core-state/src/lib/index.ts && \\\n`;

const jsonServer = () => `mkdir server && touch server/db.json && \\\n`;

const start = () => `npx concurrently "npm start" "npm start api"`;

const generate = (commands) =>
  commands.reduce((code, command) => {
    code += command.func(command.params);
    return code;
  }, '');

// THE INGREDIENTS
const DATA_MODULE = 'core-data';
const STATE_MODULE = 'core-state';
const MATERIAL_MODULE = 'material';

const resortSchema: Schema = {
  model: 'resort',
  modelPlural: 'resorts',
};

const offerSchema: Schema = {
  model: 'offer',
  modelPlural: 'offers',
};

const homeSchema: Schema = {
  model: 'home',
  modelPlural: 'home',
};

const config: Config = {
  name: 'weski',
  application: 'web-app',
  scope: 'weski',
  type: 'react-express',
  packages: ['axios', '-D json-server', '-D concurrently', '@material-ui/core'],
  dependencies: [],
  libs: [DATA_MODULE, STATE_MODULE, MATERIAL_MODULE],
  entities: [
    resortSchema,
    offerSchema,
  ],
  detached: {
    home: homeSchema,
  },
};

const suffixes = {
  style: `--style=@emotion/styled`,
  lib: `--component=false`,
  component: ` --export=false --routing=true --style=@emotion/styled`,
};

// THE RECIPE
const commands = [
  { func: workspace, params: { config } },
  { func: packages, params: { config } },
  { func: dependencies, params: { config } },
  { func: libs, params: { config, suffix: suffixes.lib } },
  { func: slice, params: { config, module: STATE_MODULE } },
  { func: componentLayer, params: { config, suffix: suffixes.component } },
  {
    func: containerComponent,
    params: {
      entity: config.detached.home,
      suffix: suffixes.component,
    },
  },
  { func: jsonServer, params: {} },
  { func: start, params: {} },
];

const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `
<h2>CLI Ludicrous Mode</h2>
<pre>
<code class="language-bash">${generate(commands)}</code>  
</pre>
`;

hljs.highlightAll();

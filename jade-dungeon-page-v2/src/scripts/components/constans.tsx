export type AppCfg = { envName: string, guiRoot: string, apiRoot: string }

export type EnvCfg = { dev: AppCfg, fat: AppCfg, rls: AppCfg };

export const ENV_CFG: EnvCfg= {
	dev: {envName: 'def', guiRoot: 'http://localhost:8000'      , apiRoot: 'http://www.jade-dungeon.net:8088'},
	fat: {envName: 'fat', guiRoot: 'http://localhost:8000'      , apiRoot: 'http://www.jade-dungeon.net:8088'},
	rls: {envName: 'rls', guiRoot: 'http://www.jade-dungeon.net', apiRoot: 'http://www.jade-dungeon.net:8088'},
};

export const CURR_ENV: AppCfg = /localhost:8000/.test(document.location.host) ? ENV_CFG.dev : ENV_CFG.rls;

console.log(`curr env is :`);
console.log(CURR_ENV);

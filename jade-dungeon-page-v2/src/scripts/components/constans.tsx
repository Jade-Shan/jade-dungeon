export type AppCfg = { guiRoot: string, apiRoot: string }

export type EnvCfg = { dev: AppCfg, fat: AppCfg, rls: AppCfg };

export const ENV_CFG: EnvCfg= {
	dev: {guiRoot: 'http://localhost:8000'      , apiRoot: 'http://www.jade-dungeon.net:8088'},
	fat: {guiRoot: 'http://localhost:8000'      , apiRoot: 'http://www.jade-dungeon.net:8088'},
	rls: {guiRoot: 'http://www.jade-dungeon.net', apiRoot: 'http://www.jade-dungeon.net:8088'},
};

export const CURR_ENV: AppCfg = /localhost:8000/.test(document.location.hostname) ? ENV_CFG.dev : ENV_CFG.rls;
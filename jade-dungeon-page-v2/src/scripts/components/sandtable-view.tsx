import { initMapDatas } from '../components/sandtable';


export let initSandtable = async (cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	 initMapDatas('campaign01', 'place01', 'scene01');
}
/* jshint esversion: 8 */
class SandTableEditor {

	constructor(canvas, scene, userId) {
		this.canvas    = canvas;
		this.ctx       = canvas.getContext("2d");
		this.userId    = userId;
		this.observer  = {};
		this.scene     = { width: 0, height: 0, 
			campaignId: scene.campaignId, placeId: scene.placeId, sceneId: scene.sceneId,
			shadowColor: scene.shadowColor, viewRange: scene.viewRange,
			creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:{}};
	}

}

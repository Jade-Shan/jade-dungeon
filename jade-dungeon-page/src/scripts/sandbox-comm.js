/* jshint esversion: 8 */
let imgResources = [];
let mapDatas     = [];
let scene  = {
	width: 0, height: 0, lighteness: 'rgba(0, 0, 0, 0.7)',
	creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:{}};
let observer = {};

let viewRange = 500;

let canvas = document.getElementById("canvas");
let ctx    = canvas.getContext("2d");


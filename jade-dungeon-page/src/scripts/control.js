/* jshint esversion: 8 */
function resizeLayout() {
	let wWidth    = parseInt(window.innerWidth);
	let wHeight   = parseInt(window.innerHeight);
	let mapArea   = document.querySelector("#mapArea");
	let ctrlPanel = document.querySelector("#ctrlPanel");
	let cpHeight = 150; // parseInt(ctrlPanel.style.height);

	let maWidth  = wWidth - 30;
	let maHeight = wHeight - cpHeight - 30;
	mapArea.style.width  = maWidth  + "px";
	mapArea.style.height = maHeight + "px";
}
// resizeLayout();
window.addEventListener('resize', resizeLayout);

function moveObs(dx, dy) {
	observer.move(dx, dy);
	drawSence();
}

document.addEventListener("keydown", (event) => {
	if (event.key == 'h') { 
		moveObs(-10,   0);
	} else if (event.key == 'j') { 
		moveObs(  0,  10);
	} else if (event.key == 'k') { 
		moveObs(  0, -10);
	} else if (event.key == 'l') { 
		moveObs( 10,   0);
	}
});




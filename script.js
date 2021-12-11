//******************************************************************************************************************//
//***************************************************VARIABLES******************************************************//

let context = null;

const VIDE = '0x00', TERRE = '0x01',
	ACIER = '0x07',
	ROCHER = '0x10',
	DIAMANT = '0x14',
	ROCKFORD = '0x38',
	SORTIE = '0x50',
	EXPLOSION = '0x60';

//initialisation des images
const sprites = new Image();
sprites.src = 'sprites.png';

//initialisation des sons
const theme = new Audio("audio/BD_theme.mp3");
const sonDefaite = new Audio("audio/defaite.mp3");
const sonDiamant = new Audio("audio/diamant.mp3");
const sonVictoire = new Audio("audio/victoire.mp3");
const sonExplosion = new Audio("audio/explosion.mp3");

//variables de base
let score = 0;
let niveau = 1;
let vies = 3;
let nbDiamantsRecup = 0;
let gameOver = false;
let victoire = false;
let tempsRestant = 180;
let joueur = { x: 2, y: 3, enVie: true };
let indexDiamant = 0, indexRockford = 0, indexRockfordY = 0, yIdxRockford = 0, indexExplosion = 0;
const nbDiamants = [18, 11, 25, 27, 38];
let aDroite = false, aGauche = false, enHaut = false, enBas = false;
let delaiChutePierre = 0;
let enJeu = true;
//variables étant des structures
class Position {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}


//timer
setInterval(updateDecompte, 1000)
function updateDecompte() {
	time--;
	if (time == 0) {
		vies--;
		if (vies == 0) {
			gameOver = true;
		} else {
			resetMap();
		}
	}
}

let tableauDeJeu = [];
const tabOftab = [MAP1, MAP2, MAP3, MAP4, MAP5];
resetMap();

//constantes plaçables dans un tableau (tableaux de constantes)
let tabTemps = [140, 120]; //au hasard en attendant
let lvMap = [];



//******************************************************************************************************************//
//*************************************************INITIALISATION***************************************************//

// initialisation (appelée au chargement du corps du document <body onload="init">)    
function init() {
	// instanciation de la variable globale contenant le contexte
	canvas = document.getElementById("cvs");
	context = canvas.getContext("2d");
	let pageVictoire = document.getElementById("pageVictoire");
	// 3 écouteurs pour le clavier (appui/relâchement d'une touche)
	document.addEventListener("keydown", captureAppuiToucheClavier);
	document.addEventListener("keyup", captureRelacheToucheClavier);
	// bouton START
	let start = document.getElementById("start")
	start.addEventListener('click', function (event) {
		event.preventDefault();
		boucleDeJeu();
		start.parentElement.removeChild(start);
		canvas.classList.add("canvasApresClick")
		time = tempsRestant;
		theme.play();
		setInterval(function () { theme.play() }, 45000);
	})
}

//******************************************************************************************************************//
//*************************************************COURS DU JEU*****************************************************//

boucleDeJeu = function () {

	if (!gameOver && !victoire) {
		update(Date.now());
		// affichage de l'état du jeu
		render();
		// rappel de la boucle de jeu 
	}
	else if (victoire) {
		afficherVictoire();
		boutonRestart();
	} else if (gameOver) {
		theme.pause();
		sonDefaite.play();
		pageDefaite.style.opacity = 1;
		canvas.classList.remove("canvasApresClick");
		gameOver = false;
		boutonRestart();
	}

	dt3 -= Date.now();
	dtVct -= dt3;
	if (victoire && dtVct > 100 && tempsRestant < 0) {
		score++;
		tempsRestant--;
		dtVct = 0;
	}
	dt3 = Date.now();
	// requestAnimationFrame est une fonction JS servant à pré-calculer le prochain affichage
	requestAnimationFrame(boucleDeJeu);
}

function boutonRestart() {
	//créer le bouton restart
	conteneur = document.getElementById("conteneur");
	let start = document.createElement('a');
	start.setAttribute("id", "restart");
	start.innerHTML = "Restart";
	conteneur.appendChild(start);
	victoire = false;
	//bouton restart cliquable
	restart.addEventListener('click', function (event) {
		event.preventDefault();
		restart.parentElement.removeChild(restart);
		canvas.classList.add("canvasApresClick");
		time = tempsRestant;
		theme.play();
		setInterval(function () { theme.play() }, 45000);
		pageVictoire.style.opacity = 0;
		pageDefaite.style.opacity = 0;
		niveau = 1;
		resetMap();
		score = 0;
		vies = 3;
	})
}

var dtVct = 0;
var dt3;
var dt2 = 0;
var dt = 0;

update = function (d) {
	// faire une suite de fonctions avec peut être des conditions
	dt -= d
	dt2 = dt2 - dt
	if ((vecteur.x != 0 || vecteur.y != 0) && (dt2 > 125)) {
		vectJ(tableauDeJeu);
		dt2 = 0;
	}

	dtVct = dt2 - dt
	if (victoire && dtVct > 100 && tempsRestant < 0) {
		score++;
		tempsRestant--;
		dtVct = 0;
	}
	dt = d;
}

//******************************************************************************************************************//
//********************************************FONCTIONS DE RENDU****************************************************//

//affiche le score
function afficheScore() {
	affScore = document.getElementById("affScore");
	affScore.innerText = score;
}

//affiche le minuteur
function afficheMinuteur() {
	affMinuteur = document.getElementById("affMinuteur");
	affMinuteur.innerText = time;
}

//affiche les Vies
function afficheVies() {
	affVies = document.getElementById("affVies");
	affVies.innerText = vies;
}
//affiche le niveau
function afficheNiveau() {
	affNiveau = document.getElementById("affNiveau");
	affNiveau.innerText = "Niveau " + niveau;
}


function afficherVictoire() {
	pageVictoire.style.opacity = 1;
	const texteVictoire = document.getElementById("victoire");
	victoireTexte.innerHTML = "Victoire !<br>Temps : " + (180 - time) + " secondes";
	canvas.classList.remove("canvasApresClick");
	sonVictoire.play();
	theme.pause();
}

render = function () {
	// effacement de l'écran
	context.clearRect(0, 0, context.width, context.height);
	affichage(tableauDeJeu);
	afficheScore();
	afficheMinuteur();
	afficheVies();
	afficheNiveau();
}

//fonction d'affichage du jeu qui affiche à partir d'un tableau
affichage = function (tab) {
	//animation des diamants
	indexDiamant = (indexDiamant + 0.2) % 8;
	xDiamant = Math.floor(indexDiamant) * 32;
	//animation de Rockford
	if (indexRockford <= 7) {
		indexRockford += 0.4
	} else {
		indexRockford = indexRockford % 7;
		indexRockfordY += 1
	}
	indexRockfordY %= 3
	xRockford = Math.floor(indexRockford) * 32;
	yIdxRockford = 32 + indexRockfordY * 32;
	if (aDroite) {
		yRockford = 5 * 32;
	} else if (aGauche) {
		yRockford = 4 * 32;
	} else if (enHaut || enBas) {
		yRockford = 0;
		xRockford = 0;
	} else {
		yRockford = yIdxRockford;
	}
	// animation de l'explosion
	//indexExplosion = (indexExplosion+0.1)%5;
	if (indexExplosion <= 5) {
		indexExplosion += 0.1
	} else {
		indexExplosion = 6
	}
	xExplosion = 32 + Math.floor(indexExplosion) * 32
	const tailleCote = 32;
	for (let i = 0; i < tab.length; i++) {

		for (let j = 0; j < tab[0].length; j++) {


			switch (tab[i][j]) { //peindre ce qu'il faut, faire cercle pour diams et pierre

				case ROCKFORD: {
					context.drawImage(sprites, xRockford, yRockford, 32, 32, j * tailleCote, i * tailleCote, 32, 32)
					joueur.x = i;
					joueur.y = j;
				}
					break;
				case VIDE: { context.drawImage(sprites, 0, 192, 32, 32, j * tailleCote, i * tailleCote, 32, 32) }
					break;
				case TERRE: { context.drawImage(sprites, 32, 224, 32, 32, j * tailleCote, i * tailleCote, 32, 32) }
					break;
				case ACIER: { context.drawImage(sprites, 96, 192, 32, 32, j * tailleCote, i * tailleCote, 32, 32) }
					break;
				case ROCHER: { context.drawImage(sprites, 0, 224, 32, 32, j * tailleCote, i * tailleCote, 32, 32) }
					break;
				case DIAMANT: { context.drawImage(sprites, xDiamant, 320, 32, 32, j * tailleCote, i * tailleCote, 32, 32) }
					break;
				case SORTIE: {
					if (nbDiamantsRecup >= nbDiamants[niveau - 1]) {
						context.drawImage(sprites, 64, 192, 32, 32, j * tailleCote, i * tailleCote, 32, 32)
					} else {
						context.drawImage(sprites, 32, 192, 32, 32, j * tailleCote, i * tailleCote, 32, 32)
					}
				}
					break;
				case EXPLOSION: { context.drawImage(sprites, xExplosion, 0, 32, 32, j * tailleCote, i * tailleCote, 32, 32) }
					break;
			}
			graviteRocher(tab, tab.length - 1 - i, j);
			graviteDiamant(tab, tab.length - 1 - i, j);

		}
	}
}


//reset de la map
function resetMap(tab) {
	if (joueur.enVie == false) {
		score -= nbDiamantsRecup * 50;
		joueur.enVie = true;
	}

	nbDiamantsRecup = 0;
	time = tempsRestant;
	var newTableauDeJeu = [];
	let MAP = tabOftab[niveau - 1];
	for (var i in MAP) {
		newTableauDeJeu[i] = [];
		newTableauDeJeu[i] = [...MAP[i]]
	}
	tableauDeJeu = newTableauDeJeu;
}




//******************************************************************************************************************//
//***********************************************PHYSIQUE DU JEU****************************************************//

//gravité des rochers
graviteRocher = function (tab, i, j) {
	if (tab[i][j] == ROCHER && tab[i + 1][j] == VIDE) {
		delaiChutePierre += 0.1
		if (delaiChutePierre > .5) {
			tab[i][j] = VIDE;
			tab[i + 1][j] = ROCHER;
			tab[i][j] = VIDE;
			tab[i + 1][j] = ROCHER;
			delaiChutePierre = 0;
		}

		if ((tab[i + 2][j] == ROCKFORD)) {
			explosionX(tableauDeJeu, i + 2, j);
			tab[i][j] = VIDE;
			delaiChutePierre = 0;
		}
	}
	if (tab[i][j] == ROCHER && tab[i + 1][j - 1] == VIDE && tab[i][j - 1] == VIDE && tab[i + 1][j] != ROCKFORD && tab[i + 1][j]) {
		delaiChutePierre += .1;
		if (delaiChutePierre > .5) {
			tab[i][j] = VIDE;
			tab[i + 1][j - 1] = ROCHER;
			delaiChutePierre = 0;
		}

	}
	if (tab[i][j] == ROCHER && tab[i + 1][j + 1] == VIDE && tab[i][j + 1] == VIDE && tab[i + 1][j] != ROCKFORD && tab[i + 1][j]) {
		delaiChutePierre += .1;
		if (delaiChutePierre > .5) {
			tab[i][j] = VIDE;
			tab[i + 1][j + 1] = ROCHER;
			delaiChutePierre = 0;
		}
	}
}

//gravité des diamants
graviteDiamant = function (tab, i, j) {
	if (tab[i][j] == DIAMANT && tab[i + 1][j] == VIDE) {
		tab[i][j] = VIDE;
		tab[i + 1][j] = DIAMANT;
	}
	if (tab[i][j] == DIAMANT && tab[i + 1][j - 1] == DIAMANT && tab[i][j - 1] == DIAMANT && tab[i + 1][j] != ROCKFORD && tab[i + 1][j]) {
		tab[i][j] = VIDE;
		tab[i + 1][j - 1] = DIAMANT;
	}
	if (tab[i][j] == DIAMANT && tab[i + 1][j + 1] == VIDE && tab[i][j + 1] == VIDE && tab[i + 1][j] != ROCKFORD && tab[i + 1][j]) {
		tab[i][j] = VIDE;
		tab[i + 1][j + 1] = DIAMANT;
	}
	if (tab[i][j] == DIAMANT && tab[i + 1][j] == ROCKFORD) {
		tab[i][j] = VIDE;
		score += 50;
		nbDiamantsRecup++;
		sonDiamant.play();
	}
}


//******************************************************************************************************************//
//********************************************ENTRÉES UTILISATEUR***************************************************//

/**
 *  Fonction appelée lorsqu'une touche du clavier est appuyée
 *  Associée à l'événement "keyDown"
 */
captureAppuiToucheClavier = function (event) {
	switch (event.keyCode) {
		case 37: if (vecteur.x == 0 && vecteur.y != 1) {
			vecteur.y = -1;
			aGauche = true;
		}
		case 39: if (vecteur.x == 0 && vecteur.y != -1) {
			vecteur.y = 1;
			aDroite = true;
		}
		case 38: if (vecteur.x != 1 && vecteur.y == 0) {
			vecteur.x = -1;
			enHaut = true;
		}
		case 40: if (vecteur.x != -1 && vecteur.y == 0) {
			vecteur.x = 1;
			enBas = true;
		} break;
		case 13: explosionX(tableauDeJeu, joueur.x, joueur.y)
	}
}

/**
 *  Fonction appelée lorsqu'une touche du clavier est relâchée
 *  Associée à l'événement "keyUp"
 */
captureRelacheToucheClavier = function (event) {

	switch (event.keyCode) {
		case 37: if (vecteur.y == -1) {
			vecteur.y = 0;
			aGauche = false;
		}
		case 39: if (vecteur.y == 1) {
			vecteur.y = 0;
			aDroite = false;
		}
		case 38: if (vecteur.x == -1) {
			vecteur.x = 0;
			enHaut = false;
		}
		case 40: if (vecteur.x == 1) {
			vecteur.x = 0;
			enBas = false;
		}
	}
}

//******************************************************************************************************************//
//***********************************************DEPLACEMENT JOUEUR*************************************************//

let vecteur = new Position(0, 0);

function explosionX(tab, x, y) {
	sonExplosion.play();
	for (let j = -1; j < 2; j++) {
		for (let i = -1; i < 2; i++) {
			switch (tab[x + i][y + j]) {
				case ROCKFORD: {
					vies--;
					if (vies == 0) {
						gameOver = true;
					} else {
						joueur.enVie = false;
						setTimeout(resetMap, 2000);
					}
					tab[x + i][y + j] = EXPLOSION;
				}
					break;
				case ACIER: tab[x + i][y + j] = ACIER;
					break;
				default: tab[x + i][y + j] = EXPLOSION;
					indexExplosion = 0;
					break;
			}
		}
	}
}

deplaceJ = function (tab) {
	tab[joueur.x + vecteur.x][joueur.y + vecteur.y] = ROCKFORD;
	tab[joueur.x][joueur.y] = VIDE;
	joueur.x += vecteur.x;
	joueur.y += vecteur.y;
}

vectJ = function (tab) {
	if (enJeu) {
		switch (tab[joueur.x + vecteur.x][joueur.y + vecteur.y]) {
			case VIDE: { deplaceJ(tab); } break;
			case TERRE: { deplaceJ(tab); } break;
			case DIAMANT: {
				deplaceJ(tab);
				score += 50;
				nbDiamantsRecup++;
				sonDiamant.play();
			} break;
			case SORTIE: {
				afficherVictoire();
				enJeu = false
				if (nbDiamantsRecup >= nbDiamants[niveau - 1]) {
					tab[joueur.x][joueur.y] = VIDE;
					setTimeout(function () {
						niveau += 1;
						if (niveau >= nbDiamants.length + 1) {
							victoire = true;
						} else {
							resetMap();
						}
						pageVictoire.style.opacity = 0;
						canvas.classList.add("canvasApresClick");
						theme.play();
						enJeu = true;
					}, 5000);


				}
			} break;
			case ROCHER: {
				if ((vecteur.y != 0) && (tab[joueur.x + 2 * vecteur.x][joueur.y + 2 * vecteur.y] == VIDE)) {
					tab[joueur.x + 2 * vecteur.x][joueur.y + 2 * vecteur.y] = ROCHER;
					deplaceJ(tab);
				}
			} break;
		}
	}
}
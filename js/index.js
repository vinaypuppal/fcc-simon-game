"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//generate 20 random numbers between 0 and 3 including 0 and 3 and push them into array
var getRandomSequences = function getRandomSequences(size, tiles) {
	var arr = [];
	for (var i = 0; i < size; i++) {
		arr.push(~~(Math.random() * tiles));
	}
	return [].concat(arr);
};

//generate and array with 20 rounds of game with random sequences
var generateRounds = function generateRounds(rounds, tiles) {
	var seq = getRandomSequences(rounds, tiles);
	var arr = [];
	for (var i = 0; i < seq.length; i++) {
		var temp = [];
		for (var j = 0; j <= i; j++) {
			temp.push(seq[j]);
		}
		arr.push(temp);
	}
	return [].concat(arr);
};

var rounds = null;
var currentRound = null;
var cacheCurrentRound = null;
var timeout = null;
var interval = null;

var playRound = function playRound(round) {
	if (round) console.log("wrong move got this:", round);
	var currentRound = round || rounds.shift();
	$('.round-info').text("Round " + (20 - rounds.length));
	animateSequence(currentRound);
	return [].concat(_toConsumableArray(currentRound));
};

//Animate cell and play sound
var animateSequence = function animateSequence(sequence) {
	var i = 0;
	interval = setInterval(function () {
		lightUpCell(sequence[i]);
		i++;
		if (i >= sequence.length) {
			clearInterval(interval);
		}
	}, 900);
};

//lightup cell
var lightUpCell = function lightUpCell(cell) {
	var $cell = $('[data-cell=' + cell + ']').addClass('lit');
	var sound = $('[data-sound=' + cell + ']')[0];
	sound.currentTime = 0;
	sound.play();
	timeout = setTimeout(function () {
		$cell.removeClass('lit');
	}, 600);
};

//check if user enabled Strict Mode
var strictMode = function strictMode() {
	return $('#strict').is(':checked');
};

var disableStrictModeBox = function disableStrictModeBox() {
	$('#strict').attr("disabled", true);
};

var enableStrictModeBox = function enableStrictModeBox() {
	$('#strict').removeAttr("disabled");
};

//reset game
var resetGame = function resetGame() {
	rounds = null;
	currentRound = null;
	cacheCurrentRound = null;
	clearInterval(interval);
	clearTimeout(timeout);
	$('.round-info').text("Click StartGame To Play");
	enableStrictModeBox();
};

//users click listeners
$(document).ready(function () {
	$('#start').unbind().on('click', function (e) {
		e.preventDefault();
		$(this).hide();
		$('#reset').show();
		//disable strictmode checkbox after starting game
		disableStrictModeBox();
		//get rounds
		rounds = generateRounds(20, 4);
		//get start round
		currentRound = playRound();

		//cache currentround if user mistake then use this to play sequence again
		cacheCurrentRound = [].concat(_toConsumableArray(currentRound));

		console.log("start: ", currentRound);
		console.log("cache: ", cacheCurrentRound);

		$('.cell').unbind().on('click', function (e) {
			var cell = $(this).data('cell');
			console.log("clicked cell: ", cell);
			console.log("current before user click check: ", currentRound);
			console.log("cache before user click check: ", cacheCurrentRound);
			//check if pressed correct cell present in currentRound
			if (cell === currentRound.shift()) {
				//then animate cell and play sound
				lightUpCell(cell);
				console.log("current after user click check success: ", currentRound);
				console.log("cache after user click check success: ", cacheCurrentRound);

				//check if 20 rounds finished
				if (rounds.length === 0) {
					$('.round-info').text('You Won!');
					//play won audio sound
					var sound = $('#won-audio')[0];
					sound.currentTime = 0;
					sound.play();
					//reset game
					resetGame();
					//and return from click handler
					return;
				} else {
					//check if currentRound array is empty
					if (currentRound.length === 0) {
						console.log("current empty: ", currentRound);
						setTimeout(function () {
							// so request for new round
							currentRound = playRound();
							//cache this round
							cacheCurrentRound = [].concat(_toConsumableArray(currentRound));
							console.log("new current: ", currentRound);
						}, 600);
					} else {
						//nothing here :-)
					}
				}
			} else {
					//this handles user error press
					//play error sound and dont lightup cell
					var _sound = $('#error-audio')[0];
					_sound.currentTime = 0;
					_sound.play();

					console.log("current after user click check fail: ", currentRound);
					console.log("cache after user click check fail: ", cacheCurrentRound);
					//show error info
					$('.round-info').text("Ooops!...");
					$('header h1').text("Wrong Move");
					//after 200ms request for playRound again
					setTimeout(function () {
						if (strictMode()) {
							rounds = generateRounds(20, 4);
							currentRound = playRound();
							cacheCurrentRound = [].concat(_toConsumableArray(currentRound));
							$('header h1').text("Simon Says Game");
						} else {
							currentRound = playRound(cacheCurrentRound);
							cacheCurrentRound = [].concat(_toConsumableArray(currentRound));
							$('header h1').text("Simon Says Game");
						}
					}, 1000);
				}
		});
	});
	$('#reset').unbind().on('click', function (e) {
		e.preventDefault();
		$(this).hide();
		$('#start').show();
		resetGame();
	});
});
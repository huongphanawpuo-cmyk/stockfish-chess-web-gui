import {
	ChessConsole,
	CONSOLE_MESSAGE_TOPICS,
} from "chess-console/src/ChessConsole.js";
import { Board } from "chess-console/src/components/Board.js";
import { CapturedPieces } from "chess-console/src/components/CapturedPieces.js";
import { GameStateOutput } from "chess-console/src/components/GameStateOutput.js";
import { History } from "chess-console/src/components/History.js";
import { HistoryControl } from "chess-console/src/components/HistoryControl.js";
import { Persistence } from "chess-console/src/components/Persistence.js";
import { Sound } from "chess-console/src/components/Sound.js";
import { LocalPlayer } from "chess-console/src/players/LocalPlayer.js";
import { I18n } from "cm-web-modules/src/i18n/I18n.js";
import { ENGINE_CONFIG, GAME_CONFIG } from "./Config.js";
import { RightClickAnnotator } from "./extensions/RightClickAnnotator.js";
import { StockfishAnalysis } from "./StockfishAnalysis.js";
import { StockfishGameControl } from "./StockfishGameControl.js";
import { StockfishPlayer } from "./StockfishPlayer.js";
import { StockfishStateView } from "./StockfishStateView.js";

const i18n = new I18n({ locale: "en" });
i18n.load({
	en: {
		playerName: "Player",
		analysis: "Analysis",
	},
});
const chessConsole = new ChessConsole(
	document.getElementById("console-container"),
	{ name: i18n.t("playerName"), type: LocalPlayer },
	{
		name: "Stockfish 17.1",
		type: StockfishPlayer,
		props: {
			worker: ENGINE_CONFIG.WORKER_PATH,
			book: ENGINE_CONFIG.BOOK_PATH,
			skillLevel: ENGINE_CONFIG.DEFAULT_SKILL_LEVEL,
			depth: ENGINE_CONFIG.DEFAULT_DEPTH,
			debug: ENGINE_CONFIG.DEFAULT_DEBUG,
			gameMode: "pve", // Default
		},
	},
);
new Board(chessConsole, {
	assetsUrl: "./assets/cm-chessboard/",
}).initialized.then((board) => {
	new Persistence(chessConsole, {
		savePrefix: GAME_CONFIG.SAVE_PREFIX,
	}).load();
	board.chessboard.addExtension(RightClickAnnotator);

	const clearAnnotations = () => {
		board.chessboard.removeArrows();
		board.chessboard.removeMarkers();
	};

	// Event Delegation for Buttons (including those created async like Setup/Clear)
	document.body.addEventListener("click", (e) => {
		const target = e.target.closest("button");
		if (!target) return;

		if (target.id === "btn-clear-annotations") {
			clearAnnotations();
		} else if (target.id === "btn-setup") {
			document.getElementById("fen-text").value =
				chessConsole.state.chess.fen();
			document.getElementById("pgn-text").value =
				chessConsole.state.chess.renderPgn();
			setupModal.show();
		} else if (target.id === "btn-load-fen") {
			const fen = document.getElementById("fen-text").value;
			chessConsole.initGame({ fen: fen });
			setupModal.hide();
			showNotification("FEN Loaded Successfully");
		} else if (target.id === "btn-load-pgn") {
			const pgn = document.getElementById("pgn-text").value;
			chessConsole.initGame({ pgn: pgn });
			setupModal.hide();
			showNotification("PGN Loaded Successfully");
		} else if (target.id === "btn-copy-fen") {
			navigator.clipboard.writeText(document.getElementById("fen-text").value);
			showNotification("FEN Copied to Clipboard!");
		} else if (target.id === "btn-copy-pgn") {
			navigator.clipboard.writeText(document.getElementById("pgn-text").value);
			showNotification("PGN Copied to Clipboard!");
		}
	});

	// Analysis Engine Setup (Requires board)
	const analysis = new StockfishAnalysis(
		document.getElementById("analysis-output"),
		{
			board: board.chessboard,
			i18n: chessConsole.i18n,
		},
	);

	const savedAnalysisDepth =
		chessConsole.persistence.loadValue("analysisDepth");
	if (savedAnalysisDepth) analysis.setDepth(savedAnalysisDepth);

	const updateAnalysis = () => {
		const fen = chessConsole.state.chess.fen();
		analysis.analyze(fen);
	};

	chessConsole.messageBroker.subscribe(
		CONSOLE_MESSAGE_TOPICS.legalMove,
		updateAnalysis,
	);
	chessConsole.messageBroker.subscribe(
		CONSOLE_MESSAGE_TOPICS.moveUndone,
		updateAnalysis,
	);
	chessConsole.messageBroker.subscribe(
		CONSOLE_MESSAGE_TOPICS.load,
		updateAnalysis,
	);
	chessConsole.messageBroker.subscribe(
		CONSOLE_MESSAGE_TOPICS.newGame,
		updateAnalysis,
	);
	chessConsole.messageBroker.subscribe(
		CONSOLE_MESSAGE_TOPICS.initGame,
		(data) => {
			if (data.props.analysisDepth) {
				analysis.setDepth(data.props.analysisDepth);
			}
			updateAnalysis();
		},
	);
});

// Global UI Logic
const setupModal = new bootstrap.Modal(document.getElementById("setupModal"));
const showNotification = (message) => {
	const toastEl = document.getElementById("notificationToast");
	const toastBody = document.getElementById("toastMessage");
	toastBody.innerText = message;
	const toast = new bootstrap.Toast(toastEl);
	toast.show();
};

// Modal focus management for accessibility
document
	.getElementById("setupModal")
	.addEventListener("hidden.bs.modal", () => {
		if (document.activeElement) {
			document.activeElement.blur();
		}
	});

const newGameModalEl = document.getElementById("new-game-modal");
if (newGameModalEl) {
	newGameModalEl.addEventListener("hidden.bs.modal", () => {
		if (document.activeElement) {
			document.activeElement.blur();
		}
	});
}

new History(chessConsole);
new HistoryControl(chessConsole);
new CapturedPieces(chessConsole);
new StockfishGameControl(chessConsole, {
	player: chessConsole.opponent,
});
new StockfishStateView(chessConsole, chessConsole.opponent);
new GameStateOutput(chessConsole);
new Sound(chessConsole, {
	soundSpriteFile: "./assets/sounds/chess_console_sounds.mp3",
});

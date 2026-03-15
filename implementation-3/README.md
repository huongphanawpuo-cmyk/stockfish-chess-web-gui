# Stockfish Web GUI - By BoldChess

A modern, responsive web-based GUI for the Stockfish chess engine, powered by `cm-chessboard`, `chess-console`, and `Bun`.

## Features

- **Stockfish 17+ Integration**: Runnable directly in the browser using WebAssembly.
- **Advanced Analysis**:
  - Multi-threaded analysis (requires COOP/COEP).
  - Customizable **Skill Level** (1-20) and **Depth** (1-36).
  - Right-click annotations (arrows and markers).
  - Real-time evaluation and principal variation display.
- **User-Friendly Interface**:
  - Clean, responsive design using Bootstrap 5.
  - "Clear Annotations" button for easy board cleanup.
  - Automatic annotation clearing on legal moves.
  - FEN string support for setting up custom positions.
- **Save & Load**: Automatically saves game state and settings to local storage.

## Tech Stack

- **Bun**: Fast runtime, package manager, and native bundler.
- **Biome**: Ultra-fast linter and formatter.
- **cm-chessboard**: Local chessboard visualization.
- **chess-console**: Game logic and state management.
- **Stockfish.js / cm-engine-runner**: Chess engine abstraction.
- **Bootstrap 5**: UI styling.

## Installation & Development

1. **Install dependencies:**

    ```bash
    bun install
    ```

2. **Start the development server:**

    ```bash
    bun run dev
    ```

    Open your browser at `http://localhost:3000`. This command runs the Bun bundler in watch mode and serves the application via `server.js`.

3. **Build for production:**

    ```bash
    bun run build
    ```

    The optimized output will be in the `dist` directory, and all necessary assets will be copied automatically.

## Security Requirements

Stockfish 17.1 uses multi-threaded WebAssembly, which requires **SharedArrayBuffer**. For security reasons, browsers only enable this feature if the page is cross-origin isolated.

This project includes a custom `server.js` that provides the necessary headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

Ensure your production hosting environment also provides these headers, otherwise the engine may fail to initialize or run in single-threaded mode.

## Configuration

Core configuration constants can be found in `src/Config.js`.

- **Default Skill Level**: 20
- **Default Depth**: 16
- **Engine Path**: `/engine/`

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**. See the `LICENSE` file for details.

---

*Verified and maintained by BoldChess.com | This is a project by Labinator.com*

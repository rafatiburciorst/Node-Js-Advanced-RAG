# Embeddings Advanced

This project demonstrates how to use the LangChain library to process and embed text from PDF documents using OpenAI's GPT-4 model.

## Prerequisites

- Node.js
- pnpm (or npm/yarn)
- OpenAI API Key
- Docker (for running the Chroma database)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd embeddings-advanced
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
    ```sh
    OPENAI_API_KEY=your_openai_api_key
    ```

4. Run docker-compose to start the Chroma database:
    ```sh
    docker-compose up -d
    ```

## Usage

To run the script in development mode, use the following command:
```sh
pnpm run dev
```

## Project Structure
src/index.ts: Main script that loads a PDF, splits its text, and processes it using LangChain and OpenAI.
package.json: Contains project metadata and dependencies.
.env: Environment variables (not included in the repository, create your own based on .env.example).

## Dependencies
@langchain/community: Community utilities for LangChain.
@langchain/core: Core utilities for LangChain.
@langchain/openai: OpenAI integration for LangChain.
chromadb: Chroma database for vector storage.
pdf-parse: Library to parse PDF documents.

## License
This project is licensed under the ISC License.
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { InMemoryStore } from "@langchain/core/stores";
import {
	RunnablePassthrough,
	RunnableSequence,
} from "@langchain/core/runnables";

const llm = new ChatOpenAI({
	model: "gpt-4o-mini",
	maxTokens: 500,
	apiKey: process.env.OPENAI_API_KEY,
});

const SOURCE = "./DOC-SF238339076816-20230503.pdf";

const embedding = new OpenAIEmbeddings({
	model: "text-embedding-3-small",
});

const loader = new PDFLoader(SOURCE, {
	splitPages: true,
});

const docs = await loader.load();

const parentSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 5000,
	chunkOverlap: 200,
});

const childSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 200,
	chunkOverlap: 0,
});

const store = new InMemoryStore();

// Flag para determinar se novos vetores devem ser criados
const shouldCreateNewVectors = false;

// Função para criar o vetor e armazená-lo
async function createVectorStore() {
	const vectorStore = new Chroma(embedding, {
		collectionName: "a-test-collection",
	});
	await vectorStore.addDocuments(docs);
	return vectorStore;
}

// Reutilização ou criação do vectorStore com base na flag
let vectorStore: Chroma;
if (shouldCreateNewVectors) {
	console.log("Criando novos vetores...");
	vectorStore = await createVectorStore();
} else {
	console.log("Usando vetores já existentes...");
	vectorStore = new Chroma(embedding, {
		collectionName: "a-test-collection",
	});
}

const parentDocumentRetriever = new ParentDocumentRetriever({
	vectorstore: vectorStore,
	childSplitter,
	parentSplitter,
	byteStore: store,
});

if (shouldCreateNewVectors) {
	await parentDocumentRetriever.addDocuments(docs, {
		ids: undefined,
	});
}

const promptTemplate = ChatPromptTemplate.fromTemplate(`
  Você é um especialista em legislação de tecnologia. Responda a pergunta abaixo utiliando contexto informado.
  
  Query: 
  {question}
  
  Context: 
  {context}
`);

const parentChainRetriever = RunnableSequence.from([
	{ context: parentDocumentRetriever, question: new RunnablePassthrough() },
	promptTemplate,
	llm,
	new StringOutputParser(),
]);

const result = await parentChainRetriever.invoke(
	"Como a nova lei pode afetar minha empresa?",
);

console.log(result);

import { pipeline } from "@xenova/transformers";
import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();

app.use(express.json());
const prisma = new PrismaClient();

const generateEmbeddings = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

const getEmbedding = async (text: string) => {
  const output1 = await generateEmbeddings(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output1.data);
};

function formatArrayForVector(arr: number[]): string {
  return `[${arr.join(",")}]`;
}

app.post("/", async (req, res) => {
  const { id, content } = req.body;
  const temp = await getEmbedding(content);
  const data = await formatArrayForVector(temp);

  // const vectorEmbedding = JSON.stringify(temp);

  const result = await prisma.$executeRaw`
  INSERT INTO "Document" (id, content, embedding) 
  VALUES (${id},${content},${data}::vector)
`;
  console.log("result", result);

  // Fetch the created document
  let createdDoc: any;
  createdDoc = await prisma.$queryRaw`
    SELECT id, content, "createdAt"
    FROM "Document"
    WHERE content = ${content}
    ORDER BY id DESC
    LIMIT 1
    `;

  res.status(201).json({
    data: createdDoc[0],
  });
});

app.get("/", async (req, res) => {
  const { content } = req.body;

  const embedding = await getEmbedding(content);
  const arrayLiteral = formatArrayForVector(embedding)

  const results = await prisma.$queryRaw`
  SELECT 
    id, 
    content, 
    1 - (embedding <=> ${arrayLiteral}::vector(384)) as similarity
  FROM "Document"
  WHERE 1 - (embedding <=> ${arrayLiteral}::vector(384)) > 0.8
  ORDER BY similarity DESC
  LIMIT 5
`;

console.log('result', results)


});

app.listen(3001, () => {
  console.log("server started");
});

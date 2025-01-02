import { pipeline } from "@xenova/transformers";
import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();

app.use(express.json());
const prisma = new PrismaClient();

app.post("/", async (req, res) => {
  const { id, content } = req.body;
  const temp = await getEmbedding(content);

  console.log('temp', temp)

  const vectorEmbedding = JSON.stringify(temp);

  console.log('vector', vectorEmbedding)

  // Insert embeddings into DB
  // await prisma.$executeRaw`INSERT INTO "Document" (vector) VALUES (${vectorEmbedding}::vector)`;

  const result = await prisma.$executeRaw`
  INSERT INTO "Document" (id, content, embedding) 
  VALUES (${id},${content},${vectorEmbedding}::vector)
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

  console.log("temp", createdDoc[0]);

  res.status(201).json({
    data: createdDoc[0],
  });
});

const generateEmbeddings = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

function dotProduct(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error("Both arguments must have the same length");
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }

  return result;
}

const getEmbedding = async (text: string) => {
  const output1 = await generateEmbeddings(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output1.data);
};

// const output2 = await generateEmbeddings("That is a happy person", {
//   pooling: "mean",
//   normalize: true,
// });

//@ts-ignore
// const similarity = dotProduct(output1.data, output2.data);

// console.log(similarity);

app.listen(3000, () => {
  console.log("server started");
});

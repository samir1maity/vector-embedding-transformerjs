import { pipeline } from "@xenova/transformers";
import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();

app.use(express.json());
const prisma = new PrismaClient();

app.post("/", async (req, res) => {
  const { id, content } = req.body;
  const temp = await prisma.document.create({
    data: {
      id,
      content,
    },
  });

  console.log("temp", temp);

  res.status(201).json({
    temp,
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

const getEmbeddinf = async () => {
  const output1 = await generateEmbeddings("That is a happy person", {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output1.data)
}







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

import * as nearAPI from "near-api-js";
import { MongoClient } from "mongodb";

require("dotenv").config();

const client = new MongoClient(process.env.DATABASE_URL as string);

const provider = new nearAPI.providers.JsonRpcProvider({
  url: process.env.NEAR_RPC_API as string,
});
const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS as string;

const relatedToThisContract = (transaction: any) => {
  if (contractAddress.includes(transaction.receiver_id)) {
    return true;
  }
  return false;
};

let latestBlockHeight = 0;

try {
  async () => await client.connect();
  const db = client.db("potlock");

  const collection = db.collection("donate");
  setInterval(async () => {
    try {
      const latestBlock = await provider.block({ finality: "optimistic" });
      const height = latestBlock.header.height;
      if (height === latestBlockHeight) {
        return;
      }
      latestBlockHeight = height;
      console.log(latestBlockHeight);
      const chunks = latestBlock.chunks;
      // console.log(chunks);

      for (const chunk of chunks) {
        const chunkTemp = await provider.chunk(chunk.chunk_hash);
        const transactions = chunkTemp.transactions;

        if (transactions.length > 0) {
          for (const transaction of transactions) {
            //claim bounty
            if (relatedToThisContract(transaction)) {
              // console.log(JSON.stringify(transaction));
              if (
                transaction.actions[0].FunctionCall?.method_name == "donate"
              ) {
                // insert DB
                console.log(transaction);
                try {
                  const result = await collection.insertOne({
                    transaction: JSON.stringify({ transaction }),
                  });
                  // console.log("result", result);
                  console.log(result);
                } catch (error: any) {
                  console.log(error.message);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error Processing Block:", error);
    }
  }, 2000);
} finally {
  async () => await client.close();
}

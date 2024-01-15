import * as nearAPI from "near-api-js";
import { MongoClient } from "mongodb";

require("dotenv").config();

const client = new MongoClient(process.env.DATABASE_URL );

const provider = new nearAPI.providers.JsonRpcProvider({
  url: process.env.NEAR_RPC_API ,
});
const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS ;

const relatedToThisContract = (transaction) => {
  if (contractAddress.includes(transaction.receiver_id)) {
    return true;
  }
  return false;
};

let latestBlockHeight = 0;

try {
  async () => await client.connect();
  const db = client.db("potlock");

  const collection = db.collection("registry");
  setInterval(async () => {
    try {
      const latestBlock = await provider.block({ finality: "optimistic" });
      // const latestBlock = await provider.block({ blockId: 
      //   110478286 });
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
            // console.log(JSON.stringify(transaction));
            //claim bounty
            if (relatedToThisContract(transaction)) {
              try {
                // console.log(transaction);
                // console.log(transaction.actions[0].FunctionCall.method_name)
                // console.log(JSON.parse(atob(transaction.actions[0].FunctionCall.args)))
              } catch (e) {}

              if (
                transaction.actions[0].FunctionCall?.method_name == "register"
              ) {
                try {
                  console.log(transaction);
                  const result = await collection.insertOne({
                    transaction: JSON.stringify(transaction),
                  });
                  console.log(result);
                } catch (error) {
                  console.log(error.message);
                }
                // insert DB
              }
              // if (
              //   transaction.actions[0].FunctionCall?.method_name ==
              //   "delete_project"
              // ) {
              //   console.log(transaction);
              //   let argument = JSON.parse(
              //     atob(transaction.actions[0].FunctionCall.args)
              //   );
              //   console.log(argument);
              //   // insert DB
              // }
              // if (
              //   transaction.actions[0].FunctionCall?.method_name ==
              //   "update_project"
              // ) {
              //   console.log(transaction);
              //   let argument = JSON.parse(
              //     atob(transaction.actions[0].FunctionCall.args)
              //   );
              //   console.log(argument);
              //   // insert DB
              // }
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

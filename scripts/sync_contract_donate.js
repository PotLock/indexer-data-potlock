const nearAPI = require("near-api-js");
const   {MongoClient}  = require("mongodb");
const { getDonationsForRecipient, getProjectById, getSingleTotalContributedProject, getTagOfProjectById} = require ('./crawls/flow_project_tab')

require("dotenv").config();

const client = new MongoClient(process.env.DATABASE_URL );

const provider = new nearAPI.providers.JsonRpcProvider({
  url: process.env.NEAR_RPC_API ,
});
const contractAddress = process.env.DONATE_CONTRACT_ADDRESS ;

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

  const collection = db.collection("donation");
  setInterval(async () => {
    try {
      const latestBlock = await provider.block({ finality: "optimistic" });
      // const latestBlock = await provider.block({ blockId: 110715363 });	
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
            if (relatedToThisContract(transaction)) {
              if (
                transaction.actions[0].FunctionCall?.method_name == "donate"
                ) {
                  const recipient = JSON.parse(atob(transaction.actions[0].FunctionCall?.args))
                  await getDonationsForRecipient(recipient?.recipient_id)
                  await getSingleTotalContributedProject(recipient?.recipient_id)
                  console.log(`inserted new donation with recipient_id: ${recipient?.recipient_id}`)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error Processing Block:", error);
    }
  }, 2000);
} catch (error) {
  console.error("Error Processing Block:", error);
}

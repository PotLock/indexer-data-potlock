const { providers } = require("near-api-js");
const provider = new providers.JsonRpcProvider("https://rpc.mainnet.near.org");
const { MongoClient } = require("mongodb");
const Big  = require("big.js");
const axios = require("axios");
require("dotenv").config();

const client = new MongoClient(process.env.DATABASE_URL);

async function getPots() {
  try {
    await client.connect();
    const db = client.db("potlock");
    const collection = db.collection("pots");

    const rawResult = await provider.query({
      request_type: "call_function",
      account_id: "potfactory2.tests.potlock.near",
      method_name: "get_pots",
      args_base64:"e30=",
      finality: "optimistic",
    });

    // format result
    const res = JSON.parse(Buffer.from(rawResult.result).toString());

    // console.log(res)

    const allPot = await Promise.all( res.map( async (pot) => {
      const rawPotDetail = await provider.query({
        request_type: "call_function",
        account_id: `${pot?.id}`,
        method_name: "get_config",
        args_base64:"e30=",
        finality: "optimistic",
      });
      const potDetail = JSON.parse(Buffer.from(rawPotDetail.result).toString());

      return {
        pot_id: pot?.id,
        owner: potDetail?.owner,
        admins: potDetail?.admins,
        chef: potDetail?.chef,
        pot_name: potDetail?.pot_name,
        pot_description: potDetail?.pot_description,
        application_start_ms: potDetail?.application_start_ms,
        application_end_ms: potDetail?.application_end_ms,
        public_round_start_ms: potDetail?.public_round_start_ms,
        public_round_end_ms: potDetail?.public_round_end_ms,
        min_matching_pool_donation_amount: potDetail?.min_matching_pool_donation_amount,
        base_currency: potDetail?.base_currency,
        matching_pool_balance: potDetail?.matching_pool_balance,
        total_public_donations: potDetail?.total_public_donations,
        registry_provider: potDetail?.registry_provider,
        public_donations_count:  potDetail?.public_donations_count,
        cooldown_end_ms: potDetail?.cooldown_end_ms,
        all_paid_out: potDetail?.all_paid_out,
        deployed_at_ms: pot?.deployed_at_ms,
        totalDonation: +fromIndivisible(potDetail?.total_public_donations),
        totalMatchingPool: +fromIndivisible(potDetail?.matching_pool_balance)
      }
    }))

    // await collection.insertMany(allPot);
    console.log("Success! Pots inserted successfully!");

    return;
  } catch (error) {
    console.error("Error Insert Data:", error);
    throw new Error(error);
  } finally {
    await client.close();
  }
}

function fromIndivisible (amount, decimals) {
  return new Big(amount)
    .div(Big(10).pow(24))
    .toFixed(decimals || 2)
}

module.exports = {};
getPots();

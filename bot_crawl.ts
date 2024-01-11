// Objective:

// - To develop a Telegram bot that monitors heroes.build
// - The bot should automatically track and only report new bounties as they are created and when they are completed.

// Key Features of the Bot:

// - New Bounty Alerts: The bot should send a notification whenever a new bounty is posted on the platform.
// - Completion Alerts: The bot x`should send a notification when a bounty is marked as completed.
// - Message Content: Each alert must include comprehensive details of the bounty:
// + Type and tags of the bounty
// + Title of the bounty
// + Owner of the bounty
// + Deadline
// + Description of the task.
// + How many people wanted & Bounty amount // {\"OneForAll\":{\"number_of_slots\":10,\"amount_per_slot\":\"100000
// + Advanced setting features: KYC, Whitelist, Invoice, Reviewer
// + Link to the bounty for more details.
// - Message Clarity: Messages delivered by the bot should be coherent, easy to understand, and well-structured.
// bounty_done : user - how much they claim - title
// Smart contact address: bounties.heroes.build

import { session, Telegraf, Context } from "telegraf";
import * as nearAPI from "near-api-js";
import axios from "axios";
const removeMd = require("remove-markdown");

require("dotenv").config();

const provider = new nearAPI.providers.JsonRpcProvider({
  url: process.env.NEAR_RPC_API as string,
});
const hero_bounty_address = process.env.HERO_BOUNTY_ADDRESS as string;

const bounty_process = (transaction: any) => {
  if (hero_bounty_address.includes(transaction.receiver_id)) {
    return true;
  }
  return false;
};

const create_new_bounty = (transaction: any) => {
  if (
    transaction.receiver_id == process.env.USDT_ADDRESS ||
    transaction.receiver_id == process.env.USDC_ADDRESS ||
    transaction.receiver_id == process.env.DAI_ADDRESS ||
    transaction.receiver_id == process.env.XP_ADDRESS
  ) {
    const action = JSON.parse(atob(transaction.actions[0].FunctionCall.args));
    if (action && action.receiver_id == hero_bounty_address) {
      return true;
    }
  }
  return false;
};

// const bot = new Telegraf(process.env.BOT_TOKEN as string);

let latestBlockHeight = 0;
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
          // console.log(JSON.stringify(transaction));
          console.log({ ...transaction, actions: [...transaction.actions] });

          // console.log(transaction.actions[0].FunctionCall?.method_name);
          //claim bounty
          if (bounty_process(transaction)) {
            // console.log(JSON.stringify(transaction));

            if (
              transaction.actions[0].FunctionCall?.method_name == "get_projects"
            ) {
              console.log(transaction);
            }
            // if (
            //   transaction.actions[0].FunctionCall.method_name == "bounty_action"
            // ) {
            //   const result: any = await provider.txStatus(
            //     transaction.hash,
            //     transaction.receiver_id
            //   );
            //   let amount = "";
            //   let stable_USD = "";
            //   let id = JSON.parse(
            //     atob(transaction.actions[0].FunctionCall.args)
            //   ).id;

            //   result.receipts_outcome.forEach((element: any) => {
            //     if (element.outcome.logs[0]?.includes("Transfer")) {
            //       amount =
            //         parseInt(element.outcome.logs[0].split(" ")[1]) / 1e6 + "";
            //       stable_USD =
            //         element.outcome.executor_id == "usdt.fakes.testnet"
            //           ? "USDT.e"
            //           : transaction.receiver_id == "usdc.fakes.testnet"
            //           ? "USDC.e"
            //           : transaction.receiver_id == "dai.fakes.testnet"
            //           ? "DAI"
            //           : transaction.receiver_id == "rep.heroe.testnet"
            //           ? "XREP"
            //           : "unknown";
            //     }
            //   });

            //   //   const { data } = await axios<any>(
            //   //     `https://${process.env.HOST_URL}/api/bounty/transactions?bountyId=${id}`
            //   //   );
            //   //   const title = JSON.parse(JSON.parse(data[0].args).msg).metadata
            //   //     .title;

            //   //   await bot.telegram.sendMessage(
            //   //     process.env.CHANNEL_ID as string,
            //   //     `🎉<b>Congratulations ! </b>\n ` +
            //   //       `<b>Hunter ${transaction.signer_id}</b> \n\n` +
            //   //       `- <b>Claimed:</b> $${amount}\n` +
            //   //       `- <b>Paid in:</b> ${stable_USD}\n` +
            //   //       `- <b>Bounty:</b> ${title}\n\n` +
            //   //       `⏩ <a href="${`https://${process.env.HOST_URL}/bounties/bounty/${id}`}">https://${
            //   //         process.env.HOST_URL
            //   //       }/bounties/bounty/${id}</a>`,
            //   //     { parse_mode: "HTML", disable_web_page_preview: true }
            //   //   );
            // }
          }
          // if (create_new_bounty(transaction)) {
          //   const result: any = await provider.txStatus(
          //     transaction.hash,
          //     transaction.receiver_id
          //   );

          //   const status = atob(result.status.SuccessValue);
          //   let id = null;
          //   if (status !== '"0"') {
          //     result.receipts_outcome.forEach((element: any) => {
          //       if (element.outcome.logs[0]?.includes("index")) {
          //         id = element.outcome.logs[0]
          //           .split("index")[1]
          //           .replace(/^\D+/g, "");
          //       }
          //     });
          //   }
          //   if (id) {
          //     const stable_USD =
          //       transaction.receiver_id == "usdt.fakes.testnet"
          //         ? "USDT.e"
          //         : transaction.receiver_id == "usdc.fakes.testnet"
          //         ? "USDC.e"
          //         : transaction.receiver_id == "dai.fakes.testnet"
          //         ? "DAI"
          //         : transaction.receiver_id == "rep.heroe.testnet"
          //         ? "XREP"
          //         : "unknown";
          //     const amount =
          //       parseInt(
          //         JSON.parse(atob(transaction.actions[0].FunctionCall.args))
          //           .amount
          //       ) /
          //         1e6 +
          //       "";
          //     const advanced_metadata = JSON.parse(
          //       JSON.parse(atob(transaction.actions[0].FunctionCall.args)).msg
          //     );
          //     const metadata = advanced_metadata.metadata;
          //     const deadline = advanced_metadata.deadline;
          //     const kyc_config = advanced_metadata.kyc_config;
          //     const reviewers = advanced_metadata.reviewers;
          //     const multitasking = advanced_metadata.multitasking;
          //     const tags = metadata.tags;
          //     let tags_element = "";
          //     if (tags.length > 1) {
          //       const Tagspop = tags.pop();
          //       tags_element = tags.join(", ") + " and " + Tagspop;
          //     } else {
          //       tags_element = tags[0];
          //     }
          //     let multitasking_element = "";
          //     if (multitasking) {
          //       if (multitasking?.OneForAll) {
          //         multitasking_element =
          //           "<b>Share: </b>$" +
          //           parseInt(multitasking.OneForAll.amount_per_slot) / 1e6 +
          //           ` ${stable_USD} per ${multitasking.OneForAll.number_of_slots} Hunter \n`;
          //       }
          //     }
          //     // let reviewers_element = "";
          //     // if(reviewers){
          //     // 	if(reviewers.MoreReviewers?.more_reviewers){
          //     // 		reviewers_element='<b>⏩ REVIEWER:</b>\n\n'
          //     // 		reviewers.MoreReviewers.more_reviewers.forEach((element : string) => {
          //     // 			reviewers_element =reviewers_element + "- " + element+"\n"
          //     // 		});
          //     // 		reviewers_element = reviewers_element +"\n"
          //     // 	}

          //     // }
          //     const claimer_approval = advanced_metadata.claimer_approval;
          //     let claimer_approval_element = "";
          //     if (claimer_approval) {
          //       if (
          //         claimer_approval?.WhitelistWithApprovals?.claimers_whitelist
          //       ) {
          //         claimer_approval_element = "<b>Whitelist:</b> <i>Yes</i>\n";
          //         // claimer_approval.WhitelistWithApprovals.claimers_whitelist.forEach((element : string) => {
          //         // 	claimer_approval_element = claimer_approval_element + element +'\n'
          //         // });
          //       }
          //       if (claimer_approval?.ApprovalByWhitelist?.claimers_whitelist) {
          //         claimer_approval_element = "<b>Whitelist:</b> <i>Yes</i>\n";
          //         // claimer_approval.ApprovalByWhitelist.claimers_whitelist.forEach((element : string) => {
          //         // 	claimer_approval_element = claimer_approval_element + element +'\n'
          //         // });
          //       }
          //     } else {
          //       claimer_approval_element = "<b>Whitelist: <i>No</i></b>\n";
          //     }

          //     //   const kyc_config_element =
          //     //     kyc_config == "KycNotRequired"
          //     //       ? "<b>KYC required:</b><i>No</i>"
          //     //       : "<b>KYC required:</b><i>Yes</i>"; //kyc_config.KycRequired.kyc_verification_method == 'DuringClaimApproval' ? '- <b>KYC:</b> After\n' : kyc_config.KycRequired.kyc_verification_method == 'WhenCreatingClaim' ? '- <b>KYC:</b> Before \n' : '';
          //     //   const deadline_element =
          //     //     deadline == "WithoutDeadline"
          //     //       ? ""
          //     //       : `<b>Deadline: </b> <i>${new Date(
          //     //           parseInt(deadline?.DueDate.due_date) / 1000000
          //     //         ).toLocaleString("en-US", {
          //     //           year: "numeric",
          //     //           month: "long",
          //     //           day: "numeric",
          //     //         })}</i>\n`;
          //     //   const contact_element_url =
          //     //     metadata.contact_details.contact_type == "Telegram"
          //     //       ? `https://t.me/${metadata.contact_details.contact}`
          //     //       : metadata.contact_details.contact_type == "Discord"
          //     //       ? `https://discord.com/users/${metadata.contact_details.contact}`
          //     //       : metadata.contact_details.contact_type == "Twitter"
          //     //       ? `https://twitter.com/${metadata.contact_details.contact}`
          //     //       : metadata.contact_details.contact_type == "Email"
          //     //       ? metadata.contact_details.contact_type
          //     //       : "Unknown";
          //     //   await bot.telegram.sendPhoto(
          //     //     process.env.CHANNEL_ID as string,
          //     //     { source: "./new_bounty.jpg" },
          //     //     {
          //     //       caption:
          //     //         `<b>🚀 NEW ${metadata.category.toLocaleUpperCase()} BOUNTY AVAILABLE!</b>\n` +
          //     //         `By ${transaction.signer_id}\n` +
          //     //         `${new Date().toLocaleString("en-US", {
          //     //           year: "numeric",
          //     //           month: "long",
          //     //           day: "numeric",
          //     //         })}\n\n` +
          //     //         `<b>${metadata.title.toUpperCase()}\n </b>` +
          //     //         `<i>${removeMd(metadata.description).slice(0, 200)}${
          //     //           removeMd(metadata.description).length > 203 ? "..." : ""
          //     //         }</i>\n\n` +
          //     //         `<b>DETAILS</b>\n` +
          //     //         //`- <b>Paid in: </b> ${stable_USD}\n`+
          //     //         `<b>Total: </b> <i>$${amount} ${stable_USD}</i>\n` +
          //     //         `${multitasking_element}` +
          //     //         `${deadline_element}` +
          //     //         `<b>contact:</b> <a href="${contact_element_url}">${contact_element_url}</a>\n` +
          //     //         `\n` +
          //     //         `<b>REQUIREMENTS</b>\n` +
          //     //         `<b>Skill Level:</b> <i>${metadata.experience}</i> \n` +
          //     //         `<b>Skills needed:</b> <i>${tags_element}</i>\n` +
          //     //         `<b>Acceptance criteria:</b> <i>${metadata.acceptance_criteria}</i>\n` +
          //     //         `${kyc_config_element}\n` +
          //     //         `\n` +
          //     //         `${claimer_approval_element}` +
          //     //         //`${reviewers_element}` +
          //     //         `\n` +
          //     //         `<b>🔽  BOUNTY LINK 🔽</b>\n` +
          //     //         `<a href="${`https://${process.env.HOST_URL}/bounties/bounty/${id}`}">https://${
          //     //           process.env.HOST_URL
          //     //         }/bounties/bounty/${id}</a>`,
          //     //       parse_mode: "HTML",
          //     //     }
          //     //   );
          //   }
          // }
        }
      }
    }
  } catch (error) {
    console.error("Error Processing Block:", error);
  }
}, 500);

// bot.use(session());

// bot.launch();

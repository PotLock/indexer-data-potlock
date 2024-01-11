"use strict";
// Objective:
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var nearAPI = require("near-api-js");
var removeMd = require("remove-markdown");
require("dotenv").config();
var provider = new nearAPI.providers.JsonRpcProvider({
    url: process.env.NEAR_RPC_API,
});
var hero_bounty_address = process.env.HERO_BOUNTY_ADDRESS;
var bounty_process = function (transaction) {
    if (hero_bounty_address.includes(transaction.receiver_id)) {
        return true;
    }
    return false;
};
var create_new_bounty = function (transaction) {
    if (transaction.receiver_id == process.env.USDT_ADDRESS ||
        transaction.receiver_id == process.env.USDC_ADDRESS ||
        transaction.receiver_id == process.env.DAI_ADDRESS ||
        transaction.receiver_id == process.env.XP_ADDRESS) {
        var action = JSON.parse(atob(transaction.actions[0].FunctionCall.args));
        if (action && action.receiver_id == hero_bounty_address) {
            return true;
        }
    }
    return false;
};
// const bot = new Telegraf(process.env.BOT_TOKEN as string);
var latestBlockHeight = 0;
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var latestBlock, height, chunks, _i, chunks_1, chunk, chunkTemp, transactions, _a, transactions_1, transaction, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                return [4 /*yield*/, provider.block({ finality: "optimistic" })];
            case 1:
                latestBlock = _c.sent();
                height = latestBlock.header.height;
                if (height === latestBlockHeight) {
                    return [2 /*return*/];
                }
                latestBlockHeight = height;
                console.log(latestBlockHeight);
                chunks = latestBlock.chunks;
                _i = 0, chunks_1 = chunks;
                _c.label = 2;
            case 2:
                if (!(_i < chunks_1.length)) return [3 /*break*/, 5];
                chunk = chunks_1[_i];
                return [4 /*yield*/, provider.chunk(chunk.chunk_hash)];
            case 3:
                chunkTemp = _c.sent();
                transactions = chunkTemp.transactions;
                if (transactions.length > 0) {
                    for (_a = 0, transactions_1 = transactions; _a < transactions_1.length; _a++) {
                        transaction = transactions_1[_a];
                        // console.log(JSON.stringify(transaction));
                        console.log(__assign(__assign({}, transaction), { actions: __spreadArray([], transaction.actions, true) }));
                        // console.log(transaction.actions[0].FunctionCall?.method_name);
                        //claim bounty
                        if (bounty_process(transaction)) {
                            // console.log(JSON.stringify(transaction));
                            if (((_b = transaction.actions[0].FunctionCall) === null || _b === void 0 ? void 0 : _b.method_name) == "get_projects") {
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
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_1 = _c.sent();
                console.error("Error Processing Block:", error_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); }, 500);
// bot.use(session());
// bot.launch();

import { Injectable } from '@nestjs/common';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { RedisService } from 'src/redis/redis.service';
import axios from 'axios';
import { Request } from 'express';

@Injectable()
export class FeedService {
  constructor(private redisService: RedisService) {}

  listAccount = [
    'magicbuild.near',
    'proofofvibes.near',
    'herdao.near',
    'nearimpact.near',
    'colds.near',
    'wuipod.near',
    'opact_near.near',
    'potlock.near',
    'near-africa.near',
    'genadrop.near',
    'daoashe.near',
    'fradao.near',
    'discoverbos.near',
    'minorityprogrammers.near',
    'nearvietnamhub.near',
    'labsdao.near',
    'ludium.near',
    'opencann.near',
    'chess-game.near',
    'nearnftwg.near',
    'evrything.near',
    'openwebacademy.near',
    'mintickt.near',
    'fastui.near',
    'dedeukwushryne.near',
    'nearukraineguild.near',
    'sharddog.near',
    'chatafisha.near',
    'dedeukwu.near',
    'grift.near',
    'build.sputnik-dao.near',
    'noondao.near',
    'refitanzania.near',
    'boneyardgaming.near',
    'blunt.sputnik-dao.near',
    'marmaj.sputnik-dao.near',
    'viaprize.near',
    'marketingdaoers.near',
    'bosmobile.near',
    'kanoisbos.near',
    'mentalmaze.near',
    'questverse.sputnik-dao.near',
    'validator-support.sputnik-dao.near',
    'creativesdao.sputnik-dao.near',
    'eventsdao.near',
    'bosnouns.near',
    'cryptocoatl.near',
    'nearblocks.near',
    'nadabot.near',
    'shitzu.sputnik-dao.near',
    'africablockchaininstitute.near',
    'onboarddao.sputnik-dao.near',
    'research-collective.sputnik-dao.near',
    'near-india.near',
    'refoundlabs.near',
    'refimexico.near',
    'publicgoodspodcast.near',
    'mexicohub.near',
    'buidlersclub.near',
    'archetype-org.near',
    'cplanet.near',
    'bos.questverse.near',
    'timothyavery.near',
    '40acresdao.near',
    'communitynodes.near',
    'hipopula.near',
    'zomland.near',
  ];

  async getFeedDetail(req: Request) {
    try {
      const { account: accountId, limit, from } = req?.query;

      const accountIdRequest = accountId ? [accountId] : this.listAccount;

      // check if cache exist
      const redisClient = this.redisService.getRedisClient();

      // feed index detail
      const feedBlockHeightRequestData = {
        action: 'post',
        key: 'main',
        options: {
          limit: +limit || 30,
          order: 'desc',
          accountId: accountIdRequest,
          from: +from || '',
        },
      };
      const feedBlockHeightResult = await axios.post(
        'https://api.near.social/index',
        feedBlockHeightRequestData,
      );

      const feedBlockHeight = feedBlockHeightResult.data;

      const listFeedDetail = await Promise.all(
        feedBlockHeight?.map(async (feed) => {
          // get blockHeight
          const blockHeight = feed?.blockHeight;

          // check if feed has cache
          const cachedFeedData = await redisClient.get(
            `api:${feed.accountId}:feed:${blockHeight}`,
          );

          if (cachedFeedData) {
            return JSON.parse(cachedFeedData);
          }

          // feed detail
          const feedDetailRequestData = {
            keys: [`${feed.accountId}/post/main`],
            blockHeight: blockHeight,
          };
          const feedDetailResult = await axios.post(
            'https://api.near.social/get',
            feedDetailRequestData,
          );

          const feedDetail = feedDetailResult.data;

          const feedPost = feedDetail
            ? feedDetail[feed.accountId as string]?.post?.main
            : null;

          // feed like
          const feedLikeRequestData = {
            action: 'like',
            key: {
              type: 'social',
              path: `${feed.accountId}/post/main`,
              blockHeight: blockHeight,
            },
          };
          const feedLikeResult = await axios.post(
            'https://api.near.social/index',
            feedLikeRequestData,
          );

          const feedLikeCount = feedLikeResult?.data.length;

          //feed comment
          const feedCommentRequestData = {
            action: 'comment',
            key: {
              type: 'social',
              path: `${feed.accountId}/post/main`,
              blockHeight: blockHeight,
            },
            options: {
              limit: 30,
              order: 'desc',
              subscribe: false,
            },
          };
          const feedCommentResult = await axios.post(
            'https://api.near.social/index',
            feedCommentRequestData,
          );

          const feedCommentCount = feedCommentResult?.data.length;

          //feed repost
          const feedRepostRequestData = {
            action: 'repost',
            key: 'main',
            options: {
              limit: 30,
              order: 'desc',
              accountId: [feed.accountId],
            },
          };
          const feedRepostResult = await axios.post(
            'https://api.near.social/index',
            feedRepostRequestData,
          );

          const feedRepostCount = feedRepostResult?.data.length;

          //feed time
          const feedTimeResult = await axios.get(
            `https://api.near.social/time?blockHeight=${blockHeight}`,
          );

          const feedTime = feedTimeResult.data;

          // feed profile
          const feedProfileRequestData = {
            keys: [
              `${feed.accountId}/profile/name`,
              `${feed.accountId}/profile/image/*`,
            ],
            options: {
              values_only: true,
            },
          };
          const feedProfileResult = await axios.post(
            'https://api.near.social/get',
            feedProfileRequestData,
          );

          const name =
            feedProfileResult.data[feed.accountId]?.profile?.name || '';
          const image =
            feedProfileResult.data[feed.accountId]?.profile?.image || '';

          const feedResult = {
            feedPost,
            feedLikeCount,
            feedCommentCount,
            feedRepostCount,
            feedTime,
            blockHeight,
            accountId: feed?.accountId,
            name,
            image,
          };

          redisClient.set(
            `api:${feed.accountId}:feed:${blockHeight}`,
            JSON.stringify(feedResult),
          );
          redisClient.expire(
            `api:${feed.accountId}:feed:${blockHeight}`,
            +process.env.REDIS_TTL,
          );

          return feedResult;
        }),
      );
      return listFeedDetail;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}

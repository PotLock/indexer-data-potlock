import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { Project } from 'src/project/schemas/project.schema';
import { QueryDTO } from './dto/query-follow.dto';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<Project>,
  ) {}
  async getAccountProfileGeneral(accountId: string) {
    try {
      if (!accountId) {
        return '';
      }

      const project = await this.projectModel.findOne({
        project_id: accountId,
      });

      if (!project)
        throw new Error(`Cant find any project with id: ${accountId}`);

      // following
      const followingRequestData = {
        keys: [`${accountId}/graph/follow/*`],
        options: {
          return_type: 'BlockHeight',
          values_only: true,
        },
      };
      const followingResult = await axios.post(
        'https://api.near.social/keys',
        followingRequestData,
      );

      const following = followingResult.data;

      // followers
      const followersRequestData = {
        keys: [`*/graph/follow/${accountId}`],
        options: {
          return_type: 'BlockHeight',
          values_only: true,
        },
      };
      const followersResult = await axios.post(
        `https://api.near.social/keys`,
        followersRequestData,
      );

      const followers = followersResult.data;

      // numFollowing and numFollowers
      const numFollowing = following
        ? Object.keys(following[accountId].graph.follow || {}).length
        : null;
      const numFollowers = followers
        ? Object.keys(followers || {}).length
        : null;

      // tags
      const tagsRequestData = {
        keys: [`${accountId}/profile/tags/*`],
        options: {
          return_type: 'BlockHeight',
          values_only: true,
        },
      };
      const tagsResult = await axios.post(
        `https://api.near.social/keys`,
        tagsRequestData,
      );

      const rawTagsData = tagsResult.data;

      const tags = rawTagsData
        ? Object.keys(rawTagsData[accountId]?.profile?.tags || {})
        : null;

      // result
      const profileGeneralData = {
        numFollowing,
        numFollowers,
        profileImageUrl:
          project?.details?.image?.ipfs_cid ||
          project?.details?.image?.url ||
          '',
        bannerImageUrl:
          project?.details?.backgroundImage?.ipfs_cid ||
          project?.details?.backgroundImage?.url ||
          '',
        accountId,
        accountName: project.details?.name,
        linktree:
          {
            website: project.details?.linktree?.website
              ? project.details?.linktree?.website
              : '',
            twitter: project.details?.linktree?.twitter
              ? `https://twitter.com/${project.details?.linktree?.twitter}`
              : '',
            telegram: project.details?.linktree?.telegram
              ? project.details?.linktree?.telegram
              : '',
            github: project.details?.linktree?.github
              ? `https://github.com/${project.details?.linktree?.github}`
              : '',
            near: `https://near.social/mob.near/widget/ProfilePage?accountId=${project?.project_id}`,
          } || {},
        tags,
      };

      return profileGeneralData;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getAccountFollowing(accountId: string) {
    try {
      if (!accountId) {
        return '';
      }

      // following
      const followingRequestData = {
        keys: [`${accountId}/graph/follow/*`],
        options: {
          values_only: true,
        },
      };
      const followingResult = await axios.post(
        'https://api.near.social/get',
        followingRequestData,
      );

      const following = followingResult.data;

      // list following
      const listFollowing = following
        ? following[accountId]?.graph?.follow || {}
        : null;

      const profileFollowingData = await Promise.all(
        Object.keys(listFollowing).map(async (id) => {
          // get profile of this id
          const profileRequestData = {
            keys: [`${id}/profile/name`, `${id}/profile/image/*`],
            options: {
              values_only: true,
            },
          };

          const profileResult = await axios.post(
            `https://api.near.social/get`,
            profileRequestData,
          );

          const data = {
            id,
            name: profileResult.data[id]?.profile?.name || '',
            image: profileResult.data[id]?.profile?.image || '',
            isFollow: true,
          };

          return data;
        }),
      );

      return profileFollowingData;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getAccountFollower(accountId: string) {
    try {
      if (!accountId) {
        return '';
      }

      // follower
      const followerRequestData = {
        keys: [`*/graph/follow/${accountId}`],
        options: {
          values_only: true,
        },
      };
      const followerResult = await axios.post(
        'https://api.near.social/get',
        followerRequestData,
      );

      const follower = followerResult.data;

      // list follower
      const listFollower = follower ? follower || {} : null;

      // following
      const followingRequestData = {
        keys: [`${accountId}/graph/follow/*`],
        options: {
          values_only: true,
        },
      };
      const followingResult = await axios.post(
        'https://api.near.social/get',
        followingRequestData,
      );

      const following = followingResult.data;

      // list following
      const listFollowing = following
        ? Object.keys(following[accountId]?.graph?.follow) || []
        : null;

      // result
      const profileFollowerData = await Promise.all(
        Object.keys(listFollower).map(async (id) => {
          // get profile of this id
          const profileRequestData = {
            keys: [`${id}/profile/name`, `${id}/profile/image/*`],
            options: {
              values_only: true,
            },
          };

          const profileResult = await axios.post(
            `https://api.near.social/get`,
            profileRequestData,
          );

          const data = {
            id,
            name: profileResult.data[id]?.profile?.name || '',
            image: profileResult.data[id]?.profile?.image || '',
            isFollow: listFollowing?.includes(id) || false,
          };

          return data;
        }),
      );

      return profileFollowerData;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './schemas/project.schema';
import { Model, Query } from 'mongoose';
import { Donation } from 'src/donation/schemas/donation.schema';
import { Big } from 'big.js';
import axios from 'axios';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ProjectService {
  constructor(
    private redisService: RedisService,
    @InjectModel(Project.name)
    private projectModel: Model<Project>,
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
  ) {}

  featuredAccountId = [
    'opact_near.near',
    'sharddog.near',
    'sharddog.magicbuild.near',
    'build.sputnik-dao.near',
    'evrything.near',
    'bos.questverse.near',
  ];

  async getAllProject(req: Request) {
    try {
      const queries = { ...req.query };

      const excludeFields = ['limit', 'sort', 'page', 'fields'];
      excludeFields.forEach((el) => delete queries[el]);

      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`,
      );
      let formatQueries = JSON.parse(queryString);

      //Filtering
      if (queries?.title) {
        formatQueries['details.name'] = {
          $regex: queries.title,
          $options: 'i',
        };
        delete formatQueries?.title;
      }

      //Sorting
      let sortBy = {};
      if (req.query.sort && typeof req.query.sort === 'string') {
        sortBy = req.query.sort.split(',').join(' ');
      }

      // Fields Limiting
      let fields = {};
      if (req.query.fields && typeof req.query.fields === 'string') {
        fields = req.query.fields.split(',').join(' ');
      }

      //Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
      const skip = (page - 1) * +limit;

      const allProjects = await this.projectModel
        .find(formatQueries)
        .sort(sortBy)
        .select(fields)
        .skip(skip)
        .limit(+limit)
        .catch((error) => {
          console.error(error);
          throw new Error(error.message);
        });

      const allDonations = await this.donationModel.find({});

      // const response = await axios.get(
      //   'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd',
      // );

      // const nearToUsd = response?.data?.near?.usd;

      const formattedProjects = await Promise.all(
        allProjects.map(async (project) => {
          const singleDonation = allDonations.filter(
            (donation) => donation?.recipient_id === project?.project_id,
          );

          let totalDonations = new Big('0');
          singleDonation.forEach((donation) => {
            const totalAmount = new Big(donation.total_amount);
            const referralAmount = new Big(donation.referrer_fee || '0');
            const protocolAmount = new Big(donation.protocol_fee || '0');
            totalDonations = totalDonations.plus(
              totalAmount.minus(referralAmount).minus(protocolAmount),
            );
          });

          const totalDonationsSmallerUnit = totalDonations
            .div(1e24)
            .toNumber()
            .toFixed(2);

          // const totalContributed = nearToUsd
          //   ? `$${(+totalDonationsSmallerUnit * nearToUsd).toFixed(2)}`
          //   : `${totalDonationsSmallerUnit} N`;

          const totalContributed = `${totalDonationsSmallerUnit} N`;

          const formatted = {
            id: project.id,
            project_id: project.project_id,
            name: project?.details?.name,
            description: project?.details?.description,
            profileImageUrl:
              project?.details?.image?.ipfs_cid ||
              project?.details?.image?.url ||
              '',
            bannerImageUrl:
              project?.details?.backgroundImage?.ipfs_cid ||
              project?.details?.backgroundImage?.url ||
              '',
            status: project.status,
            tags: [
              project?.details?.category?.text
                ? project?.details?.category?.text
                : '',
            ],
            totalContributed,
          };

          return formatted;
        }),
      );

      return formattedProjects;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getFeaturedProject() {
    try {
      const redisClient = this.redisService.getRedisClient();

      const cachedData = await redisClient.get('api:/project/featured');

      if (cachedData) {
        return JSON.parse(cachedData);
      }
      const allProjects = await this.projectModel.find({
        project_id: { $in: this.featuredAccountId },
      });

      const formattedProjects = await Promise.all(
        allProjects.map(async (project) => {
          const donation = await this.donationModel.find({
            recipient_id: project?.project_id,
          });

          if (!donation) return ['', '', ''];

          let totalDonations = new Big('0');
          let donors = {};
          donation.forEach((donation) => {
            const totalAmount = new Big(donation.total_amount);
            const referralAmount = new Big(donation.referrer_fee || '0');
            const protocolAmount = new Big(donation.protocol_fee || '0');
            totalDonations = totalDonations.plus(
              totalAmount.minus(referralAmount).minus(protocolAmount),
            );
            donors[donation.donor_id] = true;
          });

          const response = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd',
          );

          const nearToUsd = response?.data?.near?.usd;
          const totalDonationsSmallerUnit = totalDonations
            .div(1e24)
            .toNumber()
            .toFixed(2);

          const totalContributed = nearToUsd
            ? `$${(+totalDonationsSmallerUnit * nearToUsd).toFixed(2)}`
            : `${totalDonationsSmallerUnit} N`;

          const formatted = {
            id: project.id,
            project_id: project.project_id,
            name: project?.details?.name,
            description: project?.details?.description,
            profileImageUrl:
              project?.details?.image?.ipfs_cid ||
              project?.details?.image?.url ||
              '',
            bannerImageUrl:
              project?.details?.backgroundImage?.ipfs_cid ||
              project?.details?.backgroundImage?.url ||
              '',
            status: project.status,
            tags: [
              project?.details?.category?.text
                ? project?.details?.category?.text
                : '',
            ],
            totalContributed,
          };

          return formatted;
        }),
      );

      redisClient.set(
        'api:/project/featured',
        JSON.stringify(formattedProjects),
      );
      redisClient.expire('api:/project/featured', +process.env.REDIS_TTL);

      return formattedProjects;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getGeneral() {
    const redisClient = this.redisService.getRedisClient();

    const cachedData = await redisClient.get('api:/project/general');

    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const allDonations = await this.donationModel.find({});
    const allProjects = await this.projectModel.find({});

    if (!allDonations) return ['', '', ''];

    let totalDonations = new Big('0');
    let donors = {};
    allDonations.forEach((donation) => {
      const totalAmount = new Big(donation.total_amount);
      const referralAmount = new Big(donation.referrer_fee || '0');
      const protocolAmount = new Big(donation.protocol_fee || '0');
      totalDonations = totalDonations.plus(
        totalAmount.minus(referralAmount).minus(protocolAmount),
      );
      donors[donation.donor_id] = true;
    });

    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd',
    );

    const nearToUsd = response?.data?.near?.usd;
    const totalDonationsSmallerUnit = totalDonations
      .div(1e24)
      .toNumber()
      .toFixed(2);

    const totalContributed = nearToUsd
      ? `$${(+totalDonationsSmallerUnit * nearToUsd).toFixed(2)}`
      : `${totalDonationsSmallerUnit} N`;
    const uniqueDonors = Object.keys(donors).length;
    const donationQuantity = allDonations ? allDonations.length : '-';
    const projectQuantity = allProjects.length;

    const projectGeneral = {
      totalContributed,
      uniqueDonors,
      donationQuantity,
      projectQuantity,
    };

    redisClient.set('api:/project/general', JSON.stringify(projectGeneral));
    redisClient.expire('api:/project/general', +process.env.REDIS_TTL);

    return projectGeneral;
  }

  async getSingleDonation(accountId: string) {
    try {
      const allDonations = await this.donationModel.find({
        recipient_id: accountId,
      });

      if (!allDonations) return ['', '', ''];

      let totalDonations = new Big('0');
      allDonations.forEach((donation) => {
        const totalAmount = new Big(donation.total_amount);
        const referralAmount = new Big(donation.referrer_fee || '0');
        const protocolAmount = new Big(donation.protocol_fee || '0');
        totalDonations = totalDonations.plus(
          totalAmount.minus(referralAmount).minus(protocolAmount),
        );
      });

      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd',
      );

      const nearToUsd = response?.data?.near?.usd;
      const totalDonationsSmallerUnit = totalDonations
        .div(1e24)
        .toNumber()
        .toFixed(2);

      const totalContributed = nearToUsd
        ? `$${(+totalDonationsSmallerUnit * nearToUsd).toFixed(2)}`
        : `${totalDonationsSmallerUnit} N`;

      return totalContributed;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getProjectDetail(projectId: string) {
    try {
      const project = await this.projectModel.findById(projectId);
      const donations = await this.donationModel.find({
        recipient_id: project.project_id,
      });

      if (!project)
        throw new Error(`Cant find any project with id: ${projectId}`);
      if (!donations) return ['', '', ''];

      let totalDonations = new Big('0');
      let totalReferral = new Big('0');
      let donors = {};
      donations.forEach((donation) => {
        const totalAmount = new Big(donation.total_amount);
        const referralAmount = new Big(donation.referrer_fee || '0');
        const protocolAmount = new Big(donation.protocol_fee || '0');
        totalDonations = totalDonations.plus(
          totalAmount.minus(referralAmount).minus(protocolAmount),
        );
        totalReferral = totalReferral.plus(referralAmount);
        donors[donation.donor_id] = true;
      });

      // const response = await axios.get(
      //   'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd',
      // );

      // const nearToUsd = response?.data?.near?.usd;
      const totalDonationsSmallerUnit = totalDonations
        .div(1e24)
        .toNumber()
        .toFixed(2);
      const totalReferralFeesSmallerUnit = totalReferral
        .div(1e24)
        .toNumber()
        .toFixed(2);

      // const totalContributed = nearToUsd
      //   ? `$${(+totalDonationsSmallerUnit * nearToUsd).toFixed(2)}`
      //   : `${totalDonationsSmallerUnit} N`;
      // const totalReferralFees = nearToUsd
      //   ? `$${(+totalReferralFeesSmallerUnit * nearToUsd).toFixed(2)}`
      //   : `${totalReferralFeesSmallerUnit} N`;

      const totalContributed = `${totalDonationsSmallerUnit} N`;
      const totalReferralFees = `${totalReferralFeesSmallerUnit} N`;

      let team = [];
      if (project?.details?.team) {
        team = Object.entries(project?.details?.team).map(([address, _]) => ({
          address,
          imageUrl: `https://near.social/mob.near/widget/ProfilePage?accountId=${address}`,
        }));
      }

      const projectDetail = {
        totalContributed,
        totalReferralFees,
        name: project?.details?.name || '',
        project_id: project?.project_id || '',
        description: project?.details?.description || '',
        category:
          project?.details?.category?.text || project?.details?.category || '',
        team: team,
        profileImageUrl:
          project?.details?.image?.ipfs_cid ||
          project?.details?.image?.url ||
          '',
        bannerImageUrl:
          project?.details?.backgroundImage?.ipfs_cid ||
          project?.details?.backgroundImage?.url ||
          '',
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
        following: `https://near.social/mob.near/widget/FollowPage?accountId=${project?.project_id}&tab=following`,
        follower: `https://near.social/mob.near/widget/FollowPage?accountId=${project?.project_id}&tab=follower`,
      };

      return projectDetail;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}

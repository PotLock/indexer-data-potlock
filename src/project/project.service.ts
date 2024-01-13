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

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<Project>,
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
  ) {}

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

      const formattedProjects = allProjects.map((project) => {
        let profileImageUrl = '';
        let bannerImageUrl = '';
        if (project?.details?.image) {
          const imageUrl = this.getImageUrlFromSocialImage(
            project?.details?.image,
          );
          if (imageUrl) profileImageUrl = imageUrl;
        }
        if (project?.details?.image) {
          const imageUrl = this.getImageUrlFromSocialImage(
            project?.details?.backgroundImage,
          );
          if (imageUrl) bannerImageUrl = imageUrl;
        }
        const formatted = {
          id: project.id,
          project_id: project.project_id,
          name: project?.details?.name,
          description: project?.details?.description,
          profileImageUrl,
          bannerImageUrl,
          status: project.status,
          tags: [
            project?.details?.category?.text
              ? project?.details?.category?.text
              : '',
          ],
        };

        return formatted;
      });

      return formattedProjects;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getGeneral() {
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

    return {
      totalContributed,
      uniqueDonors,
      donationQuantity,
      projectQuantity,
    };
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

      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd',
      );

      const nearToUsd = response?.data?.near?.usd;
      const totalDonationsSmallerUnit = totalDonations
        .div(1e24)
        .toNumber()
        .toFixed(2);
      const totalReferralFeesSmallerUnit = totalReferral
        .div(1e24)
        .toNumber()
        .toFixed(2);

      const totalContributed = nearToUsd
        ? `$${(+totalDonationsSmallerUnit * nearToUsd).toFixed(2)}`
        : `${totalDonationsSmallerUnit} N`;
      const totalReferralFees = nearToUsd
        ? `$${(+totalReferralFeesSmallerUnit * nearToUsd).toFixed(2)}`
        : `${totalReferralFeesSmallerUnit} N`;

      let profileImageUrl = '';
      let bannerImageUrl = '';
      if (project?.details?.image) {
        const imageUrl = this.getImageUrlFromSocialImage(
          project?.details?.image,
        );
        if (imageUrl) profileImageUrl = imageUrl;
      }
      if (project?.details?.image) {
        const imageUrl = this.getImageUrlFromSocialImage(
          project?.details?.backgroundImage,
        );
        if (imageUrl) bannerImageUrl = imageUrl;
      }

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
        profileImageUrl,
        bannerImageUrl,
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

  getImageUrlFromSocialImage = (image) => {
    if (image?.url) {
      return image?.url;
    } else if (image?.ipfs_cid) {
      return `${process.env.IPFS_BASE_URL + image?.ipfs_cid}`;
    }
  };
}

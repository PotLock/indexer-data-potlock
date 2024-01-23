const { providers } = require("near-api-js");
const provider = new providers.JsonRpcProvider("https://rpc.mainnet.near.org");
const  {MongoClient} = require("mongodb") 
const {Big} = require("big.js")
require("dotenv").config();

const client = new MongoClient(process.env.DATABASE_URL);
  

async function getProjects() {
    try {
        await client.connect();
        const db = client.db("potlock");
        const collection = db.collection("projects");

        const rawResult = await provider.query({
            request_type: "call_function",
            account_id: "registry.potlock.near",
            method_name: "get_projects",
            args_base64: "e30=", // this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
            finality: "optimistic",
        });
    
        // format result
        const res = JSON.parse(Buffer.from(rawResult.result).toString());
        // console.log(res);
        /*
        Examples output:
            [
                {
                id: 'communitynodes.near',
                status: 'Approved',
                submitted_ms: 1704995740509,
                updated_ms: 1704995740509,
                review_notes: null
            }
            ]
        */
        
        const currentDate = new Date();

        const updatedRes = res.map(project => {
            const { id, ...rest } = project; 

            return {
                ...rest,
                project_id: project.id,
                dateCreated: currentDate,
                dateUpdated: null
              };
        })
        await collection.insertMany(updatedRes)
        console.log("Success! Project inserted successfully")

    } catch (error) {
        console.error("Error Insert Data:", error);
        throw new Error(error)
    } finally{
        await client.close()
    }

}


async function getDonations() {
    try {
        await client.connect();
        const db = client.db("potlock");
        const collectionDonation = db.collection("donations");
        const collectionProject = db.collection("projects");

        const rawResult = await provider.query({
            request_type: "call_function",
            account_id: "donate.potlock.near",
            method_name: "get_donations",
            args_base64: "e30=",// this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
            finality: "optimistic",
        });
    
        // format result
        const res = JSON.parse(Buffer.from(rawResult.result).toString());
        // console.log(res);
        /*
        Examples output:
        [{
            id: 25,
            donor_id: 'lachlan.near',
            total_amount: '100000000000000000000000',
            ft_id: 'near',
            message: null,
            donated_at_ms: 1699276940692,
            recipient_id: 'magicbuild.near',
            protocol_fee: '10000000000000000000000',
            referrer_id: null,
            referrer_fee: null
        }]
         */

        const currentDate = new Date();
        const updatedRes = res.map(donation => {

            const { id, ...rest } = donation; 
    
            return {
                ...rest,
                donate_id: donation.id,
                dateCreated: currentDate,
                dateUpdated: null
            }
        })
        
        await collectionDonation.insertMany(updatedRes)
        
        console.log("Success! Donations inserted successfully")
    } catch (error) {
        console.error("Error Insert Data:", error);
    } finally{
         await client.close()
    }
}

async function getAdmins() {
    const rawResult = await provider.query({
        request_type: "call_function",
        account_id: "registry.potlock.near",
        method_name: "get_admins",
        args_base64: "e30=",// this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
        finality: "optimistic",
    });

    // format result
    const res = JSON.parse(Buffer.from(rawResult.result).toString());
    console.log(res);
    /*
    [
    'plugrel.near',
    'ntare.near',
    'impact.sputnik-dao.near',
    'potlock.near'
    ]
     */
}

async function getDetailProject() {
    try {
        await client.connect();
        const db = client.db("potlock");
        const collection = db.collection("projects");

        const allProjects = await collection.find({}).toArray()

        for (const project of allProjects ){
            let argsBase64 = btoa(`{"keys":["${project.project_id}/profile/**"]}`);

            const rawResult = await provider.query({
                request_type: "call_function",
                account_id: "social.near",
                method_name: "get",
                args_base64: argsBase64,
                // args_base64: "eyJrZXlzIjpbIm1hZ2ljYnVpbGQubmVhci9wcm9maWxlLyoqIl19",//{"keys":["magicbuild.near/profile/**"]} // this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
                finality: "optimistic",
            });

            const res = JSON.parse(Buffer.from(rawResult.result).toString());

            detailsRawData = res[project.project_id]?.profile
            // await collection.updateOne({_id: project._id}, {$set: {
            //     details: {
            //         name : detailsRawData?.name,
            //         description: detailsRawData?.description,
            //         linktree: detailsRawData?.linktree,
            //         image: detailsRawData?.image,
            //         backgroundImage: detailsRawData?.backgroundImage,
            //         tags: detailsRawData?.tags,
            //         category: detailsRawData?.category,
            //         team: detailsRawData?.team,
            //         latest_update: Math.floor(Date.now() / 1000),
            //     },
            //     dateUpdated: new Date(),
            // }})
            console.log(`Updated details for project: ${project.project_id}`);
        }

        // format result
        /*
        {
            'magicbuild.near': {
                profile: {
                name: 'MagicBuild',
                description: 'Auotogenerate BOS forms by just putting your NEAR smart contract address.',
                linktree: [Object],
                image: [Object],
                backgroundImage: [Object],
                tags: [Object],
                verticals: [Object],
                product_type: [Object],
                dev: 'mainnet',
                team: [Object],
                tagline: 'Build BOS front ends from your NEAR address',
                website: 'magicbuild.ai',
                horizon_tnc: 'true',
                category: [Object]
                }
            }
            }
         */
    } catch (error) {
        console.error("Error Insert Data:", error);
    } finally {
        await client.close()
    }

}

async function getDonationsForRecipient(recipientId) {
    try {
        await client.connect();
        const db = client.db("potlock");
        const collectionDonation = db.collection("donations");
        const collectionProject = db.collection("projects");

        let argsBase64 = btoa(`{"recipient_id":"${recipientId}"}`);
        // console.log(argsBase64)
        
        const rawResult = await provider.query({
            request_type: "call_function",
            account_id: "donate.potlock.near",
            method_name: "get_donations_for_recipient",
            args_base64: argsBase64,//{"recipient_id":"proofofvibes.near"} // this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
            finality: "optimistic",
        });
        // format result
        const res = JSON.parse(Buffer.from(rawResult.result).toString());

        const currentDate = new Date();

        let totalDonations = new Big('0');
        let totalReferral = new Big('0');

        let donors = {};
        for(const donation of res) {
            const { id, ...rest } = donation; 

            const existDonation = await collectionDonation.findOne({donate_id: id})

            const totalAmount = new Big(donation.total_amount);
            const referralAmount = new Big(donation.referrer_fee || '0');
            const protocolAmount = new Big(donation.protocol_fee || '0');
            totalDonations = totalDonations.plus(
              totalAmount.minus(referralAmount).minus(protocolAmount),
            );
            totalReferral = totalReferral.plus(referralAmount);

            donors[donation.donor_id] = true;


            const newDonationData = {
                    ...rest,
                    donate_id: id,
                    dateCreated: currentDate,
                    dateUpdated: null,
                }

            if(existDonation) {
                continue;
            }

            await collectionDonation.insertOne(newDonationData)

            
            console.log(`Success! Donation with id: ${id} inserted successfully`)
        }

        const totalDonationsSmallerUnit = totalDonations
        .div(1e24)
        .toNumber()
        .toFixed(2);

        const totalReferralFeesSmallerUnit = totalReferral
        .div(1e24)
        .toNumber()
        .toFixed(2);

        const uniqueDonors = Object.keys(donors).length;
        
        await collectionProject.updateOne({project_id: recipientId}, {$set:{
            totalDonations: totalDonationsSmallerUnit,
            donors: uniqueDonors,
            totalReferral :totalReferralFeesSmallerUnit

        }})

        return 
        
    } catch (error) {
        console.error("Error Insert Data:", error);
        throw new Error(error)

    } finally {
        await client.close()
    }

}

async function getProjectById(projectId) {
    try {
        await client.connect();
        const db = client.db("potlock");
        const collection = db.collection("projects");

        let argsBase64 = btoa(`{"project_id":"${projectId}"}`);

        const rawResult = await provider.query({
            request_type: "call_function",
            account_id: "registry.potlock.near",
            method_name: "get_project_by_id",
            args_base64: argsBase64,//{"recipient_id":"proofofvibes.near"} // this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
            finality: "optimistic",
        });

        const res = JSON.parse(Buffer.from(rawResult.result).toString());
        const currentDate = new Date();
        
        const { id, ...rest } = res; 

        const projectData = {
            ...rest,
            project_id : id,
            dateCreated: currentDate,
            dateUpdated: null
        };

        const existProject = await collection.findOne({project_id: id})

        if(existProject) {
            await collection.updateOne({_id: existProject.id}, {$set: projectData}, (err, res) => {
                if (err) throw err;
            })
            console.log("Success! Project updated successfully")
            return
        }

        await collection.insertOne(projectData)
        
        console.log("Success! Project inserted successfully")

        return;

    } catch (error) {
        console.error("Error Insert Data:", error);
        throw new Error(error)
    }
}

async function getTotalContributedProject(){
    try {
        await client.connect();
        const db = client.db("potlock");
        const collectionProject = db.collection("projects");
        const collectionDonation = db.collection("projects");

        const allProjects = await collectionProject.find({}).toArray()
        
        for(const project of allProjects) {
    
            let argsBase64 = btoa(`{"recipient_id":"${project.project_id}"}`);
            // console.log(argsBase64)
            
            const rawResult = await provider.query({
                request_type: "call_function",
                account_id: "donate.potlock.near",
                method_name: "get_donations_for_recipient",
                args_base64: argsBase64,//{"recipient_id":"proofofvibes.near"} // this is arg that is encoded to base64, use this website to view https://www.base64decode.org/
                finality: "optimistic",
            });

            const res = JSON.parse(Buffer.from(rawResult.result).toString());

            // console.log(res)
            
            let totalDonations = new Big('0');
            let totalReferral = new Big('0');

            let donors = {};
            for(const donation of res) {
                const { id, ...rest } = donation; 
        
                const totalAmount = new Big(donation.total_amount);
                const referralAmount = new Big(donation.referrer_fee || '0');
                const protocolAmount = new Big(donation.protocol_fee || '0');
                totalDonations = totalDonations.plus(
                  totalAmount.minus(referralAmount).minus(protocolAmount),
                );
                totalReferral = totalReferral.plus(referralAmount);

                donors[donation.donor_id] = true;
                
                console.log(`Success! Processing donation with ${id} of project ${project.project_id}`)
            }
    
            const totalDonationsSmallerUnit = totalDonations
            .div(1e24)
            .toNumber()
            .toFixed(2);

            const totalReferralFeesSmallerUnit = totalReferral
            .div(1e24)
            .toNumber()
            .toFixed(2);

            const uniqueDonors = Object.keys(donors).length;
            
            await collectionProject.updateOne({project_id: project.project_id}, {$set:{
                totalDonations: totalDonationsSmallerUnit,
                donors: uniqueDonors,
                totalReferral :totalReferralFeesSmallerUnit
            }})
    
        }
        return

    } catch (error) {
        console.error("Error Insert Data:", error);
        throw new Error(error)

    } finally {
        await client.close()
    }
}

module.exports = {getDonationsForRecipient, getProjectById}

// getProjects();
// getDonations();
// getAdmins();
// getDetailProject();
// getDonationsForRecipient("magicbuild.near");
// getTotalContributedProject()
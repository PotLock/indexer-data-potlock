const { providers } = require("near-api-js");
const provider = new providers.JsonRpcProvider("https://rpc.mainnet.near.org");



async function getProjects() {
    const rawResult = await provider.query({
        request_type: "call_function",
        account_id: "registry.potlock.near",
        method_name: "get_projects",
        args_base64: "e30=",
        finality: "optimistic",
    });

    // format result
    const res = JSON.parse(Buffer.from(rawResult.result).toString());
    console.log(res);
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
}


async function getDonations() {
    const rawResult = await provider.query({
        request_type: "call_function",
        account_id: "donate.potlock.near",
        method_name: "get_donations",
        args_base64: "e30=",
        finality: "optimistic",
    });

    // format result
    const res = JSON.parse(Buffer.from(rawResult.result).toString());
    console.log(res);
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
}

async function getAdmins() {
    const rawResult = await provider.query({
        request_type: "call_function",
        account_id: "registry.potlock.near",
        method_name: "get_admins",
        args_base64: "e30=",
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
    const rawResult = await provider.query({
        request_type: "call_function",
        account_id: "social.near",
        method_name: "get",
        args_base64: "eyJrZXlzIjpbIm1hZ2ljYnVpbGQubmVhci9wcm9maWxlLyoqIl19",//{"keys":["magicbuild.near/profile/**"]}
        finality: "optimistic",
    });

    // format result
    const res = JSON.parse(Buffer.from(rawResult.result).toString());
    console.log(res);
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
}

async function getDonationsForRecipient() {
    const rawResult = await provider.query({
        request_type: "call_function",
        account_id: "donate.potlock.near",
        method_name: "get_donations_for_recipient",
        args_base64: "eyJyZWNpcGllbnRfaWQiOiJwcm9vZm9mdmliZXMubmVhciJ9",//{"recipient_id":"proofofvibes.near"}
        finality: "optimistic",
    });
    // format result
    const res = JSON.parse(Buffer.from(rawResult.result).toString());
    console.log(res);
    /*
    [{
        "id": 169,
        "donor_id": 'isaacwilliam.near',
        "total_amount": '1000000000000000000000000',
        "ft_id": 'near',
        "message": None,
        "donated_at_ms": 1700838130643,
        "recipient_id": 'proofofvibes.near',
        "protocol_fee": '100000000000000000000000',
        "referrer_id": None,
        "referrer_fee": None
    }]
     */
}

getProjects();
getDonations();
getAdmins();
getDetailProject();
getDonationsForRecipient();
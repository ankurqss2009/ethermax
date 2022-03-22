// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Web3 from 'web3';

const fs = require('fs');
const {parse} = require('csv-parse');
const path = require('path');

const filePath = path.join(__dirname, './Token-List.csv');



export default async (req, res) => {
    console.log("----filePath---",filePath)
    const address= req.body.address && req.body.address.toLowerCase()
    const airdrop = fs
        .createReadStream('./Token-List.csv')
        .pipe(parse({
        }));
    let recipient = null;
    for await (const allocation of airdrop) {
        if(allocation[0] && allocation[0].trim().length === 42  && allocation[0].trim().toLowerCase() == address) {
            console.log("--allocation",allocation)
            recipient = {address:allocation[0].trim().toLowerCase(),totalAllocation:allocation[1]}
        }
    }
    console.log("recipient--------------",recipient)
    if(recipient) {
        const message = Web3.utils.soliditySha3(
            {t: 'address', v: recipient.address},
            {t: 'uint256', v: recipient.totalAllocation.toString()}
        ).toString('hex');
        const web3 = new Web3('');
        const { signature } = web3.eth.accounts.sign(
            message,
            process.env.REACT_APP_PRIVATE_KEY
        );
        res
            .status(200)
            .json({
                ...recipient,
                signature
            });
        return;
    }
    //3. otherwise, return error
    res
        .status(401)
        .json({ address: req.body.address });
}
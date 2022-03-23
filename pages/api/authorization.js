// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Web3 from 'web3';

const fs = require('fs');
const {parse} = require('csv-parse');
const {join} = require('path');
import claimFile  from '../../contracts/claim.json'

//const filePath = path.join(__dirname, './Token-List.csv');

//import getConfig from 'next/config'




export default async (req, res) => {

    //const file = readFileSync(join(__dirname, 'csv', 'Token-List.csv'), 'utf8')

    const address= req.body.address && req.body.address.toLowerCase();

    /*const airdrop = fs
        .createReadStream('Token-List.csv')
        .pipe(parse({
        }));
    //let recipient = null;
    let allocations = {}
    for await (const allocation of airdrop) {
        //console.log("allocation",allocation)
        allocations[allocation[0].toLowerCase()] = allocation[1]
        if(allocation[0] && allocation[0].trim().length === 42  && allocation[0].trim().toLowerCase() == address) {
            console.log("--allocation",allocation)
            recipient = {address:allocation[0].trim().toLowerCase(),totalAllocation:allocation[1]}
        }
    }

    var json = JSON.stringify(allocations);
    console.log("--allocations length",allocations.length)
    const callback = (res)=>{
        console.log("--res--",res)
    }

    fs.writeFile('claim.json', json, 'utf8', callback);

*/

   const  recipient = claimFile[address]
    console.log("recipient--------------",recipient,"address",address)
    if(recipient) {
        const message = Web3.utils.soliditySha3(
            {t: 'address', v: address},
            {t: 'uint256', v: recipient.toString()}
        ).toString('hex');
        const web3 = new Web3('');
        const { signature } = web3.eth.accounts.sign(
            message,
            process.env.REACT_APP_PRIVATE_KEY
        );
        res
            .status(200)
            .json({
                address,
                totalAllocation:recipient,
                signature
            });
        return;
    }
    //3. otherwise, return error
    res
        .status(401)
        .json({ address: req.body.address });
}
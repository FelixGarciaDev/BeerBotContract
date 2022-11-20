// run this with... 

let requiredFundsInWeis = "20000000000000000";
let bigIntRequiredFunds = BigInt(requiredFundsInWeis);
console.log("gonna pass this value in bnb: "+ethers.utils.formatEther(bigIntRequiredFunds))

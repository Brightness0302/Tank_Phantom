import { from } from "form-data";

var web3 = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require("@solana/spl-token")

const solanaRPC = "https://tame-palpable-tab.solana-mainnet.quiknode.pro/dde13dd39d8e1f13c1c2b7ac8f26740a7232b243/"
const depositWallet = "2GSBxS9heSTk9iungS8v7gMBgc5uRJxy1ny2XyvhPiAa"
const TOKEN = "BTCBZ6hrcn5g8MANyQep6QVqZWpD5TqjSUKTUKHivkfa"

export const getProvider = () => {
  if ("phantom" in window) {
    const provider = window.phantom?.solana;
    if (provider?.isPhantom) {
      return provider;
    }
  }
};

export const connectWallet = async () => {
  const provider = getProvider();
  console.log("provider", provider);
  if (provider) {
    try {
      const response = await provider.connect();
      let wallet = response.publicKey.toString();
      return Promise.resolve(wallet);
    } catch (err) {
      return Promise.reject("Error While Connecting Phantom Wallet");
    }
  } else {
    return Promise.reject("You need to install Phantom Wallet!");
  }
};

export const deposit = async (amount) => {
  try {
    await connectWallet();
    const provider = await getProvider();
    var connection = new web3.Connection(solanaRPC);
    var toPubkey = new web3.PublicKey(depositWallet);

    console.log(toPubkey, provider.publicKey);
    var transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: toPubkey,
        lamports: (web3.LAMPORTS_PER_SOL / 10) * amount,
      })
    );
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    transaction.feePayer = provider.publicKey;
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log(signature);
    return Promise.resolve(signature);
  } catch (err) {
    console.log(err);
    return Promise.reject("Deposit Failed");
  }
};
/*async function getTokenAddress(connection,mint,owner,allowOwnerOffCurve, programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID)
  {
    const address = await getAssociatedTokenAddress(mint,owner,allowOwnerOffCurve,programId,associatedTokenProgramId);
  const accountInfo = await connection.getAccountInfo(address);
  if(accountInfo === null) return null;
  else return address;

  }
async function getAssociatedTokenAddress(  
  mint,
  owner,
  allowOwnerOffCurve,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  if (!allowOwnerOffCurve && !web3.PublicKey.isOnCurve(owner.toBuffer())) return null;

  const [address] = await web3.PublicKey.findProgramAddress(
      [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
      associatedTokenProgramId
  );

  return address;
}
async function getOrCreateTokenAccount (connection, provider, mint, owner, programId = TOKEN_PROGRAM_ID, associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID)
{
    const associatedAccount = await getAssociatedTokenAddress(mint, owner);
    const accountInfo = await connection.getAccountInfo(associatedAccount);
    // console.log("accountInfo:",associatedAccount.toString());
    if(accountInfo === null) {
      try{
        const transaction = new web3.Transaction().add(
          Token.createAssociatedTokenAccountInstruction(associatedTokenProgramId, programId, mint, associatedAccount, owner, provider)
        );  
        let blockhashObj = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhashObj.blockhash;
        transaction.feePayer = provider.publicKey;
        console.log("transaction:",transaction)
        await provider.signAndSendTransaction(transaction);
      } catch(err){
        console.log("accountError",err)
      }
      return associatedAccount
    }
    else return associatedAccount;
}*/
export const transfer = async (amount) => {
  try {
    await connectWallet();
    const provider = await getProvider();
    var connection = new web3.Connection(solanaRPC);

    var toPubkey = new web3.PublicKey(depositWallet);
    var myMint = new web3.PublicKey(TOKEN);

    // const fromTokenAddress = await getOrCreateTokenAccount(connection,provider,myMint,provider.publicKey)
    // const toTokenAccountAddress =  await getOrCreateTokenAccount(connection,provider,myMint,toPubkey)
    const fromTokenAddress = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, myMint, provider.publicKey)
    const toTokenAddress = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, myMint, toPubkey)

    // console.log(fromTokenAddress.toString(), toTokenAccountAddress.toString());
    var transaction = new web3.Transaction().add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAddress,
        toTokenAddress,
        provider.publicKey,
        [],
        amount * 0.001 * 10 ** 9
      )
    );
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhashObj.blockhash;

    transaction.feePayer = provider.publicKey;
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log(signature);
    return Promise.resolve(signature);
  } catch (err) {
    console.log(err);
    return Promise.reject("Deposit Failed");
  }
}
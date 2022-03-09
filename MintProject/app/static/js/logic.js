

// 


// moralis providers
Moralis.initialize("GkeqSiGtWm19OwnvlTb8x2r3QbscyqodPDG0FOpu");
Moralis.serverURL = "https://n9iwoinsx8j2.usemoralis.com:2053/server";



const NFTContractAddress = "0x90066Ec809C5CEa609439d0adBB83c5B0154ad66"
const DappToken5Address = "0x86Fab489e4eA65770fca3baE2c0dfF4495D0e118";

const web3 = new Web3(window.ethereum);

var DappToken5Balance;
var stat = false;
var currentUser;

const helper = {
  "0x1": "mainnet",
  "0x2a": "kovan",
  "0x3": "ropsten",
  "0x4": "rinkeby",
}



async function login() {

  // provides wallet connection
  document.getElementById("resultSpace").innerHTML = `<div> Connecting to Wallet ... </div>`;
  await Moralis.Web3.authenticate().then(function (user) {
    currentUser = user.get('ethAddress')
  });

  await afterLogin()
}

async function afterLogin() {


  // getting DappToken5 balance of connected wallet 
  let BalanceABI = [
    {
      "constant": true,
      "inputs": [{ "name": "_owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "balance", "type": "uint256" }],
      "type": "function"
    },
  ];
  const BalanceContract = new web3.eth.Contract(BalanceABI, DappToken5Address);
  await BalanceContract.methods.balanceOf(currentUser).call({ from: currentUser })
    .then((e) => {
      DappToken5Balance = e;
    });


  // checking balance to accessing mint part 
  if (DappToken5Balance >= 60000000000000000000) {
    document.getElementById("upload").removeAttribute("disabled");
    document.getElementById("file").removeAttribute("disabled");
    document.getElementById("name").removeAttribute("disabled");
    document.getElementById("description").removeAttribute("disabled");
    stat = true;
    document.getElementById("resultSpace").innerHTML = `<div> You have ${Web3.utils.fromWei(DappToken5Balance, 'ether')} DappToken5 in Your Wallet </div>`;
  }
  else {
    document.getElementById("resultSpace").innerHTML = `<div>Your DappToken5 balance should be at least 60 but you have ${Web3.utils.fromWei(DappToken5Balance, 'ether')} </div>`;
  }

}


async function upload() {

  if (stat == true) {

    document.getElementById('upload').setAttribute("disabled", null);
    document.getElementById('file').setAttribute("disabled", null);
    document.getElementById('name').setAttribute("disabled", null);
    document.getElementById('description').setAttribute("disabled", null);

    // burning 60 DappToken5
    document.getElementById("resultSpace").innerHTML = `<div> Getting 60 DappToken5 from Your Wallet To burn ... </div>`;
    const options = {
      type: "erc20",
      amount: Moralis.Units.Token("60", "18"),
      receiver: "0x000000000000000000000000000000000000dEaD",
      contractAddress: DappToken5Address
    }
    await Moralis.transfer(options)
    stat = false;

    // connecting to ipfs 
    document.getElementById("resultSpace").innerHTML = `<div> Minting NFT ... </div>`;
    const fileInput = document.getElementById("file");
    const data = fileInput.files[0];
    const mediaFile = new Moralis.File(data.name, data);

    await mediaFile.saveIPFS();
    const mediaURI = mediaFile.ipfs();
    const metadata = {
      "name": document.getElementById("name").value,
      "description": document.getElementById("description").value,
      "image": mediaURI
    }
    const metadataFile = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    const txt = await mintToken(metadataURI).then(notify)
  }
}

async function mintToken(_uri) {

  // minting NFT
  const encodedFunction = web3.eth.abi.encodeFunctionCall({
    name: "mintToken",
    type: "function",
    inputs: [{
      type: 'string',
      name: 'tokenURI'
    }]
  }, [_uri]);

  const transactionParameters = {
    to: NFTContractAddress,
    from: ethereum.selectedAddress,
    data: encodedFunction
  };
  const txt = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters]
  });


  return txt
}

async function notify(_txt) {
  await afterLogin();
  document.getElementById("resultSpace").innerHTML =
    `<div>Your NFT minted in transaction   (${_txt})  , Now you have ${Web3.utils.fromWei(DappToken5Balance, 'ether')} DappToken5 in Your Wallet </div>`;
}


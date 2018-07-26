import React, { Component } from "react";
import StorageContract from "../build/contracts/Storage.json";
import getWeb3 from "./utils/getWeb3";
import ipfs from "./ipfs";

import "./css/oswald.css";
import "./css/open-sans.css";
import "./css/pure-min.css";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      web3: null,
      buffer: null,
      profilePicHash: "",
      profileHash: "",
      account: null,
      fullname:"",
      email:"",
      address:"",
      contractAddress: "",
      network:""
    };
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();

        const result = this.state.web3.version.network;
        this.setState({ network : result })
        

      })
      .catch(err => {
        console.log(err.message);
        this.setState({message : err.message});
      });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT
     */

    const contract = require("truffle-contract");
    const Storage = contract(StorageContract);
    Storage.setProvider(this.state.web3.currentProvider);

    this.setState({message : 'Pulling User Information from Blockchain..'});

    this.state.web3.eth.getAccounts((error, accounts) => {
      Storage.deployed()
        .then(instance => {
          this.storageInstance = instance;
          this.setState({contractAddress : instance.address});
          this.setState({ account: accounts[0] });
          return this.storageInstance.getUser.call(this.state.account);
        })
        .then(user => {
          // Update state with the result.
          console.log(user);
          if (!user[1]) {
            throw new Error('No user info present in Blockchain, PLease submit data !')
          }
          
          this.setState({ profilePicHash: user[0] });
          this.setState({ profileHash: user[1]});

          this.setState({message : 'Pulling User Information from IPFS..'});
          return ipfs.dag.get(this.state.profileHash);
        })
        .then(ipfsUserProfile => {
          const userProfile = ipfsUserProfile.value;
          console.log(userProfile);
          this.setState({ fullname : userProfile.fullname });
          this.setState({ email : userProfile.email });
          this.setState({ address : userProfile.address });
          this.setState({ message : ''});
          return;
        })
        .catch(err => {
          console.error(err);
          let errMsg = err.message;
          if (err.message.includes("Invalid JSON RPC response")) {
            errMsg = "Please use Chrome browser with Metamask extension installed !"
          }
          this.setState({message : errMsg});
        })
    });
  }

  captureFile = event => {
    event.preventDefault();

    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("File buffer state set");
    };
  };

  onSubmit = async event => {
    event.preventDefault();
    
    if (this.state.buffer) {
      // Send Pic to IPFS
      this.setState({ message : 'Sending Profile to IPFS...'});

      ipfs.files.add(this.state.buffer, async (err, result) => {
        if (err) {
          console.error(err);
          this.setState({message : 'Error While sending Profile Pic to IPFS !!'});
          return;
        }
  
        const fileHash = result[0].hash;
        console.log("profilePicHash of uploaded pic : ", fileHash);
        this.setState({ profilePicHash: fileHash });

        // Send Profile Data to IPFS
        const userProfile = {
          fullname: this.state.fullname,
          email: this.state.email,
          address: this.state.address
        }

        try {
          this.setState({ message : `Sending Profile Data to IPFS...`});
          const userProfileCid = await ipfs.dag.put(userProfile, { format: "dag-cbor", hashAlg: "sha3-512" })
          const userProfileCidStr = userProfileCid.toBaseEncodedString();
          console.log(`profile hashes of uploaded data ${userProfileCidStr}`);
          this.setState({ profileHash: userProfileCidStr });
          
          
          // Send IPFS hashes to blockchain
          this.setState({ message : `Sending User Data to Blockchain...`});
          await this.storageInstance.setUser(this.state.profilePicHash, this.state.profileHash, {from: this.state.account});
          console.log('User Profile hashes stored to blockchain ')
          this.setState({ message : ''});

        } catch (err) {
          this.setState({ message: err.message });
        }
      })

    } else {
      // Send Profile Data to IPFS
      const userProfile = {
        fullname: this.state.fullname,
        email: this.state.email,
        address: this.state.address
      }

      try {
        this.setState({ message : `Sending Profile to IPFS...`});
        const userProfileCid = await ipfs.dag.put(userProfile, { format: "dag-cbor", hashAlg: "sha3-512" })
        const userProfileCidStr = userProfileCid.toBaseEncodedString();
        console.log(`profile hashes of uploaded data ${userProfileCidStr}`);
        this.setState({ profileHash: userProfileCidStr });
        
        this.setState({ message : `User Profile uploaded to IPFS`});

        // Send IPFS hashes to blockchain
        this.setState({ message : `Sending User Data to Blockchain...`});
        await this.storageInstance.setUser(this.state.profilePicHash, this.state.profileHash, {from: this.state.account});
        console.log('User Profile hashes stored to blockchain ')
        this.setState({ message : ''});

      } catch (err) {
        this.setState({ message: err.message });
      }
    }
  };

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            USER PROFILE DAPP
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p>{this.state.message}</p>
              
              <form className="pure-form pure-form-aligned" onSubmit={this.onSubmit}>
                
                <h2>User Profile </h2>
                
                <fieldset>
                  <div className="pure-control-group">
                    <label htmlFor="name">Name</label>
                    <input id="name" type="text" placeholder="Full Name" 
                      value={this.state.fullname}
                      onChange={event => this.setState({ fullname : event.target.value })}
                    />
                  </div>

                  <div className="pure-control-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="Email"
                      value={this.state.email}
                      onChange={event => this.setState({ email : event.target.value })}
                    />
                  </div>

                  <div className="pure-control-group">
                    <label htmlFor="address">Address</label>
                    <input id="address" type="text" placeholder="Address" 
                      value={this.state.address}
                      onChange={event => {this.setState({ address : event.target.value })}}
                    />
                  </div>
                </fieldset>

                <h3>Upload Profile Pic</h3>
                
                <fieldset>
                  <img
                    src={`https://gateway.ipfs.io/ipfs/${this.state.profilePicHash}`}
                    alt=""
                  />
                  
                  <div className="pure-control-group">
                    <input type="file" onChange={this.captureFile} />
                    <input type="submit" />
                  </div>
                </fieldset>

              </form>
              <p> <small>You are using {this.state.account} account</small> </p>
              <p> <small>Contract Address : {this.state.contractAddress} </small> </p>
              <p> <small>Connected Network : {this.state.network} </small> </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;

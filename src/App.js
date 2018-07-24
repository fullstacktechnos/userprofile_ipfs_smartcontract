import React, { Component } from 'react'
import StorageContract from '../build/contracts/Storage.json'
import getWeb3 from './utils/getWeb3'
import ipfs from './ipfs'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      errorMessage: '',
      web3: null,
      buffer: null,
      ipfsHash: '',
      account: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT
     */

    const contract = require('truffle-contract');
    const Storage = contract(StorageContract);
    Storage.setProvider(this.state.web3.currentProvider);

    this.state.web3.eth.getAccounts((error, accounts) => {
      Storage.deployed().then((instance) => {
        this.storageInstance = instance
        this.setState({ account : accounts[0] })
        return this.storageInstance.get.call(this.state.account)
      }).then((ipfsHash) => {
        // Update state with the result.
        console.log(ipfsHash);
        return this.setState({ ipfsHash })
      })
    })
  }
  
  captureFile = (event) => {
    event.preventDefault();
    
    const file = event.target.files[0];
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer : Buffer(reader.result) })
      console.log('File buffer state set');
    }
    
  }

  onSubmit = async (event) => {
    console.log('Sending file to IPFS..')
    event.preventDefault();
    ipfs.files.add(this.state.buffer, (err, result) => {
      if (err) return console.error(err)
      
      const fileHash = result[0].hash;
      console.log('ipfsHash of uploaded file : ', fileHash);
      this.setState({ ipfsHash : fileHash });
      
      // Send Hash to Blockchain
      this.storageInstance.set(fileHash, { from: this.state.account})  
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">IPFS DAPP</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Image</h1>
              <p>Image is stored on IPFS and in Blockchain</p>
              <img src={`https://gateway.ipfs.io/ipfs/${this.state.ipfsHash}`} alt="" />
              <h2>Upload Image </h2>
              <form onSubmit={this.onSubmit}>
                <input type="file" onChange={this.captureFile}/>
                <input type="submit"/>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App

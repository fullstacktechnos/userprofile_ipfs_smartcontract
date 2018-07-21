var Storage = artifacts.require("./Storage.sol");

contract('Storage', function(accounts) {

  it("...should store the value 'hello world'.", function() {
    return Storage.deployed().then(function(instance) {
      StorageInstance = instance;

      return StorageInstance.set("hello world", {from: accounts[0]});
    }).then(function() {
      return StorageInstance.get.call();
    }).then(function(storedData) {
      assert.equal(storedData, "hello world", "The value 'hello world' was not stored.");
    });
  });

});

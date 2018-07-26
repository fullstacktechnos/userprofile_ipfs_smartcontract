var Storage = artifacts.require("./Storage.sol");

contract('Storage', function(accounts) {

  it("should store the value", function() {
    return Storage.deployed().then(function(instance) {
      StorageInstance = instance;

      return StorageInstance.setUser("profile-pic-1", "other-details-1", {from: accounts[0]});
    }).then(function() {
      return StorageInstance.getUser.call(accounts[0]);
    }).then(function(storedData) {
      console.log(storedData)
      assert.equal(storedData[0], "profile-pic-1", "The value 'profile-pic-1' was not stored.");
      assert.equal(storedData[1], "other-details-1", "The value 'other-details-1' was not stored.");
      assert.equal(storedData[2], accounts[0], "The value 'other-details-1' was not stored.");
    });
  });

});

pragma solidity ^0.4.24;

contract Storage {
    struct UserData {
        string profilePicHash;
        string profileHash;
        address userAddress;
    }
    mapping(address => UserData) public users;
    uint public userCount;
    UserData[] public allUsers;

    event userAdded(
        address indexed useraddress,
        string profilePicHash,
        string profileHash
    );

    function setUser(string _profilePicHash, string _profileHash) public {
        UserData memory newUser = UserData({
            profilePicHash: _profilePicHash,
            profileHash: _profileHash,
            userAddress: msg.sender
        });

        users[msg.sender] = newUser;
        
        allUsers.push(newUser);
        
        userCount++;

        emit userAdded(msg.sender, _profilePicHash, _profileHash);
    }

    function getUser(address _userAddress) public view returns (string, string, address) {
        require(_userAddress != address(0));
        
        UserData storage user = users[_userAddress];

        return (
            user.profilePicHash,
            user.profileHash,
            user.userAddress
        );
    }

    function getUsersCount() public view returns ( uint ) {
        return allUsers.length;
    }
}

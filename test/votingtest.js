const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('addVoter', function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];

  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: voter2}), "Voter2: caller is not good"));
  });

  it('Registered ok', async function () { 

    const voter1Before = await this.Voting.voters(voter1); 
    expect(voter1Before.isRegistered).to.equal(false);

    const receipt = await this.Voting.addVoter(voter1, false, {from: owner});

    const voter1After = await this.Voting.voters(voter1); 
    expect(voter1After.isRegistered).to.equal(true);  

    const adresseToSaveAfter = await this.Voting.addressToSave(0);
    expect(adresseToSaveAfter).to.equal(voter1);  

    expectEvent(receipt, "VoterRegistered", { voterAddress: voter1, isAbleToPropose: false, sessionId: '0'});
  });

  it('Voter already registered', async function () { 
    await this.Voting.addVoter(voter1, false, {from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Voter already registered"));
  });  

  it('RegisteringVoters status only', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));
  });  

});
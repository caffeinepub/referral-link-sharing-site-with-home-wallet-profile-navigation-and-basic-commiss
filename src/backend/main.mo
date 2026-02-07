import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";

actor {
  // Persistent state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  let referralLinks = Map.empty<Principal, Map.Map<Nat, ReferralLink>>();
  let users = Map.empty<Principal, UserProfile>();
  let payoutRequests = Map.empty<Principal, Map.Map<Nat, PayoutRequest>>();
  let balances = Map.empty<Principal, Nat>();
  let availableTasks = Map.empty<Text, Task>();
  let payoutRequestCounter = Map.empty<Principal, Nat>();

  type ReferralLink = {
    title : Text;
    destinationUrl : Text;
    commission : ?Nat;
    created : Time.Time;
  };

  let commissionThreshold = 1000; // Set your threshold value here

  type PayoutRequest = {
    id : Nat;
    amount : Nat;
    status : { #pending; #approved; #rejected };
    created : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    upi : Text;
  };

  public type Task = {
    title : Text;
    description : Text;
    reward : ?Nat;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func createReferralLink(
    title : Text,
    destinationUrl : Text,
    commission : ?Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create referral links");
    };

    let newLink : ReferralLink = {
      destinationUrl;
      commission;
      title;
      created = Time.now();
    };

    switch (referralLinks.get(caller)) {
      case (null) {
        let newLinks = Map.empty<Nat, ReferralLink>();
        newLinks.add(newLinks.size(), newLink);
        referralLinks.add(caller, newLinks);
      };
      case (?existingLinks) {
        existingLinks.add(existingLinks.size(), newLink);
      };
    };
  };

  public query ({ caller }) func getReferralLinks() : async [ReferralLink] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referral links");
    };

    switch (referralLinks.get(caller)) {
      case (null) { [] };
      case (?links) { links.values().toArray().map(func(link) { link }) };
    };
  };

  public shared ({ caller }) func trackReferralClick(user : Principal, linkTitle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track referral clicks");
    };

    switch (referralLinks.get(user)) {
      case (null) { Runtime.trap("No referral links found") };
      case (?links) {
        var foundLink : ?ReferralLink = null;
        for (link in links.values()) {
          if (link.title == linkTitle) {
            foundLink := ?link;
          };
        };

        switch (foundLink) {
          case (null) { Runtime.trap("Referral link not found") };
          case (?link) {
            let commission = switch (link.commission) {
              case (null) { 0 };
              case (?c) { c };
            };
            switch (balances.get(user)) {
              case (null) {
                balances.add(user, commission);
              };
              case (?existing) {
                balances.add(user, existing + commission);
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };

    switch (balances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func requestPayout(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request payouts");
    };

    if (amount < commissionThreshold) {
      Runtime.trap("Payout amount must be at least " # commissionThreshold.toText());
    };

    let currentBalance = switch (balances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (amount > currentBalance) {
      Runtime.trap("Insufficient balance for payout request");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found. Please create a profile first!") };
      case (?profile) {
        if (profile.upi == "") {
          Runtime.trap("A valid UPI ID is required to initiate the payout request.");
        };
      };
    };

    let currentCounter = switch (payoutRequestCounter.get(caller)) {
      case (null) { 0 };
      case (?counter) { counter };
    };

    let newRequest : PayoutRequest = {
      id = currentCounter + 1;
      amount;
      status = #pending;
      created = Time.now();
    };

    payoutRequestCounter.add(caller, currentCounter + 1);

    switch (payoutRequests.get(caller)) {
      case (null) {
        let newRequestMap = Map.empty<Nat, PayoutRequest>();
        newRequestMap.add(newRequest.id, newRequest);
        payoutRequests.add(caller, newRequestMap);
      };
      case (?existingRequests) {
        existingRequests.add(newRequest.id, newRequest);
      };
    };

    balances.add(caller, currentBalance - amount);
  };

  func doGetUserPayoutRequests(user : Principal) : ?[PayoutRequest] {
    payoutRequests.get(user).map(
      func(requests) {
        requests.values().toArray();
      }
    );
  };

  public query ({ caller }) func getUserPayoutRequests(user : Principal) : async ?[PayoutRequest] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payout requests");
    };
    doGetUserPayoutRequests(user);
  };

  public query ({ caller }) func getMyPayoutRequests() : async ?[PayoutRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payout requests");
    };
    doGetUserPayoutRequests(caller);
  };

  public query ({ caller }) func getAllPayoutRequests() : async [(Principal, [PayoutRequest])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payout requests");
    };

    let toArrayResult = payoutRequests.toArray();
    toArrayResult.map(
      func((user, requests)) {
        let requestArray = requests.values().toArray();
        (user, requestArray);
      }
    );
  };

  public shared ({ caller }) func approvePayoutRequest(user : Principal, requestId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve payouts");
    };

    switch (payoutRequests.get(user)) {
      case (null) { Runtime.trap("No payout requests found for user") };
      case (?requests) {
        switch (requests.get(requestId)) {
          case (null) { Runtime.trap("Payout request not found") };
          case (?request) {
            requests.add(requestId, { request with status = #approved });
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectPayoutRequest(user : Principal, requestId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject payouts");
    };

    switch (payoutRequests.get(user)) {
      case (null) { Runtime.trap("No payout requests found for user") };
      case (?requests) {
        switch (requests.get(requestId)) {
          case (null) { Runtime.trap("Payout request not found") };
          case (?request) {
            requests.add(requestId, { request with status = #rejected });
          };
        };
      };
    };
  };

  public shared ({ caller }) func addTask(title : Text, description : Text, reward : ?Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add tasks");
    };

    let newTask : Task = {
      title;
      description;
      reward;
    };

    availableTasks.add(title, newTask);
  };

  public query func getAvailableTasks() : async [Task] {
    availableTasks.values().toArray().map(func(task) { task });
  };

  public shared ({ caller }) func bulkAddTasks(tasks : [Task]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can bulk add tasks");
    };

    for (task in tasks.values()) {
      availableTasks.add(task.title, task);
    };
  };

  // Approval-based user management functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};

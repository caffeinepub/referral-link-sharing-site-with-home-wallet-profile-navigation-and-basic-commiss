import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Fix persistent state and migration logic
actor {
  // Persistent state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let referralLinks = Map.empty<Principal, Set.Set<ReferralLink>>();
  let users = Map.empty<Principal, UserProfile>();
  let payoutRequests = Map.empty<Principal, Set.Set<PayoutRequest>>();
  let balances = Map.empty<Principal, Nat>();
  let availableTasks = Map.empty<Text, Task>(); // Store tasks

  module ReferralLink {
    public func compare(link1 : ReferralLink, link2 : ReferralLink) : Order.Order {
      Text.compare(link1.title, link2.title);
    };
  };

  type ReferralLink = {
    title : Text;
    destinationUrl : Text;
    commission : ?Nat;
    created : Time.Time;
  };

  let commissionThreshold = 1000;

  module PayoutRequest {
    public func compare(request1 : PayoutRequest, request2 : PayoutRequest) : Order.Order {
      Int.compare(request1.amount, request2.amount);
    };
  };

  type PayoutRequest = {
    amount : Nat;
    status : { #pending; #approved; #rejected };
    created : Time.Time;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.name, profile2.name)) {
        case (#equal) { Text.compare(profile1.upi, profile2.upi) };
	      case (order) { order };
      };
    };
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


  // Profile management functions matching required API
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

  // Admin-only check for frontend
  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller)
  };

  // Referral link management (Admin-only)
  public shared ({ caller }) func createReferralLink(
    title : Text,
    destinationUrl : Text,
    commission : ?Nat
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create referral links");
    };

    let newLink : ReferralLink = {
      title;
      destinationUrl;
      commission;
      created = Time.now();
    };

    switch (referralLinks.get(caller)) {
      case (null) {
        let newSet = Set.empty<ReferralLink>();
        newSet.add(newLink);
        referralLinks.add(caller, newSet);
      };
      case (?existingSet) {
        existingSet.add(newLink);
      };
    };
  };

  public query ({ caller }) func getReferralLinks() : async [ReferralLink] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referral links");
    };

    switch (referralLinks.get(caller)) {
      case (null) { [] };
      case (?links) {
        links.toArray().map(func(link) { link });
      };
    };
  };

  // Public endpoint for tracking clicks from shared referral URLs
  // No authentication required - visitors can be anonymous
  public shared func trackReferralClick(user : Principal, linkTitle : Text) : async () {
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

  // Wallet management
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

    let currentBalance = switch (balances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (amount > currentBalance) {
      Runtime.trap("Insufficient balance for payout request");
    };

    let newRequest : PayoutRequest = {
      amount;
      status = #pending;
      created = Time.now();
    };

    switch (payoutRequests.get(caller)) {
      case (null) {
        let newRequestSet = Set.empty<PayoutRequest>();
        newRequestSet.add(newRequest);
        payoutRequests.add(caller, newRequestSet);
      };
      case (?existingRequests) {
        existingRequests.add(newRequest);
      };
    };

    balances.add(caller, currentBalance - amount);
  };

  // Admin-only payout management
  public shared ({ caller }) func approvePayoutRequest(user : Principal, requestIndex : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve payouts");
    };

    switch (payoutRequests.get(user)) {
      case (null) { Runtime.trap("No payout requests found for user") };
      case (?requests) {
        let requestsArray = requests.toArray().sort();
        if (requestIndex >= requestsArray.size()) {
          Runtime.trap("Invalid request index");
        };

        let updatedRequests = requestsArray.map(
          func(req) {
            switch (requestsArray.findIndex(func(x) { x == req })) {
              case (?i) {
                if (i == requestIndex) { { req with status = #approved } } else { req };
              };
              case (null) { req };
            };
          }
        );

        requests.clear();
        updatedRequests.forEach(func(req) { requests.add(req) });
      };
    };
  };

  public shared ({ caller }) func rejectPayoutRequest(user : Principal, requestIndex : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject payouts");
    };

    switch (payoutRequests.get(user)) {
      case (null) { Runtime.trap("No payout requests found for user") };
      case (?requests) {
        let requestsArray = requests.toArray().sort();
        if (requestIndex >= requestsArray.size()) {
          Runtime.trap("Invalid request index");
        };

        let updatedRequests = requestsArray.map(
          func(req) {
            switch (requestsArray.findIndex(func(x) { x == req })) {
              case (?i) {
                if (i == requestIndex) { { req with status = #rejected } } else { req };
              };
              case (null) { req };
            };
          }
        );

        requests.clear();
        updatedRequests.forEach(func(req) { requests.add(req) });
      };
    };
  };

  // Admin-only task management
  public shared ({ caller }) func addTask(title : Text, description : Text, reward : ?Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add tasks");
    };

    let newTask : Task = {
      title;
      description;
      reward;
    };

    availableTasks.add(title, newTask);
  };

  public query ({ caller }) func getAvailableTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available tasks");
    };
    availableTasks.values().toArray().map(func(task) { task });
  };
};

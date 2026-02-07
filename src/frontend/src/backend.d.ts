import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface Task {
    reward?: bigint;
    title: string;
    description: string;
}
export interface PayoutRequest {
    id: bigint;
    status: ApprovalStatus;
    created: Time;
    amount: bigint;
}
export interface UserProfile {
    upi: string;
    name: string;
}
export interface ReferralLink {
    title: string;
    created: Time;
    commission?: bigint;
    destinationUrl: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTask(title: string, description: string, reward: bigint | null): Promise<void>;
    approvePayoutRequest(user: Principal, requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkAddTasks(tasks: Array<Task>): Promise<void>;
    createReferralLink(title: string, destinationUrl: string, commission: bigint | null): Promise<void>;
    getAllPayoutRequests(): Promise<Array<[Principal, Array<PayoutRequest>]>>;
    getAvailableTasks(): Promise<Array<Task>>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyPayoutRequests(): Promise<Array<PayoutRequest> | null>;
    getReferralLinks(): Promise<Array<ReferralLink>>;
    getUserPayoutRequests(user: Principal): Promise<Array<PayoutRequest> | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    rejectPayoutRequest(user: Principal, requestId: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    requestPayout(amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    trackReferralClick(user: Principal, linkTitle: string): Promise<void>;
}

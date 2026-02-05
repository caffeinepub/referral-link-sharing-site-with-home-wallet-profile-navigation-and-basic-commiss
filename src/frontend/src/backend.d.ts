import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    reward?: bigint;
    title: string;
    description: string;
}
export type Time = bigint;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTask(title: string, description: string, reward: bigint | null): Promise<void>;
    approvePayoutRequest(user: Principal, requestIndex: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createReferralLink(title: string, destinationUrl: string, commission: bigint | null): Promise<void>;
    getAvailableTasks(): Promise<Array<Task>>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReferralLinks(): Promise<Array<ReferralLink>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    rejectPayoutRequest(user: Principal, requestIndex: bigint): Promise<void>;
    requestPayout(amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    trackReferralClick(user: Principal, linkTitle: string): Promise<void>;
}

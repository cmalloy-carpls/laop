export type OrganizationId = string & { readonly __brand: "OrganizationId" };
export type UserId = string & { readonly __brand: "UserId" };

export interface PersonName {
  first: string;
  last: string;
  middle?: string | null;
  suffix?: string | null;
}

export interface Phone {
  number: string;
  type: string;
}

export interface EmailContact {
  email: string;
  type: string;
}

export interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  stateCode: string;
  postalCode: string;
  countyFips?: string | null;
  primary?: boolean;
}

export type OperatingProfile = Record<string, unknown>;

export interface EligibilityReason {
  code: string;
  label: string;
  met: boolean;
}

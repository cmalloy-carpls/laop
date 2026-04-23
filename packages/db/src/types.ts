export type OrganizationId = string & { readonly __brand: "OrganizationId" };
export type UserId = string & { readonly __brand: "UserId" };

export interface PersonName {
  first: string;
  last: string;
  middle?: string;
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
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export type OperatingProfile = Record<string, unknown>;

export interface EligibilityReason {
  code: string;
  label: string;
  met: boolean;
}

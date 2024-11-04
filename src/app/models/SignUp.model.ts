export interface SignUp {
  did: string;             // DID identifier for the user
  wallet?: string[];       // Optional wallet or other attributes associated with the DID
  createdAt?: Date;        // Optional field to store the date the DID was created or registered
  metadata?: any;          // Optional metadata field to store additional information related to the user or DID
}

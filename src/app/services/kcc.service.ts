// src/app/services/kcc.service.ts
import { inject, Injectable } from '@angular/core';
import { DidService } from './did.service';
import { VerifiableCredential } from '@web5/credentials';
import { IdentityService } from './identity.service';
import { DwnService } from './dwn.service';

@Injectable({
  providedIn: 'root',
})
export class KccService {
  constructor(private didService: DidService, private dwnService: DwnService) {}
  identity = inject(IdentityService);

  async issueKcc(didUri: string): Promise<string> {
    try {
      const issuerDid = this.didService.getDid();
      if (!issuerDid) {
        throw new Error('Issuer DID not found');
      }

      const kccData = {
        type: 'KnownCustomerCredential',
        issuer: issuerDid,
        subject: didUri,
        data: { evidence: 'KYC completed' },
      };

      const vc = await VerifiableCredential.create(kccData);
      const bearerDid = await this.identity
        .activeAgent()
        .identity.get({ didUri: this.identity.did });

      const signedVcJwt = await vc.sign({ did: bearerDid!.did });
      console.log('KCC issued and signed successfully.');

      return signedVcJwt;
    } catch (error) {
      console.error('Error issuing KCC:', error);
      throw new Error('Failed to issue Known Customer Credential');
    }
  }

  async storeKccInDwn(
    signedVcJwt: string,
    recipientDid: string
  ): Promise<void> {
    try {
      await this.dwnService.installVcProtocol();

      //  const authToken = await this.dwnService.authorizeToWrite(recipientDid);
      // if (!authToken) {
      //   throw new Error("Authorization token not received.");
      // }

      const { record } = await this.dwnService.web5.dwn.records.create({
        data: signedVcJwt,
        message: {
          // recipient: recipientDid,
          dataFormat: 'application/vc+jwt',
          published: true,
        },
      });

      if (record) {
        // await record.send();
        console.log("KCC successfully stored in recipient's DWN.");
      } else {
        throw new Error('Failed to create record in DWN.');
      }
    } catch (error) {
      console.error('Error storing KCC in DWN:', error);
      throw new Error('Failed to store Known Customer Credential in DWN.');
    }
  }
}

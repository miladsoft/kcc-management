// src/app/components/kcc/known-customer-credential.component.ts
import { Component, inject } from '@angular/core';
import { VerifiableCredential } from '@web5/credentials';
import { IdentityService } from '../../../services/identity.service';
import { KccService } from '../../../services/kcc.service';
import { DwnService } from '../../../services/dwn.service';

@Component({
  selector: 'app-known-customer-credential',

  templateUrl: './known-customer-credential.component.html',
  styleUrls: ['./known-customer-credential.component.scss'],
})
export class KnownCustomerCredentialComponent {
  identity = inject(IdentityService);
  kccService = inject(KccService);
  dwnService = inject(DwnService);
  loading = false;
  signed = false;
  permissionRequested = false;
  permissionReceived = false;
  lookupSigned: boolean | undefined = undefined;

  // Form data for issuing credential
  did = 'did:dht:gkg4cus6hzj3cytan4qfr5zkwosydtdtfkkgy919tuiamzmdpkoy';
  countryOfResidence = 'UK';
  tier = '3';
  jurisdiction = 'GB';
  documentVerification = 'passport';

  // Credential data
  credential = '';
  credentials: any[] = [];

  // Request permission to deliver credential
  async requestPermission() {
    this.permissionRequested = true;

    try {
      await this.dwnService.authorizeToWrite(this.identity.did);
    } catch (error) {
      console.log('Failed to request permission:', error);
    }

    this.permissionReceived = true;
  }

  // Issue and sign credential
  async signCredential() {
    this.loading = true;
    try {
      const signedVcJwt = await this.kccService.issueKcc(this.did);
      await this.kccService.storeKccInDwn(signedVcJwt, this.did);

      this.credential = signedVcJwt;
      this.signed = true;
    } catch (error) {
      console.error('Error signing and storing credential:', error);
    } finally {
      this.loading = false;
    }
  }

  // Lookup and validate credentials
  async lookupCredentials() {
    this.lookupSigned = undefined;
    try {
      const { records } = await this.dwnService.dwn.records.query({
        from: this.did,
        message: {
          filter: {
            schema:
              'https://vc-to-dwn.tbddev.org/vc-protocol/schema/credential',
            dataFormat: 'application/vc+jwt',
          },
        },
      });
      this.credentials = records || [];
      this.lookupSigned = (records && records.length > 0) || false;
    } catch (error) {
      console.error('Error looking up credentials:', error);
    }
  }

  // Withdraw credentials
  async withdrawCredentials() {
    try {
      const { records } = await this.dwnService.dwn.records.query({
        message: {
          filter: {
            schema:
              'https://vc-to-dwn.tbddev.org/vc-protocol/schema/credential',
            dataFormat: 'application/vc+jwt',
          },
        },
      });

      for (const record of records || []) {
        await record.delete();
        await record.send(this.identity.did);
      }

      this.signed = false;
    } catch (error) {
      console.error('Error withdrawing credentials:', error);
    } finally {
      this.loading = false;
    }
  }

  copyCredential() {
    navigator.clipboard.writeText(this.credential);
  }
}

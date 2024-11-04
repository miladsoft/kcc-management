// src/app/services/dwn.service.ts
import { Injectable } from '@angular/core';
import { Web5 } from '@web5/api';
import { Web5UserAgent } from '@web5/user-agent';
import { DidService } from './did.service';
import {
  AgentDidApi,
  AgentDidResolverCache,
  BearerIdentity,
  DwnDidStore,
  HdIdentityVault,
  Web5PlatformAgent,
  PortableIdentity,
  AgentIdentityApi,
  DwnIdentityStore,
  LocalKeyManager,
  DwnRegistrar,
} from '@web5/agent';
import { LevelStore } from '@web5/common';

@Injectable({
  providedIn: 'root'
})
export class DwnService {
   private _web5!: Web5;
  constructor(private didService: DidService) {
    this.initializeService();
  }

  public get web5(): Web5 {
    return this._web5;
  }

  get dwn() {
    return this.web5?.dwn;
  }

   private async initializeService() {
    try {
       const connectedDid = await this.didService.getDid() || await this.didService.createDid();

       const customAgentVault = new HdIdentityVault({
        keyDerivationWorkFactor: 210_000,
        store: new LevelStore<string, string>({ location: 'DATA/AGENT/VAULT_STORE' }),
      });

       const didApi = new AgentDidApi({
        didMethods: [/* Include necessary DID methods, e.g., DidDht, DidJwk */],
        resolverCache: new AgentDidResolverCache({ location: 'DATA/AGENT/DID_RESOLVERCACHE' }),
        store: new DwnDidStore(),
      });

       const identityApi = new AgentIdentityApi<LocalKeyManager>({ store: new DwnIdentityStore() });

       const userAgent = await Web5UserAgent.create({
        didApi,
        identityApi,
        agentVault: customAgentVault,
      });

       this._web5 = new Web5({
        agent: userAgent,
        connectedDid: connectedDid,
      });

      console.log('Web5 and user agent initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Web5 and user agent:', error);
    }
  }


  async installVcProtocol() {
    console.log("Installing VC Protocol on DWN...");
    // Include additional setup or configuration logic if needed
    // For example, registering protocols or other dependencies on DWN
  }


  async authorizeToWrite(issuerDid: string): Promise<string> {
    try {
      const response = await fetch(`https://vc-to-dwn.tbddev.org/authorize?issuerDid=${issuerDid}`);
      if (response.ok) {
        return await response.text();
      } else {
        throw new Error(`Authorization failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Authorization request failed:', error);
      throw new Error("Authorization request failed");
    }
  }
}

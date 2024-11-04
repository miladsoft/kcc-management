import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Web5 } from '@web5/api';
import { DidDht, DidJwk } from '@web5/dids';
import { Web5IdentityAgent } from '@web5/identity-agent';
import {
  AgentDidApi,
  AgentDidResolverCache,
  BearerIdentity,
  DwnDidStore,
  HdIdentityVault,
  PortableIdentity,
  AgentIdentityApi,
  DwnIdentityStore,
  LocalKeyManager,
  DwnRegistrar,
} from '@web5/agent';
import { Web5UserAgent } from '@web5/user-agent';
import { LevelStore } from '@web5/common';
import { CryptoService } from './crypto.service';
import { DidService } from './did.service';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private syncInterval = '15s';
  public did!: string ;
  private web5!: Web5;
  public agent!: Web5IdentityAgent;
  private store!: DwnIdentityStore;
  private identityApi!: AgentIdentityApi<LocalKeyManager>;
  private accounts: { [key: string]: Web5 } = {};

  preinitialized = signal<boolean>(false);
  initialized = signal<boolean>(false);
  locked = signal<boolean>(true);
  private readonly didStorageKey = 'userDID';

  constructor(private cryptoService: CryptoService , private didService :DidService) {

   this.did = didService.getDid()!;
  }

  activeAgent() {
    const agent = this.web5.agent as Web5IdentityAgent;
    return agent;
  }

  async initialConnect(password: string) {
    try {
      console.log('Connecting to Web5...');
      const result = await Web5.connect({
        password,
        sync: this.syncInterval,
      });

      this.did = result.did;
      this.web5 = result.web5;
      this.agent = result.web5.agent as Web5IdentityAgent;
      this.updateInitializationState(true);
      console.log('Web5 connected:', this.did);

      return result;
    } catch (err) {
      console.error('Failed to initialize Web5:', err);
      this.updateInitializationState(false, true);
      return undefined;
    }
  }

  async connectWithIdentity(portableIdentity: PortableIdentity) {
    const password = await this.cryptoService.createPassword();
    const customAgentVault = new HdIdentityVault({
      keyDerivationWorkFactor: 210_000,
      store: new LevelStore<string, string>({ location: 'DATA/AGENT/VAULT_STORE' }),
    });

    const didApi = new AgentDidApi({
      didMethods: [DidDht, DidJwk],
      resolverCache: new AgentDidResolverCache({ location: 'DATA/AGENT/DID_RESOLVERCACHE' }),
      store: new DwnDidStore(),
    });

    this.store = new DwnIdentityStore();

    this.identityApi = new AgentIdentityApi<LocalKeyManager>({ store: this.store });

    const userAgent = await Web5UserAgent.create({
      didApi,
      identityApi: this.identityApi,
      agentVault: customAgentVault,
    });
    const firstLaunch = await userAgent.firstLaunch();

    if (firstLaunch) {
      const recoveryPhrase = await userAgent.initialize({
        password,
        dwnEndpoints: ['https://dwn.tbddev.org/beta'],
      });
      console.log('Recovery Phrase:', recoveryPhrase);
    }
    await userAgent.start({ password });

    const identity = await userAgent.identity.import({ portableIdentity });
    console.log('Imported identity:', identity);

    await userAgent.sync.registerIdentity({ did: identity.did.uri });
    this.web5 = new Web5({ agent: userAgent, connectedDid: identity.did.uri });

    return {
      password,
      did: identity.did.uri,
      web5: this.web5,
    };
  }

  private updateInitializationState(initialized: boolean, locked: boolean = false) {
    this.initialized.set(initialized);
    this.locked.set(locked);
    this.preinitialized.set(true);
  }
}

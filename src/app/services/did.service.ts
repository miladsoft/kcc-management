import { Injectable } from '@angular/core';
import { Web5 } from '@web5/api';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { CryptoUtils } from '@web5/crypto';

@Injectable({
  providedIn: 'root',
})
export class DidService {
  private readonly didKey = 'userDid';
  private readonly mnemonicKey = 'userMnemonic';
  private readonly privateKeyKey = 'userPrivateKey';

  constructor() {}


  async createDid(): Promise<{ did: string; mnemonic: string }> {
    const mnemonic = generateMnemonic(wordlist);
    const seed = await mnemonicToSeed(mnemonic);
    const keyPair = await this.generateKeyPairFromSeed(seed);

    const { did } = await Web5.connect();

    localStorage.setItem(this.didKey, did);
    localStorage.setItem(this.mnemonicKey, mnemonic);
    localStorage.setItem(this.privateKeyKey, keyPair.privateKey);

    return { did, mnemonic };
  }


  async recoverDid(mnemonic: string): Promise<string> {
    if (validateMnemonic(mnemonic, wordlist)) {
      const seed = await mnemonicToSeed(mnemonic);
      const keyPair = await this.generateKeyPairFromSeed(seed);
      const { did } = await Web5.connect();

      localStorage.setItem(this.didKey, did);
      localStorage.setItem(this.privateKeyKey, keyPair.privateKey);
      return did;
    } else {
      throw new Error('Invalid mnemonic or key');
    }
  }


  async signMessage(message: string): Promise<Uint8Array> {
    const privateKeyHex = localStorage.getItem(this.privateKeyKey);
    if (!privateKeyHex) {
      throw new Error('Private key not found. User may need to log in or recover the DID.');
    }

    const privateKey = this.hexToUint8Array(privateKeyHex);
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const signature = await crypto.subtle.sign(
      { name: 'HMAC', hash: 'SHA-256' },
      await crypto.subtle.importKey('raw', privateKey, { name: 'HMAC' }, false, ['sign']),
      data
    );

    return new Uint8Array(signature); // Convert ArrayBuffer to Uint8Array
  }

  private async generateKeyPairFromSeed(seed: Uint8Array): Promise<{ publicKey: string; privateKey: string }> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      seed.slice(0, 32), // Use only 32 bytes of the seed for Ed25519 key
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        salt: CryptoUtils.randomBytes(16),
        info: new Uint8Array(),
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'HMAC',
        hash: 'SHA-256',
        length: 256
      },
      true,
      ['sign', 'verify']
    );

    const privateKey = await crypto.subtle.exportKey('raw', derivedKey);
    const publicKey = await this.derivePublicKeyFromPrivateKey(new Uint8Array(privateKey));

    return {
      publicKey: this.bufferToHex(publicKey),
      privateKey: this.bufferToHex(new Uint8Array(privateKey))
    };
  }


  private async derivePublicKeyFromPrivateKey(privateKey: Uint8Array): Promise<Uint8Array> {
    // This is a placeholder; an actual cryptographic library should derive the public key
    return privateKey;
  }


  private hexToUint8Array(hex: string): Uint8Array {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  }


  private bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }


  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.didKey);
  }

  /**
   * Logs out the user by clearing all stored DID data.
   */
  logout(): void {
    localStorage.removeItem(this.didKey);
    localStorage.removeItem(this.mnemonicKey);
    localStorage.removeItem(this.privateKeyKey);
  }
}

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EvmChains, IndexService, SignProtocolClient, SpMode } from '@ethsign/sp-sdk';
import { privateKeyToAccount } from 'viem/accounts';


const fromHexString = (hexString: string) =>{
  return Uint8Array.from(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
}

const toHexString = (bytes: Uint8Array) =>{
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}


const secretKey = fromHexString('1f09c302b5ca611dc41b66d27a63e4e5');// window.crypto.getRandomValues(new Uint8Array(16));// '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
// const secretKey = crypto.getRandomValues(128).toString('hex');
// console.log(secretKey.toString());

// console.log(`[${secretKey}]`)

// console.log('HEX: ',`${ toHexString( secretKey)}`)



const SP_ENV='testnet'
const spSchemaId='0x25'


export interface BVNish{
  
  bvn: string;
  surname: string;
  firstName: string;
  dob: string;

}
export const BVNs: BVNish[] = [
  {
    bvn: '01341234234',
    surname: 'James',
    firstName: 'Audu',
    dob: '1980/12/12'
  }
]
@Injectable({
  providedIn: 'root'
})
export class KycService {

  spClient!: SignProtocolClient;
  spIndexService!: IndexService;
  key!: CryptoKey;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { 
    crypto.subtle.importKey(
      'raw',
      //new TextEncoder().encode(secretKey), // 32-byte key for AES-256
      secretKey,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    ).then((k)=>{
      this.key=k
      // console.log('key', k)
      
    });

    if (isPlatformBrowser(this.platformId)) {
      this.spClient = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.celoAlfajores,
        // account: privateKeyToAccount(privateKey),
      });
  
      this.spIndexService = new IndexService(SP_ENV);
      
    }



  }

  verify(bvn: string, surname: string, firstName: string, dob: string){
    return BVNs.some(ss=> ss.bvn==bvn.toLowerCase() 
      && ss.surname.toLowerCase()==surname.toLowerCase()
      && ss.firstName.toLowerCase()==firstName.toLowerCase()
      && ss.dob.toLowerCase()==dob.toLowerCase()
    )
  }

  async registerSchema(){
    const res = await this.spClient.createSchema({
      name: "PumpAI",
      data: [
        { name: "creator", type: "string" },
        { name: "kyc-hash", type: "string" },
        { name: "kyc-verified", type: "bool" },
      ],
    });

    return res
  }

  async checkAttestation( attester: string){

   
    // console.log('item is ', await this.spIndexService.queryAttestation('0x2a') )
    const res = await this.spIndexService.queryAttestationList({
      // id: "",
      schemaId: `onchain_evm_44787_${spSchemaId}`,
      attester,
      page: 1,
      mode: "onchain",
      // indexingValue: "",
    });

    console.log('res:', res)

    //0x2a
    return (!!res && res.total>0)
  }

  async attest(walletAddress: string, kycData: BVNish ){
    if(await this.checkAttestation(walletAddress)){
      return true
    }
    const hashed = this.encrypt( JSON.stringify(kycData))
    const createAttestationRes = await this.spClient.createAttestation({
      schemaId: spSchemaId,
      data: { 
        creator: walletAddress,  
        "kyc-hash": hashed,
        "kyc-verified": true
      },
      indexingValue: `${Date.now()}`,
    });

    return !!createAttestationRes;
  }

  async encrypt(value: string) {
    
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(12) // 96-bit IV
      },
      this.key,
      data
    );
    const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
    const encryptedHex = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return encryptedHex;
  }
  
  async decrypt(encryptedValue: any) {
    const encryptedBuffer = new Uint8Array(encryptedValue.match(/../g).map((byte: any) => parseInt(byte, 16)));
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(12) // 96-bit IV
      },
      this.key,
      encryptedBuffer
    );
    const decoder = new TextDecoder();
    const decryptedValue = decoder.decode(decryptedBuffer);
    return decryptedValue;
  }

  
}

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PaySuccessfulComponent } from './pages/pay-successful/pay-successful.component';
import { TestComponent } from './pages/test/test.component';
import { LoginComponent } from './pages/login/login.component';
import { CreateComponent } from './pages/create/create.component';
import { CoinDetailsComponent } from './pages/coin-details/coin-details.component';
import { MyCoinsComponent } from './pages/my-coins/my-coins.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreateWithAiComponent } from './pages/create-with-ai/create.component';
import { KycComponent } from './pages/kyc/kyc.component';

export const routes: Routes = [
    { path: '',title:"Home", component: HomeComponent, pathMatch:'full' }, 
    { path: 'test',title:"Test", component: TestComponent }, 
    { path: 'login',title:"Login", component: LoginComponent },
    { path: 'create',title:"Create", component: CreateComponent }, 
    // { path: 'ai-create',title:"Create with AI", component: CreateWithAiComponent }, 
    { path: 'coins/mine',title:"My Coins", component: MyCoinsComponent }, 
    // { path: 'kyc',title:"KYC", component: KycComponent }, 
    { path: 'coins/:coinId',title:"Trade Coin", component: CoinDetailsComponent }, 
    { path: 'profile',title:"View Profile", component: ProfileComponent }, 
    // { path: 'paid/:sid/:orderId',title:"Payment Sucessful", component: PaySuccessfulComponent }, 
    
];

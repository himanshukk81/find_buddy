import { Component, ViewChild } from '@angular/core';
import { Nav, Platform,AlertController,NavController,NavParams,Events} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';


import { SessionService,UserService } from './sessionservice';
import { Network } from '@ionic-native/network';
import {Http, Response,RequestOptions,Headers} from '@angular/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LocationAccuracy } from '@ionic-native/location-accuracy';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild(NavController) navCtrl: NavController;
  rootPage: any=LoginPage;
  headers:any;
  pages: Array<{title: string, component: any}>;

  constructor(public locationAccuracy: LocationAccuracy,public events:Events, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,public service:SessionService,public alertCtrl:AlertController  
    ,public network:Network,public http:Http) {
  
         this.pages = 
          [
            { title: 'Home',component: HomePage},
            { title: 'Logout',component: LoginPage},
            
          ];
      this.initializeApp();

  }
  

  ionViewDidLoad()
  {
   
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkNetwork();
      this.enableLocation();
    });
  }
 
  enableLocation()
  {
      // alert("Calling location");
      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if(canRequest) {
                console.log("request"+canRequest); 
                // the accuracy option will be ignored by iOS
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () =>{
              console.log("Request successful");

              this.events.publish('location:enabled');
            } ,
            error =>{
              console.log("Request failed"+error)
              this.service.showToast2("Failed to detect location");
            }) 
        }

      });
  }
  checkNetwork()
  {
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      var message="Your Are Offline";
    });
    let connectSubscription = this.network.onConnect().subscribe(() => {
    var message="Your Are Online";
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          var message="You Got Wifi Connection"
        }
      }, 3000);
    });
  }   
  
  openPage(page) {
      if(page.title=="Logout")
      {
        this.presentConfirm();
      }
      else
      {
        this.nav.setRoot(page.component);
      }
  }
  presentConfirm()
  {
    let alert = this.alertCtrl.create({
      title: 'LogOut',
      message: 'Are You Sure you want to Logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
                this.nav.setRoot(LoginPage);
                this.nav.popToRoot();
              },
        }
      ]
    })    
    alert.present();
  }
}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook'
// import * as firebase from 'firebase';
import { AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database-deprecated';
import { GooglePlus } from '@ionic-native/google-plus';
import firebase from 'firebase';
import {HomePage} from '../home/home';
import { SessionService } from '../../app/sessionservice';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user:any={};
  users: FirebaseListObservable<any[]>;

  constructor(public service:SessionService,public  googlePlus:GooglePlus,public db: AngularFireDatabase,public facebook: Facebook,public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    
  }

  facebookLogin(): Promise<any> {
    return this.facebook.login(['email'])
      .then( response => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);
  
        firebase.auth().signInWithCredential(facebookCredential)
          .then( success => { 
            this.user.email=success.email;
            this.user.name=success.displayName;
            this.user.photoURL=success.photoURL;
            this.user.uid=success.uid;
            this.user.latitude=0;
            this.user.longitude=0;
            // this.service.setUser(this.user);
            console.log("User info===="+JSON.stringify(this.user));
            this.verifyUser(this.user)

            console.log("user info===="+JSON.stringify(this.user));
            // this.navCtrl.setRoot(HomePage);
            // this.navCtrl.popToRoot(); 
            console.log("Firebase success: " + JSON.stringify(success)); 

            // alert("Firebase success: " + JSON.stringify(success))
          });
  
      }).catch((error) => {
        alert("Error===="+error);
        console.log("error1222222==="+ JSON.stringify(error))
        // alert("error1222222==="+error);
      });
  }  

  
  verifyUser(user)
  {
    var userExist=false;
    console.log("User info==="+JSON.stringify(user));
    this.db.list('/user_detail').subscribe(snapshot => { 
        if(snapshot.length>0)
        {

          console.log("firebase data====="+JSON.stringify(snapshot));
          for(var i=0;i<snapshot.length;i++)
          {
            if(snapshot[i].uid==user.uid)
            {
              userExist=true;
              this.service.setUser(snapshot[0]);
              this.navCtrl.setRoot(HomePage);
              this.navCtrl.popToRoot();
            }
          } 
          if(!userExist)
          {
            console.log("User not exist");
            this.saveUser(user) 
          }
        } 
        else
        {
          console.log("Saving in DB");
          this.saveUser(user)
        }  
    },error=>{
      console.log("Error=="+error);
      // this.service.showToast2("Something went wrong please try again");
      return;
    })     
  }
  saveUser(userInfo)
  {
      this.db.list('/user_detail').push(userInfo).then(({key}) => {
        console.log('all good');
        userInfo.key=key;
        this.updateKey(userInfo)
      }, reject => {
        console.log('error');
      })
  }

  updateKey(user)
  {
    console.log("User info update====="+JSON.stringify(user));
      this.db.object('/user_detail/'+user.key).update(user).then((profile: any) => {
          // return new Response('Profile has been saved successfully');
            console.log("Successfully updated location====")
            this.service.setUser(user);
            this.navCtrl.setRoot(HomePage);
            this.navCtrl.popToRoot();
          //  this.showToast("Successfully updated location====");
        })
      .catch((err: any) => {
          // return new Response('Unable to save profile at this time, please try again later.');
          var error="error=="+err;
          // this.showToast(error);
      });
  }
  


googleLogin(): Promise<any> {
  return this.googlePlus.login({
    'webClientId': 'application.rsdc.com',
    'offline': true
  }).then( response => {

    console.log("response======="+response);
    const googleCredential = firebase.auth.GoogleAuthProvider
    .credential(response.idToken);
    console.log("crede======="+googleCredential);
      firebase.auth().signInWithCredential(googleCredential)
        .then( success => { 

          alert("Firebase success: " + JSON.stringify(success));
          console.log("Firebase success: " + JSON.stringify(success)); 

          // alert("Firebase success: " + JSON.stringify(success))
        });

    }).catch((error) => {
      alert("Error===="+error);
      console.log("error1222222==="+ JSON.stringify(error))
      // alert("error1222222==="+error);
    });
  }  

}

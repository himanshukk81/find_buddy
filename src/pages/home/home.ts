import { Component } from '@angular/core';
import { NavController,Events,Platform } from 'ionic-angular';
import { LocationTrackerProvider } from '../../../providers/location-tracker';
import {LatLngBounds,GoogleMaps,LatLng, GoogleMap,GoogleMapsEvent,GoogleMapOptions,CameraPosition,MarkerOptions,Marker } from '@ionic-native/google-maps';
import { SessionService } from '../../app/sessionservice';
import { AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database-deprecated';
import { first } from 'rxjs/operators/first';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentLocation:any={};
  map: GoogleMap;
  markers:any=[];
  firstLoad:boolean=false;
  currentLocationFetching:boolean=false;
  constructor(public db:AngularFireDatabase, public service:SessionService,public platform:Platform,public events:Events,public navCtrl: NavController,public locationTracker:LocationTrackerProvider) {
    
  }

  ionViewDidLoad()
  {
    // setTimeout(() => {  
    //   this.locationTracker.startTracking()
    // },100);



    this.platform.ready().then(() => {

      if(!this.firstLoad)
      {
        this.loadMap();
        this.firstLoad=true;
      }

    })    
    this.events.unsubscribe('fetch:location:success')
    this.events.subscribe('fetch:location:success', location => {

      console.log("current location===="+JSON.stringify(location));
      this.currentLocation.lat=location.latitude;
      this.currentLocation.lng=location.longitude;
      this.currentLocationFetching=true;
      var dest = new LatLng(this.currentLocation.lat,this.currentLocation.lng);
      if(this.markers.length>0)
      {
        this.markers[0].setPosition(dest);
      }

      setTimeout(()=>{
        // this.updateUser()
      },500)
      
    })


    this.events.unsubscribe('location:enabled')
    this.events.subscribe('location:enabled', location => {
     console.log("Markers=="+JSON.stringify(this.markers));
     if(!this.currentLocationFetching)
     {
      if(this.markers.length>0)
      {
        this.locationTracker.startTracking()
      }
      else
      {
        setTimeout(()=>{
          console.log("Fetching location without marker define");
          this.locationTracker.startTracking()
        },10000)
      }
     }
  
    })

  }



  updateUser()
  {
      var user=this.service.getUser();
      user.latitude=this.currentLocation.lat;
      user.longitude=this.currentLocation.lng;

      // this.db.object('/user_detail/'+user.$key).update(this.user);

       console.log("User location 0003330330303033"+JSON.stringify(user));
      this.db.object('/user_detail/'+user.$key).update(user).then((profile: any) => {
           console.log("Successfully updated location===="+JSON.stringify(user));          
        })
      .catch((err: any) => {
          // return new Response('Unable to save profile at this time, please try again later.');
          var error="error=="+err;
          console.log("Error While update location===="+err);          

          // this.showToast(error);
      });
  }
  loadMap()
  {    
        console.log("Map loading===");
        this.currentLocation.lat=28.459497;
        this.currentLocation.lng=77.026638;
        // console.log("============> 12"+this.lat+" ---- "+this.lng);
        let mapOptions: GoogleMapOptions = {
          camera: {
            target: {
              lat:this.currentLocation.lat,
              lng:this.currentLocation.lng
            },
            zoom: 9,
            tilt: 30
          }
        };
        this.map = GoogleMaps.create('map', mapOptions);
        // alert("Map==="+this.map);

        console.log("Map is ready now");
        // Wait the MAP_READY before using any methods.
        this.map.one(GoogleMapsEvent.MAP_READY)
          .then(() => {

            console.log("Map is ready fo task");
            this.addMarker(this.currentLocation,"Me","red")

            setTimeout(()=>{
              console.log("Fetching Current location after 6 second");
              this.locationTracker.startTracking()
            },6000)
            
            console.log('Marker added');
          }).catch((error)=>{
            console.log("Map is not ready=="+error);
             alert("Map is not ready!="+error);
          });
  }

  addMarker(location,title,iconColor)
  {
    console.log("location===="+location +"title==="+title +"color==="+iconColor);
    console.log("Adding marker===");
    this.map.addMarker({
      title: title,
      icon: iconColor,
      animation: 'DROP',
      position: {
        lat:location.lat,
        lng:location.lng
      }
    }).then(marker => {
        console.log("marker====="+JSON.stringify(marker));
        console.log("marker position==="+marker.getPosition())

        this.markers.push(marker);
        }).catch((err: any) => {
          var  error="error marker=="+err;
          console.log("Error==="+error);
          // alert(error);
      });
  }



}

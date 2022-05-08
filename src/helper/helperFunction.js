import {showMessage} from 'react-native-flash-message';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const cords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position?.coords?.heading,
        };
        resolve(cords);
      },
      (error) => {
        reject(error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });

  export const locationPermissions = () => {
    //   console.log({OSjkbh: Platform.OS});
    
      return new Promise(async (resolve, reject) => {
        if (Platform.OS === 'ios') {
          try {
            const permissionStatus = await Geolocation.requestAuthorization(
              'whenInUse',
            );
            if (permissionStatus === 'granted') {
              resolve('granted');
            }
            reject('Permission not granted');
          } catch (error) {
            reject(error);
          }
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          )
            .then(granted => {
              if (granted == PermissionsAndroid.RESULTS.GRANTED) {
                resolve('granted');
              }
              reject('Location Permission denied');
            })
            .catch(error => {
              console.log('Ask Location permission error: ', error);
              reject(error);
            });
        }
      });
    };

const showError = (message) => {
  showMessage({
    message,
    type: 'danger',
    icon: 'danger',
  });
};

const showSuccess = (message) => {
  showMessage({
    message,
    type: 'success',
    icon: 'success',
  });
};

export {showError, showSuccess};

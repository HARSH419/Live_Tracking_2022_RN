import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  useCallback,
  Platform,
} from 'react-native';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import imagePath from '../constants/imagePath';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../components/Loader';
import {getCurrentLocation, locationPermissions} from '../helper/helperFunction';
import Geolocation from 'react-native-geolocation-service';
import database from '@react-native-firebase/database';
import useWindowDimensions from 'react-native/Libraries/Utilities/useWindowDimensions';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Home = ({navigation}) => {
  const mapRef = useRef();
  const markerRef = useRef();

  const [state, setState] = useState({
    curLoc: {
      latitude: 30.7046,
      longitude: 77.1025,
    },
    destinationCords: {},
    isLoading: true,
    coordinate: new AnimatedRegion({
      latitude: 30.7046,
      longitude: 77.1025,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    time: 0,
    distance: 0,
    heading: 0,
  });

  const {
    curLoc,
    time,
    distance,
    destinationCords,
    isLoading,
    coordinate,
    heading,
  } = state;
  const updateState = data => setState(state => ({...state, ...data}));

  const watchCurrentLocation = async () => {
    const locPermissionDenied = await locationPermissions();
    // console.log({});
    if (locPermissionDenied) {
      Geolocation.watchPosition(
        position => {
          console.log('watch men');
          // const cords = {
          let latitude = position.coords.latitude;
          let longitude = position.coords.longitude;
          let heading = position?.coords?.heading;
          // };
          animate(latitude, longitude);
          console.log({latitude, longitude, heading});
          setState(data => ({
            ...data,
            heading: heading,
            isLoading: false,
            curLoc: {latitude, longitude},
            coordinate: new AnimatedRegion({
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }),
            destinationCords: {...data.destinationCords},
          }));
          database()
            .ref('/location/123458')
            .update({
              longitude,
              latitude,
            })
            .then(() => console.log('Data updated...'))
            .catch((err)=>{console.log('Error in Firebase Data updated.',err)})
        },
        error => {
          console.log(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
  };

  const getLiveLocation = async from => {
    const locPermissionDenied = await locationPermission();
    if (locPermissionDenied) {
      // console
      const {latitude, longitude, heading} = await getCurrentLocation();
      console.log('get live location after 4 second', latitude, longitude);
      if (!from) animate(latitude, longitude);
      setState(data => ({
        ...data,
        heading: heading,
        isLoading: false,
        curLoc: {latitude, longitude},
        coordinate: new AnimatedRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }),
        destinationCords: {...data.destinationCords},
      }));
    }
  };

  useEffect(() => {
    // updateState({
    //   ...state,
    //   isLoading: true,
    // });
    watchCurrentLocation();
    // const newReference = database().ref('/location').push();

    // console.log('Auto generated key: ', newReference.key);

    // newReference
    //   .set({
    //     ...state?.curLoc
    //   })
    //   .then(() => console.log('Data updated.'));
    database()
      .ref('/location/123458')
      .on('value', snapshot => {
        console.log('User data: ', snapshot.val());
      });
  }, []);

  // console.log({state});

  // useEffect(() => {
  //   let interval;
  //   if (state?.heading !== 0) {
  //     interval = setTimeout(() => {
  //       getLiveLocation('do');
  //     }, 6000);
  //   }
  //   return () => clearInterval(interval);
  // }, [state]);

  const onPressLocation = () => {
    navigation.navigate('chooseLocation', {getCordinates: fetchValue});
  };
  const fetchValue = data => {
    console.log('this is data', data);
    updateState({
      destinationCords: {
        latitude: data.destinationCords.latitude,
        longitude: data.destinationCords.longitude,
      },
    });
  };

  const animate = (latitude, longitude) => {
    const newCoordinate = {latitude, longitude};
    if (Platform.OS == 'android') {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 500);
      }
    } else {
      coordinate.timing(newCoordinate).start();
    }
  };

  const onCenter = () => {
    mapRef.current.animateToRegion({
      latitude: curLoc.latitude,
      longitude: curLoc.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  console.log({dimesion: useWindowDimensions()});


  const fetchTime = (d, t) => {
    updateState({
      distance: d,
      time: t,
    });
  };

  // console.log({animateMarkerToCoordinate: markerRef.current.animateMarkerToCoordinate});

  return (
    <>
      {state.isLoading ? (
        <Loader isLoading={isLoading} />
      ) : (
        <View style={styles.container}>
          {distance !== 0 && time !== 0 && (
            <View style={{alignItems: 'center', marginVertical: 16}}>
              <Text>Time left: {time.toFixed(0)} Km </Text>
              <Text>Distance left: {distance.toFixed(0)} min</Text>
            </View>
          )}
          <View style={{flex: 1}}>
            <MapView
              ref={mapRef}
              style={[StyleSheet.absoluteFill]}
              initialRegion={{
                ...curLoc,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}>
              <Marker.Animated ref={markerRef} coordinate={coordinate}>
                <Image
                  source={imagePath.icBike}
                  style={{
                    width: 40,
                    height: 40,
                    transform: [{rotate: `${heading}deg`}],
                  }}
                  resizeMode="contain"
                />
              </Marker.Animated>

              {Object.keys(destinationCords).length > 0 && (
                <Marker
                  coordinate={destinationCords}
                  image={imagePath.icGreenMarker}
                />
              )}

              {Object.keys(destinationCords).length > 0 && (
                <MapViewDirections
                  origin={curLoc}
                  destination={destinationCords}
                  apikey={"YOUR API KEY"}
                  strokeWidth={3}
                  strokeColor="black"
                  optimizeWaypoints={true}
                  onStart={params => {
                    console.log(
                      `Started routing between "${params.origin}" and "${params.destination}"`,
                    );
                  }}
                  onReady={result => {
                    console.log(`Distance: ${result.distance} km`);
                    console.log(`Duration: ${result.duration} min`);
                    fetchTime(result.distance, result.duration),
                      mapRef.current.fitToCoordinates(result.coordinates, {
                        edgePadding: {
                          // right: 30,
                          // bottom: 300,
                          // left: 30,
                          // top: 100,
                        },
                      });
                  }}
                  onError={errorMessage => {
                    // console.log('GOT AN ERROR');
                  }}
                />
              )}
            </MapView>
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
              onPress={onCenter}>
              <Image source={imagePath.greenIndicator} />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomCard}>
            <Text>Where are you going..?</Text>
            <TouchableOpacity
              onPress={onPressLocation}
              style={styles.inpuStyle}>
              <Text>Choose your location</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  inpuStyle: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default Home;

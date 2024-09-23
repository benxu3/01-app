import * as React from 'react';
import {
  View,
  FlatList,
  ListRenderItem,
  ViewStyle
} from 'react-native';
import {
  useTracks,
  TrackReferenceOrPlaceholder,
  VideoTrack,
  isTrackReference,
} from '@livekit/react-native';
import { Track } from 'livekit-client';



export const VideoFeed = () => {
    // Get all camera tracks.
    const tracks = useTracks([Track.Source.Camera]);
  
    const renderTrack: ListRenderItem<TrackReferenceOrPlaceholder> = ({item}) => {
      // Render using the VideoTrack component.
      if(isTrackReference(item)) {
        return (<VideoTrack trackRef={item} style={$participantView} />)
      } else {
        return (<View style={$participantView} />)
      }
    };
  
    return (
      <View style={$container}>
        <FlatList
          data={tracks}
          renderItem={renderTrack}
        />
      </View>
    );
  };
  
const $container: ViewStyle = {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
};

const $participantView: ViewStyle = {
    height: 300,
};

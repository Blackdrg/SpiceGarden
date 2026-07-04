import React from 'react';
import { View, Image as RNImage, ImageProps as RNImageProps } from 'react-native';

const Image = (props: RNImageProps) => {
  return <RNImage {...props} />;
};

export default Image;

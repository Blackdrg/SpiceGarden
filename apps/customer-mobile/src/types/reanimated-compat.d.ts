declare module 'react-native-reanimated/lib/typescript/Animated' {
  export class Value<T> {
    constructor(value: T);
  }

  export interface TimingConfig {
    toValue: number;
    duration?: number;
    easing?: any;
    useNativeDriver?: boolean;
  }

  export interface TimingAnimation {
    start(): void;
  }

  export function timing(node: Animated.Value<number>, config: Animated.TimingConfig): Animated.TimingAnimation;
  export function sequence(animations: Animated.TimingAnimation[]): Animated.TimingAnimation;
  export function parallel(animations: Animated.TimingAnimation[]): Animated.TimingAnimation;
}

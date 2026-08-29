import { useEffect, useState } from 'react';

import { Keyboard, Platform } from 'react-native';

export const useKeyboardOffset = () => {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOffset(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardOffset;
};

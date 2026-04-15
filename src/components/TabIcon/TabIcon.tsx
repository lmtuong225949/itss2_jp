import React from 'react';
import { Text } from 'react-native';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color, size }) => {
  const getIcon = () => {
    switch (name) {
      case 'home':
        return focused ? '🏠' : '🏡';
      case 'user':
        return focused ? '👤' : '👤';
      case 'map':
        return focused ? '🗺' : '🗺';
      case 'search':
        return focused ? '🔍' : '🔍';
      case 'settings':
        return focused ? '⚙️' : '⚙️';
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {getIcon()}
    </Text>
  );
};

export default TabIcon;

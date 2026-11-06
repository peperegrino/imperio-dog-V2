import Svg, { Path } from 'react-native-svg';

import { styles } from './styles';

export default function CheckIcon({ size = 17, color = '#FFFFFF' }) {
  return (
    <Svg height={size} style={styles.icon} viewBox="0 0 20 20" width={size}>
      {/* TODO: replace with src/assets/icons/check.svg if the exported Figma icon is provided. */}
      <Path
        d="M4.5 10.2L8.3 14L15.7 6.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </Svg>
  );
}
